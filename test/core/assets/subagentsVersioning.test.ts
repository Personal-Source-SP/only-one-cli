import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

import { SUBAGENTS } from '../../../assets/agents/subagents/index';
import { bumpAssetManifestVersion, normalizeAssetType, resolveAssetManifestFilePath } from '../../../src/core/assets/bump';
import { readInstalledLockfile, recordInstalledAssetsBatch } from '../../../src/core/assets/lockfile';
import { inspectAssetUpdates } from '../../../src/core/assets/sync';

describe('Subagents Asset Management & Versioning', () => {
    const testDir = join(process.cwd(), 'temp-test-subagent-lockfile');

    afterAll(() => {
        if (existsSync(testDir)) {
            rmSync(testDir, { recursive: true, force: true });
        }
    });

    it('should export SUBAGENTS manifest with exactly 4 valid entries', () => {
        expect(SUBAGENTS).toBeDefined();
        expect(SUBAGENTS).toHaveLength(4);
        const ids = SUBAGENTS.map((s) => s.id);

        expect(ids).toContain('terminal-runner');
        expect(ids).toContain('browser-tester');
        expect(ids).toContain('api-tester');
        expect(ids).toContain('codebase-scout');

        for (const s of SUBAGENTS) {
            expect(s.version).toMatch(/^\d+\.\d+\.\d+$/);
            expect(s.sourceFile).toMatch(/\.md$/);
            expect(s.supportedTargets.length).toBeGreaterThan(0);
        }
    });

    it('should normalize subagent asset type correctly', () => {
        expect(normalizeAssetType('subagent')).toBe('subagents');
        expect(normalizeAssetType('subagents')).toBe('subagents');
        expect(normalizeAssetType('SUBAGENT ')).toBe('subagents');
    });

    it('should resolve correct manifest path for subagents in assets/agents/subagents', () => {
        const filePath = resolveAssetManifestFilePath('subagents');

        expect(filePath.replace(/\\/g, '/')).toContain('assets/agents/subagents/index.ts');
        expect(existsSync(filePath)).toBe(true);
    });

    it('should record subagents in lockfile and retrieve version record', async () => {
        await recordInstalledAssetsBatch(
            testDir,
            [
                {
                    type: 'subagents',
                    id: 'terminal-runner',
                    version: '0.0.1',
                },
            ],
            false,
        );

        const lockfile = await readInstalledLockfile(testDir, false);

        expect(lockfile.installed.subagents).toBeDefined();
        expect(lockfile.installed.subagents!['terminal-runner']).toBeDefined();
        expect(lockfile.installed.subagents!['terminal-runner'].version).toBe('0.0.1');
    });

    it('should throw when bumping unknown subagent', async () => {
        await expect(bumpAssetManifestVersion('subagent', 'non-existent-subagent')).rejects.toThrow(/not found in manifest/i);
    });

    it('should inspect subagent updates and report status based on manifest version', async () => {
        const { inspected } = await inspectAssetUpdates(testDir, false);
        const subagentItem = inspected.find((u) => u.type === 'subagents' && u.id === 'terminal-runner');

        expect(subagentItem).toBeDefined();
        expect(subagentItem?.status).toBe('up-to-date');
    });
});
