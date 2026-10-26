import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import yaml from 'js-yaml';

export interface PlanValidationResult {
    valid: boolean;
    taskCount: number;
    errors: string[];
    warnings: string[];
}

export function validatePlan(content: string): PlanValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const fmMatch = content.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/);
    if (!fmMatch) {
        errors.push('Missing YAML frontmatter in plan.md');
    } else {
        try {
            const fm: any = yaml.load(fmMatch[1]);
            if (!fm?.slug) errors.push('Frontmatter missing slug');
            if (!fm?.status) errors.push('Frontmatter missing status');
        } catch (e: any) {
            errors.push(`Invalid YAML frontmatter: ${e.message}`);
        }
    }

    const s1Index = content.indexOf('## Section 1. Directory Structure Changes');
    const s15Index = content.indexOf('## Section 1.5. Story Board');
    const s2Index = content.indexOf('## Section 2. File Changes');
    const s3Index = content.lastIndexOf('## Section 3. Test Cases & Verification');

    if (s1Index === -1) {
        errors.push('Missing ## Section 1. Directory Structure Changes');
    }
    if (s15Index === -1) {
        errors.push('Missing ## Section 1.5. Story Board');
    } else if (s2Index !== -1 && s2Index > s15Index) {
        const s15Content = content.slice(s15Index, s2Index);
        const storyMatches = [...s15Content.matchAll(/^### Story \d+:?[^\r\n]+/gm)];
        if (storyMatches.length === 0) {
            warnings.push('Section 1.5 Story Board contains zero story scenarios');
        } else {
            storyMatches.forEach((sMatch, sIdx) => {
                const sHeader = sMatch[0];
                const sContent = s15Content.slice(sMatch.index);
                const nextStory = sContent.slice(sHeader.length).search(/^### Story \d+:/m);
                const singleStory = nextStory !== -1 ? sContent.slice(0, sHeader.length + nextStory) : sContent;
                if (!/```(mermaid|text)/i.test(singleStory)) {
                    warnings.push(`Story ${sIdx + 1}: Missing flow/state diagram in storyboard`);
                }
            });
        }
    }
    if (s2Index === -1) {
        errors.push('Missing ## Section 2. File Changes');
    }
    if (s3Index === -1) {
        errors.push('Missing ## Section 3. Test Cases & Verification');
    }

    const s2Content = s2Index !== -1 && s3Index !== -1 && s3Index > s2Index ? content.slice(s2Index, s3Index) : '';
    const taskBlockRegex = /^### \d+\.\s*`?\[(NEW|MODIFY|DELETE|RENAME)\]`?\s*`?([^`\r\n]+)`?/gm;
    const taskMatches = [...s2Content.matchAll(taskBlockRegex)];
    const taskCount = taskMatches.length;

    if (taskCount === 0) {
        errors.push('Section 2 contains zero machine-readable file task blocks');
    }

    const testFileRegex = /(\.test\.|\.spec\.|_test\.)/;

    taskMatches.forEach((match, idx) => {
        const filePath = match[2].trim();
        const startIdx = match.index!;
        const endIdx = idx + 1 < taskMatches.length ? taskMatches[idx + 1].index! : s2Content.length;
        const singleBlock = s2Content.slice(startIdx, endIdx);

        if (!/-\s*\*\*Status\*\*:/i.test(singleBlock)) warnings.push(`Task ${idx + 1} (${filePath}): Missing Status`);
        if (!/-\s*\*\*Depends On\*\*:/i.test(singleBlock)) warnings.push(`Task ${idx + 1} (${filePath}): Missing Depends On`);

        const taskTypeMatch = singleBlock.match(/-\s*\*\*Task Type\*\*:\s*`?(code|non-code)`?/i);
        if (!taskTypeMatch) {
            errors.push(`Task ${idx + 1} (${filePath}): Missing or invalid Task Type (must be 'code' or 'non-code')`);
        } else {
            const taskType = taskTypeMatch[1].toLowerCase();
            const fastTestMatch = singleBlock.match(/-\s*\*\*Fast Test Command\*\*:\s*`?([^`\r\n]+)`?/i);
            const fastTestCmd = fastTestMatch ? fastTestMatch[1].trim() : '';

            if (taskType === 'code') {
                if (!fastTestCmd || /^none/i.test(fastTestCmd)) {
                    errors.push(`Task ${idx + 1} (${filePath}): Code tasks must specify an executable Fast Test Command`);
                }
                if (testFileRegex.test(filePath)) {
                    const hasHappyPath = /Happy Path/i.test(singleBlock);
                    const hasEdgeCases = /(Boundary|Edge Cases)/i.test(singleBlock);
                    const hasErrorHandling = /(Failure|Error Handling)/i.test(singleBlock);
                    if (!hasHappyPath || !hasEdgeCases || !hasErrorHandling) {
                        warnings.push(`Task ${idx + 1} (${filePath}): Test file should declare full Test Matrix (Happy Path, Boundary/Edge Cases, Failure/Error Handling)`);
                    }
                }
            } else if (taskType === 'non-code') {
                if (testFileRegex.test(filePath)) {
                    errors.push(`Task ${idx + 1} (${filePath}): Non-code tasks must not target test files`);
                }
                if (fastTestCmd && !/^none/i.test(fastTestCmd)) {
                    errors.push(`Task ${idx + 1} (${filePath}): Non-code tasks must set Fast Test Command to 'None (Non-code task)'`);
                }
            }
        }

        if (!/-\s*\*\*Fast Test Command\*\*:/i.test(singleBlock)) warnings.push(`Task ${idx + 1} (${filePath}): Missing Fast Test Command`);
        if (!/```diff[\s\S]*?```/i.test(singleBlock)) errors.push(`Task ${idx + 1} (${filePath}): Missing Git Unified Diff block`);
    });

    return {
        valid: errors.length === 0,
        taskCount,
        errors,
        warnings,
    };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename || '')) {
    const planPath = process.argv[2];
    if (!planPath || !existsSync(planPath)) {
        console.error('Usage: npx tsx validate-plan.ts <path-to-plan.md>');
        process.exit(1);
    }
    const result = validatePlan(readFileSync(planPath, 'utf8'));
    console.log(JSON.stringify(result, null, 2));
    if (!result.valid) process.exit(1);
}
