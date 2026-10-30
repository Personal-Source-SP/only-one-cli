import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
    ONLY_ONE_LOCKFILE_NAME,
    readInstalledLockfile,
    recordInstalledAssetsBatch,
    removeInstalledAsset,
    resolveInstalledLockfilePath,
} from '@/core/assets/lockfile.js';

describe('Assets Lockfile Management', () => {
    it('resolves default lockfile path to only-one/installed.json', () => {
        const dummyDir = '/tmp/test-project';
        expect(resolveInstalledLockfilePath(dummyDir)).toBe(join(dummyDir, 'only-one', ONLY_ONE_LOCKFILE_NAME));
    });

    it('resolves global lockfile path to .only-one/installed.json when isGlobal is true', () => {
        const dummyHome = '/home/user';
        expect(resolveInstalledLockfilePath(dummyHome, true)).toBe(join(dummyHome, '.only-one', ONLY_ONE_LOCKFILE_NAME));
    });

    it('records global assets into .only-one/installed.json without touching local only-one dir', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'asset-lock-global-'));

        try {
            await recordInstalledAssetsBatch(cwd, [{ type: 'skills', id: 'c4-diagrams', version: '0.0.1' }], true);

            const globalLockPath = resolveInstalledLockfilePath(cwd, true);
            expect(existsSync(globalLockPath)).toBe(true);
            expect(existsSync(join(cwd, 'only-one'))).toBe(false);

            const state = await readInstalledLockfile(cwd, true);
            expect(state.installed.skills?.['c4-diagrams']?.version).toBe('0.0.1');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('returns an empty state when lockfile does not exist', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'asset-lock-'));

        try {
            const state = await readInstalledLockfile(cwd);
            expect(state.schemaVersion).toBe(1);
            expect(state.installed).toEqual({});
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('records installed assets and updates lockfile atomically in only-one/installed.json', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'asset-lock-'));

        try {
            await recordInstalledAssetsBatch(cwd, [
                { type: 'rules', id: 'next-architecture-stack', version: '0.0.1' },
                { type: 'skills', id: 'c4-diagrams', version: '0.0.1' },
            ]);

            const lockPath = resolveInstalledLockfilePath(cwd);
            expect(lockPath).toBe(join(cwd, 'only-one', ONLY_ONE_LOCKFILE_NAME));
            expect(existsSync(lockPath)).toBe(true);
            expect(existsSync(join(cwd, '.only-one'))).toBe(false);

            const state = await readInstalledLockfile(cwd);
            expect(state.installed.rules?.['next-architecture-stack']?.version).toBe('0.0.1');
            expect(state.installed.skills?.['c4-diagrams']?.version).toBe('0.0.1');
            expect(state.installed.rules?.['next-architecture-stack']?.installedAt).toBeDefined();

            // Bump version
            await recordInstalledAssetsBatch(cwd, [{ type: 'rules', id: 'next-architecture-stack', version: '0.0.2' }]);

            const updated = await readInstalledLockfile(cwd);
            expect(updated.installed.rules?.['next-architecture-stack']?.version).toBe('0.0.2');
            expect(updated.installed.skills?.['c4-diagrams']?.version).toBe('0.0.1');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('auto-migrates legacy installed.workflows to installed.skills', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'asset-lock-legacy-'));

        try {
            const lockPath = resolveInstalledLockfilePath(cwd);
            await mkdir(dirname(lockPath), { recursive: true });
            const legacyState = {
                schemaVersion: 1,
                updatedAt: new Date().toISOString(),
                installed: {
                    workflows: {
                        'only-one-idea': { version: '0.0.1', installedAt: new Date().toISOString() },
                    },
                },
            };
            await writeFile(lockPath, JSON.stringify(legacyState, null, 2), 'utf-8');

            const state = await readInstalledLockfile(cwd);
            expect(state.installed.skills?.['only-one-idea']?.version).toBe('0.0.1');
            expect((state.installed as any).workflows).toBeUndefined();
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('removes an installed asset from lockfile', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'asset-lock-'));

        try {
            await recordInstalledAssetsBatch(cwd, [{ type: 'rules', id: 'next-architecture-stack', version: '0.0.1' }]);

            let state = await readInstalledLockfile(cwd);
            expect(state.installed.rules?.['next-architecture-stack']).toBeDefined();

            await removeInstalledAsset(cwd, 'rules', 'next-architecture-stack');
            state = await readInstalledLockfile(cwd);
            expect(state.installed.rules?.['next-architecture-stack']).toBeUndefined();
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});
