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

    if (!/## Section 1\.\s*Directory Structure Changes/i.test(content)) {
        errors.push('Missing ## Section 1. Directory Structure Changes');
    }
    if (!/## Section 2\.\s*File Changes/i.test(content)) {
        errors.push('Missing ## Section 2. File Changes');
    }
    if (!/## Section 3\.\s*Test Cases & Verification/i.test(content)) {
        errors.push('Missing ## Section 3. Test Cases & Verification');
    }

    const taskBlockRegex = /### \d+\.\s*`?\[(NEW|MODIFY|DELETE|RENAME)\]`?\s*`?([^`\r\n]+)`?/g;
    const taskMatches = [...content.matchAll(taskBlockRegex)];
    const taskCount = taskMatches.length;

    if (taskCount === 0) {
        errors.push('Section 2 contains zero machine-readable file task blocks');
    }

    taskMatches.forEach((match, idx) => {
        const blockHeader = match[0];
        const blockContent = content.slice(match.index);
        const nextBlock = blockContent.slice(blockHeader.length).search(/### \d+\.\s*`?\[(NEW|MODIFY|DELETE|RENAME)\]`?/);
        const singleBlock = nextBlock !== -1 ? blockContent.slice(0, blockHeader.length + nextBlock) : blockContent;

        if (!/-\s*\*\*Status\*\*:/i.test(singleBlock)) warnings.push(`Task ${idx + 1} (${match[2]}): Missing Status`);
        if (!/-\s*\*\*Depends On\*\*:/i.test(singleBlock)) warnings.push(`Task ${idx + 1} (${match[2]}): Missing Depends On`);
        if (!/-\s*\*\*Fast Test Command\*\*:/i.test(singleBlock)) warnings.push(`Task ${idx + 1} (${match[2]}): Missing Fast Test Command`);
        if (!/```diff[\s\S]*?```/i.test(singleBlock)) errors.push(`Task ${idx + 1} (${match[2]}): Missing Git Unified Diff block`);
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
