import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

export interface ConflictFile {
    filePath: string;
    hunkCount: number;
    lines: number[];
}

export function scanGitConflicts(dirPath: string): ConflictFile[] {
    const results: ConflictFile[] = [];
    const ignoreDirs = new Set(['.git', 'node_modules', 'dist', 'build', '.cache']);

    function traverse(currentDir: string) {
        let entries: string[] = [];
        try {
            entries = readdirSync(currentDir);
        } catch {
            return;
        }

        for (const entry of entries) {
            if (ignoreDirs.has(entry)) continue;
            const fullPath = join(currentDir, entry);
            let stat;
            try {
                stat = statSync(fullPath);
            } catch {
                continue;
            }

            if (stat.isDirectory()) {
                traverse(fullPath);
            } else if (stat.isFile() && stat.size < 1024 * 1024) {
                try {
                    const content = readFileSync(fullPath, 'utf8');
                    if (content.includes('<<<<<<<')) {
                        const lines: number[] = [];
                        content.split('\n').forEach((l, idx) => {
                            if (l.startsWith('<<<<<<<')) lines.push(idx + 1);
                        });
                        if (lines.length > 0) results.push({ filePath: fullPath, hunkCount: lines.length, lines });
                    }
                } catch {}
            }
        }
    }

    traverse(dirPath);
    return results;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename || '')) {
    const target = process.argv[2] || process.cwd();
    const conflicts = scanGitConflicts(target);
    console.log(JSON.stringify(conflicts, null, 2));
}
