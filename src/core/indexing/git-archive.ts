import { execFileSync } from 'node:child_process';
import { statSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';

const MAX_ARCHIVE_SIZE = 100 * 1024 * 1024; // 100MB

export interface ArchiveResult {
    zipPath: string;
    sizeBytes: number;
}

export function createArchive(repoPath: string): ArchiveResult {
    const zipPath = join(tmpdir(), `only-one-cli-${randomUUID()}.zip`);

    execFileSync('git', ['archive', '--format=zip', 'HEAD', `--output=${zipPath}`], {
        cwd: repoPath,
        stdio: 'pipe',
        timeout: 120_000, // 2 minute timeout
    });

    const sizeBytes = statSync(zipPath).size;
    return { zipPath, sizeBytes };
}

export function isOversized(sizeBytes: number): boolean {
    return sizeBytes > MAX_ARCHIVE_SIZE;
}

export function cleanupArchive(zipPath: string): void {
    try {
        unlinkSync(zipPath);
    } catch {
        // already cleaned or not existing
    }
}
