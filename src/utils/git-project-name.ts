import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const normalizeRepoPath = (value: string): string => {
    return value
        .replace(/\.git$/i, '')
        .replace(/^\/+/, '')
        .trim();
};

/** Parse git remote URLs into `organization/repository` form. */
export const parseGitRemoteUrl = (remoteUrl: string): string | null => {
    const trimmed = remoteUrl.trim();
    if (!trimmed) {
        return null;
    }

    const scpMatch = trimmed.match(/^[^@]+@[^:]+:(.+)$/);
    if (scpMatch?.[1]) {
        return normalizeRepoPath(scpMatch[1]);
    }

    try {
        const parsed = new URL(trimmed);
        const segments = parsed.pathname.split('/').filter(Boolean);
        if (segments.length >= 2) {
            const repo = segments.at(-1);
            const organization = segments.at(-2);
            if (organization && repo) {
                return normalizeRepoPath(`${organization}/${repo}`);
            }
        }
    } catch {
        return null;
    }

    return null;
};

export const resolveGitProjectName = async (cwd: string): Promise<string | null> => {
    try {
        const { stdout } = await execFileAsync('git', ['config', '--get', 'remote.origin.url'], {
            cwd,
            timeout: 5000,
        });
        return parseGitRemoteUrl(stdout);
    } catch {
        return null;
    }
};
