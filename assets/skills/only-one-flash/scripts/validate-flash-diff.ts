import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface FlashDiffResult {
    valid: boolean;
    addedLines: number;
    deletedLines: number;
    totalChanged: number;
    message: string;
}

export function validateFlashDiff(diffText: string): FlashDiffResult {
    const lines = diffText.split('\n');
    let added = 0;
    let deleted = 0;

    for (const line of lines) {
        if (line.startsWith('+') && !line.startsWith('+++')) added++;
        if (line.startsWith('-') && !line.startsWith('---')) deleted++;
    }

    const total = added + deleted;
    const valid = total <= 100;

    return {
        valid,
        addedLines: added,
        deletedLines: deleted,
        totalChanged: total,
        message: valid ? `Diff within flash limit (${total} <= 100 lines)` : `Diff exceeds flash limit (${total} > 100 lines)`,
    };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename || '')) {
    const target = process.argv[2];
    const content = target && existsSync(target) ? readFileSync(target, 'utf8') : '';
    console.log(JSON.stringify(validateFlashDiff(content), null, 2));
}
