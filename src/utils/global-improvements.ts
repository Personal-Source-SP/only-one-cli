import { execSync } from 'node:child_process';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';
import { inferName } from './repo-name.js';

/** Trả về đường dẫn kho improvements toàn cục hoặc thư mục con theo repo. */
export function getGlobalImprovementsDir(repoName?: string): string {
    const base = join(homedir(), '.only-one', 'improvements');
    return repoName ? join(base, repoName) : base;
}

/** Kiểm tra xem danh sách target_skills có chứa kỹ năng thuộc hệ sinh thái only-one-* hay không. */
export function isOnlyOneTargetSkill(skills?: string[]): boolean {
    if (!Array.isArray(skills)) return false;
    return skills.some((s) => typeof s === 'string' && s.trim().startsWith('only-one-'));
}

/** Phân giải tên repository đồng bộ: ưu tiên Git remote origin, fallback tên thư mục gốc. */
export function resolveRepoIdentifierSync(baseDir = process.cwd()): string {
    try {
        const stdout = execSync('git config --get remote.origin.url', {
            cwd: baseDir,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
            timeout: 2000,
        }).trim();

        if (stdout) {
            const inferred = inferName(stdout);
            if (inferred && inferred !== 'remote-repo') {
                return inferred;
            }
        }
    } catch {
        // Bỏ qua lỗi Git và chuyển sang fallback thư mục
    }

    return basename(baseDir) || 'unknown-repo';
}
