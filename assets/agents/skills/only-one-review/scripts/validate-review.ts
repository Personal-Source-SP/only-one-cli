import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface ReviewValidationResult {
    valid: boolean;
    totalFindings: number;
    statusCounts: Record<string, number>;
    errors: string[];
}

export function validateReviewDoc(content: string): ReviewValidationResult {
    const errors: string[] = [];
    const findingMatches = [...content.matchAll(/### (FINDING-\d+):\s*([^\r\n]+)/g)];
    const statusCounts: Record<string, number> = {};

    findingMatches.forEach((m) => {
        const findingId = m[1];
        const blockContent = content.slice(m.index);
        const statusMatch = blockContent.match(/-\s*\*\*Status\*\*:\s*`?([A-Z_]+)`?/i);
        const status = statusMatch ? statusMatch[1].toUpperCase() : 'UNKNOWN';
        statusCounts[status] = (statusCounts[status] || 0) + 1;

        if (status === 'OPEN' || status === 'SELECTED') {
            if (!/```diff[\s\S]*?```/i.test(blockContent)) {
                errors.push(`${findingId}: Open/Selected finding missing executable unified diff`);
            }
        }
    });

    if (findingMatches.length === 0 && !content.includes('Zero actionable findings')) {
        errors.push('Review document contains no structured findings');
    }

    return {
        valid: errors.length === 0,
        totalFindings: findingMatches.length,
        statusCounts,
        errors,
    };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename || '')) {
    const target = process.argv[2];
    if (!target || !existsSync(target)) {
        console.error('Usage: npx tsx validate-review.ts <path-to-review.md>');
        process.exit(1);
    }
    const result = validateReviewDoc(readFileSync(target, 'utf8'));
    console.log(JSON.stringify(result, null, 2));
    if (!result.valid) process.exit(1);
}
