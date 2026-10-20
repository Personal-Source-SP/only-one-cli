import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import yaml from 'js-yaml';

export interface DebugValidationResult {
    valid: boolean;
    errors: string[];
}

export function validateDebugDoc(content: string): DebugValidationResult {
    const errors: string[] = [];
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

    if (!/## Section 1\.\s*Reproduction & Root Cause/i.test(content)) {
        errors.push('Missing ## Section 1. Reproduction & Root Cause');
    }
    if (!/## Section 2\.\s*File Changes/i.test(content)) {
        errors.push('Missing ## Section 2. File Changes');
    }
    if (!/## Section 3\.\s*Verification/i.test(content)) {
        errors.push('Missing ## Section 3. Verification');
    }

    return {
        valid: errors.length === 0,
        errors,
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
