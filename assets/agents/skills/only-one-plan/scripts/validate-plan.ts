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

    const s1Index = content.search(/## Section 1\.\s*Directory Structure/i);
    const sStoryIndex = content.search(/## Section (?:1\.5|2)\.\s*Story Board/i);
    const sFileIndex = content.search(/## Section (?:2|3|4)\.\s*File Changes/i);
    const sTestIndex = content.search(/## Section (?:3|4)\.\s*Test Cases/i);

    if (s1Index === -1) {
        errors.push('Missing ## Section 1. Directory Structure Changes');
    }
    if (sStoryIndex === -1) {
        errors.push('Missing ## Section 1.5. Story Board');
    } else {
        const nextHeadingIndex = Math.min(...[sFileIndex, sTestIndex].filter((idx) => idx > sStoryIndex));
        const sStoryContent = nextHeadingIndex !== Infinity ? content.slice(sStoryIndex, nextHeadingIndex) : content.slice(sStoryIndex);
        const storyMatches = [...sStoryContent.matchAll(/^### Story \d+:?[^\r\n]+/gm)];
        if (storyMatches.length === 0) {
            warnings.push('Story Board contains zero story scenarios');
        } else {
            storyMatches.forEach((sMatch, sIdx) => {
                const sHeader = sMatch[0];
                const sContent = sStoryContent.slice(sMatch.index);
                const nextStory = sContent.slice(sHeader.length).search(/^### Story \d+:/m);
                const singleStory = nextStory !== -1 ? sContent.slice(0, sHeader.length + nextStory) : sContent;
                if (!/```(mermaid|text)/i.test(singleStory)) {
                    warnings.push(`Story ${sIdx + 1}: Missing flow/state diagram in storyboard`);
                }
            });
        }
    }
    if (sFileIndex === -1) {
        errors.push('Missing ## Section 4 (or 2/3). File Changes');
    }
    if (sTestIndex === -1) {
        errors.push('Missing ## Section 3 (or 4). Test Cases & Verification Matrix');
    } else {
        const sTestContent = sFileIndex > sTestIndex ? content.slice(sTestIndex, sFileIndex) : content.slice(sTestIndex);
        if (!/\|\s*Test ID\s*\|/i.test(sTestContent)) {
            warnings.push('Test Matrix: Missing Test Case Specification Table (| Test ID |)');
        }
    }

    const sFileContent = sFileIndex !== -1
        ? (sTestIndex > sFileIndex ? content.slice(sFileIndex, sTestIndex) : content.slice(sFileIndex))
        : '';
    const taskBlockRegex = /^### \d+\.\s*`?\[(NEW|MODIFY|DELETE|RENAME)\]`?\s*`?([^`\r\n]+)`?/gm;
    const taskMatches = [...sFileContent.matchAll(taskBlockRegex)];
    const taskCount = taskMatches.length;

    if (taskCount === 0) {
        errors.push('File Changes section contains zero machine-readable file task blocks');
    }

    const testFileRegex = /(\.test\.|\.spec\.|_test\.)/;

    taskMatches.forEach((match, idx) => {
        const filePath = match[2].trim();
        const startIdx = match.index!;
        const endIdx = idx + 1 < taskMatches.length ? taskMatches[idx + 1].index! : sFileContent.length;
        const singleBlock = sFileContent.slice(startIdx, endIdx);

        if (!/-\s*\*\*Status\*\*:/i.test(singleBlock)) warnings.push(`Task ${idx + 1} (${filePath}): Missing Status`);
        if (!/-\s*\*\*Depends On\*\*:/i.test(singleBlock)) warnings.push(`Task ${idx + 1} (${filePath}): Missing Depends On`);

        const taskTypeMatch = singleBlock.match(/-\s*\*\*Task Type\*\*:\s*`?(code|non-code)`?/i);
        if (!taskTypeMatch) {
            errors.push(`Task ${idx + 1} (${filePath}): Missing or invalid Task Type (must be 'code' or 'non-code')`);
        } else {
            const taskType = taskTypeMatch[1].toLowerCase();
            if (taskType === 'non-code') {
                if (testFileRegex.test(filePath)) {
                    errors.push(`Task ${idx + 1} (${filePath}): Non-code tasks must not target test files`);
                }
            }
        }

        if (!/```diff[\s\S]*?```/i.test(singleBlock)) errors.push(`Task ${idx + 1} (${filePath}): Missing Git Unified Diff block`);
    });

    taskMatches.forEach((match, idx) => {
        const filePath = match[2].trim();
        if (testFileRegex.test(filePath)) {
            const basePath = filePath.replace(/\.(test|spec)\./, '.').replace(/_test\./, '.');
            const codeTaskIdx = taskMatches.findIndex((m) => m[2].trim() === basePath);
            if (codeTaskIdx !== -1 && codeTaskIdx < idx) {
                errors.push(
                    `Task ${idx + 1} (${filePath}): Pragmatic TDD violation - test task must appear before code task '${basePath}' (Task ${codeTaskIdx + 1})`
                );
            }
        }
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
