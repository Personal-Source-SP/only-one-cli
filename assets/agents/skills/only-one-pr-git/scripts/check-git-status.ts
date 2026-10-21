import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

export interface GitPreflightResult {
    branch: string;
    isClean: boolean;
    uncommittedFiles: string[];
    unpushedCommits: number;
    readyForPr: boolean;
}

export function checkGitReadiness(cwd = process.cwd()): GitPreflightResult {
    try {
        const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd, encoding: 'utf8' }).trim();
        const statusOut = execSync('git status --porcelain', { cwd, encoding: 'utf8' }).trim();
        const uncommittedFiles = statusOut ? statusOut.split('\n').map((l) => l.trim()) : [];

        let unpushedCommits = 0;
        try {
            const aheadOut = execSync(`git rev-list --count @{u}..HEAD`, { cwd, encoding: 'utf8' }).trim();
            unpushedCommits = parseInt(aheadOut, 10) || 0;
        } catch {
            unpushedCommits = 0;
        }

        return {
            branch,
            isClean: uncommittedFiles.length === 0,
            uncommittedFiles,
            unpushedCommits,
            readyForPr: branch !== 'main' && branch !== 'master' && uncommittedFiles.length === 0,
        };
    } catch {
        return {
            branch: 'unknown',
            isClean: false,
            uncommittedFiles: [],
            unpushedCommits: 0,
            readyForPr: false,
        };
    }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename || '')) {
    const result = checkGitReadiness(process.cwd());
    console.log(JSON.stringify(result, null, 2));
    if (!result.readyForPr) process.exit(1);
}
