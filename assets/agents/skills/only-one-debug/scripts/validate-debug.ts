import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import yaml from 'js-yaml';

export interface DebugValidationResult {
    valid: boolean;
    taskCount: number;
    errors: string[];
    warnings: string[];
}

export function validateDebugDoc(content: string): DebugValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let taskCount = 0;
    const fmMatch = content.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/);
    if (!fmMatch) {
        errors.push('Missing frontmatter in debug.md');
    } else {
        try {
            const fm: any = yaml.load(fmMatch[1]);
            if (!fm?.status) errors.push('Frontmatter missing status');
        } catch {
            errors.push('Invalid YAML frontmatter');
        }
    }

    const s1Index = content.search(/## Section 1\.\s*(?:Diagnosis|Reproduction & Root Cause)/i);
    const sStoryIndex = content.search(/## Section (?:1\.5|2)\.\s*(?:Defect User Story|Story Board)/i);
    const sFileIndex = content.search(/## Section (?:2|3|4)\.\s*(?:Patch File Task Blocks|File Changes)/i);
    const sTestIndex = content.search(/## Section (?:3|4)\.\s*(?:Test Cases|Verification)/i);

    if (s1Index === -1) {
        errors.push('Missing ## Section 1. Diagnosis & Directory Structure Changes');
    }
    if (sFileIndex === -1) {
        errors.push('Missing ## Section 4 (or 2). File Changes');
    }
    if (!/## Section 3\.\s*Verification/i.test(content)) {
        if (sTestIndex === -1) {
            errors.push('Missing ## Section 3 (or 4). Test Cases & Verification Matrix');
        }
    }

    if (sTestIndex !== -1) {
        const nextIndex = sFileIndex > sTestIndex ? sFileIndex : content.length;
        const sTestContent = content.slice(sTestIndex, nextIndex);
        if (!/\| Test ID \|/i.test(sTestContent) && !/\| Test \|/i.test(sTestContent)) {
            warnings.push('Section 3: Missing Test Matrix table (| Test ID |)');
        }
    }

    if (sFileIndex !== -1) {
        const endOfFileIndex = sTestIndex > sFileIndex ? sTestIndex : content.length;
        const sFileContent = content.slice(sFileIndex, endOfFileIndex);
        const taskMatches = [...sFileContent.matchAll(/^### (\d+)\.\s*\[(NEW|MODIFY|DELETE)\]\s*([^\r\n]+)/gm)];
        taskCount = taskMatches.length;

        taskMatches.forEach((match, idx) => {
            const filePath = match[3].trim();
            const startIdx = match.index!;
            const endIdx = idx + 1 < taskMatches.length ? taskMatches[idx + 1].index! : sFileContent.length;
            const singleBlock = sFileContent.slice(startIdx, endIdx);

            if (!/-\s*\*\*Status\*\*:/i.test(singleBlock)) warnings.push(`Task ${idx + 1} (${filePath}): Missing Status`);
            if (!/-\s*\*\*Depends On\*\*:/i.test(singleBlock)) warnings.push(`Task ${idx + 1} (${filePath}): Missing Depends On`);
            if (!/```diff[\s\S]*?```/i.test(singleBlock)) errors.push(`Task ${idx + 1} (${filePath}): Missing Git Unified Diff block`);
        });

        const testFileRegex = /\.(test|spec)\.[tj]sx?$/i;
        taskMatches.forEach((match, idx) => {
            const filePath = match[3].trim();
            if (testFileRegex.test(filePath)) {
                const basePath = filePath.replace(/\.(test|spec)\./, '.').replace(/_test\./, '.');
                const codeTaskIdx = taskMatches.findIndex((m) => m[3].trim() === basePath);
                if (codeTaskIdx !== -1 && codeTaskIdx < idx) {
                    errors.push(
                        `Task ${idx + 1} (${filePath}): Pragmatic TDD violation - test task must appear before code task '${basePath}' (Task ${codeTaskIdx + 1})`
                    );
                }
            }
        });
    }

    return {
        valid: errors.length === 0,
        taskCount,
        errors,
        warnings,
    };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename || '')) {
    const target = process.argv[2];
    if (!target || !existsSync(target)) {
        console.error('Usage: npx tsx validate-debug.ts <path-to-debug.md>');
        process.exit(1);
    }
    const result = validateDebugDoc(readFileSync(target, 'utf8'));
    console.log(JSON.stringify(result, null, 2));
    if (!result.valid) process.exit(1);
}
