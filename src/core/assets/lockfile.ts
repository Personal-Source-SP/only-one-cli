import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { AssetType, InstalledAssetRecord, OnlyOneInstalledState } from './types.js';

export const ONLY_ONE_LOCKFILE_NAME = 'installed.json';

/**
 * Resolves the lockfile path within a target project.
 * Checks for existing files in priority:
 * 1. .only-one/installed.json
 * 2. only-one/installed.json
 * 3. Default to .only-one/installed.json
 */
export function resolveInstalledLockfilePath(projectDir: string): string {
    const dotOnlyOne = join(projectDir, '.only-one', ONLY_ONE_LOCKFILE_NAME);
    if (existsSync(dotOnlyOne)) {
        return dotOnlyOne;
    }

    const onlyOneDir = join(projectDir, 'only-one', ONLY_ONE_LOCKFILE_NAME);
    if (existsSync(onlyOneDir)) {
        return onlyOneDir;
    }

    return dotOnlyOne;
}

/**
 * Reads the installed asset lockfile from the project directory.
 * Returns a default empty state if file does not exist or fails to parse.
 */
export async function readInstalledLockfile(projectDir: string): Promise<OnlyOneInstalledState> {
    const lockPath = resolveInstalledLockfilePath(projectDir);
    if (!existsSync(lockPath)) {
        return {
            schemaVersion: 1,
            updatedAt: new Date().toISOString(),
            installed: {},
        };
    }

    try {
        const raw = await readFile(lockPath, 'utf-8');
        const parsed = JSON.parse(raw) as OnlyOneInstalledState;
        return {
            schemaVersion: 1,
            updatedAt: parsed.updatedAt || new Date().toISOString(),
            installed: parsed.installed || {},
        };
    } catch {
        return {
            schemaVersion: 1,
            updatedAt: new Date().toISOString(),
            installed: {},
        };
    }
}

/**
 * Atomically updates or records installed asset versions in the lockfile.
 */
export async function recordInstalledAssetsBatch(
    projectDir: string,
    entries: Array<{ type: AssetType; id: string; version: string; files?: string[] }>,
): Promise<void> {
    if (!entries.length) {
        return;
    }

    const state = await readInstalledLockfile(projectDir);
    const now = new Date().toISOString();

    for (const entry of entries) {
        if (!state.installed[entry.type]) {
            state.installed[entry.type] = {};
        }

        const bucket = state.installed[entry.type] as Record<string, InstalledAssetRecord>;
        const existing = bucket[entry.id];

        bucket[entry.id] = {
            version: entry.version,
            installedAt: existing?.installedAt || now,
            updatedAt: now,
            files: entry.files || existing?.files,
        };
    }

    state.updatedAt = now;

    const lockPath = resolveInstalledLockfilePath(projectDir);
    await mkdir(dirname(lockPath), { recursive: true });
    await writeFile(lockPath, JSON.stringify(state, null, 2) + '\n', 'utf-8');
}

/**
 * Removes an asset from the installed lockfile.
 */
export async function removeInstalledAsset(projectDir: string, type: AssetType, id: string): Promise<void> {
    const state = await readInstalledLockfile(projectDir);
    if (state.installed[type] && state.installed[type]![id]) {
        delete state.installed[type]![id];
        state.updatedAt = new Date().toISOString();

        const lockPath = resolveInstalledLockfilePath(projectDir);
        await mkdir(dirname(lockPath), { recursive: true });
        await writeFile(lockPath, JSON.stringify(state, null, 2) + '\n', 'utf-8');
    }
}
