import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import type { AssetType, InstalledAssetRecord, OnlyOneInstalledState } from './types.js';

export const ONLY_ONE_DIR_NAME = 'only-one';
export const ONLY_ONE_GLOBAL_DIR_NAME = '.only-one';
export const ONLY_ONE_LOCKFILE_NAME = 'installed.json';

/**
 * Resolves the lockfile path within a target project.
 * Uses only-one/installed.json as the single source of truth.
 */
export function resolveInstalledLockfilePath(projectDir: string, isGlobal = false): string {
    const dirName = isGlobal ? ONLY_ONE_GLOBAL_DIR_NAME : ONLY_ONE_DIR_NAME;

    return join(projectDir, dirName, ONLY_ONE_LOCKFILE_NAME);
}

/**
 * Reads the installed asset lockfile from the project directory.
 * Returns a default empty state if file does not exist or fails to parse.
 */
export async function readInstalledLockfile(projectDir: string, isGlobal = false): Promise<OnlyOneInstalledState> {
    const lockPath = resolveInstalledLockfilePath(projectDir, isGlobal);

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
        const installed = parsed.installed || {};
        const legacyWorkflows = (installed as any).workflows;

        if (legacyWorkflows && typeof legacyWorkflows === 'object') {
            installed.skills = installed.skills || {};

            for (const [wfName, record] of Object.entries(legacyWorkflows)) {
                if (!installed.skills[wfName]) {
                    installed.skills[wfName] = record as InstalledAssetRecord;
                }
            }

            delete (installed as any).workflows;
            await writeFile(lockPath, JSON.stringify({ ...parsed, installed }, null, 2) + '\n', 'utf-8');
        }

        return {
            schemaVersion: 1,
            updatedAt: parsed.updatedAt || new Date().toISOString(),
            installed,
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
    isGlobal = false,
): Promise<void> {
    if (!entries.length) {
        return;
    }

    const state = await readInstalledLockfile(projectDir, isGlobal);
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

    const lockPath = resolveInstalledLockfilePath(projectDir, isGlobal);
    await mkdir(dirname(lockPath), { recursive: true });
    await writeFile(lockPath, JSON.stringify(state, null, 2) + '\n', 'utf-8');
}

/**
 * Removes an asset from the installed lockfile.
 */
export async function removeInstalledAsset(projectDir: string, type: AssetType, id: string, isGlobal = false): Promise<void> {
    const state = await readInstalledLockfile(projectDir, isGlobal);

    if (state.installed[type] && state.installed[type]![id]) {
        delete state.installed[type]![id];
        state.updatedAt = new Date().toISOString();

        const lockPath = resolveInstalledLockfilePath(projectDir, isGlobal);
        await mkdir(dirname(lockPath), { recursive: true });
        await writeFile(lockPath, JSON.stringify(state, null, 2) + '\n', 'utf-8');
    }
}
