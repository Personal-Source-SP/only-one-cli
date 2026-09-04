import { describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { recordInstalledAssetsBatch } from '@/core/assets/lockfile.js';
import { inspectAssetUpdates, applyAssetUpdates, pruneAssetUpdates } from '@/core/assets/sync.js';
import { WORKFLOWS } from '@assets/workflows/index.js';
import { SKILLS } from '@assets/skills/index.js';

describe('Asset Synchronization & Reconciliation', () => {
    it('identifies up-to-date and outdated assets in target project', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'sync-test-'));
        const ideaVersion = WORKFLOWS.find((w) => w.name === 'only-one-idea')?.version ?? '0.0.1';
        const skillVersion = SKILLS.find((s) => s.name === 'c4-diagrams')?.version ?? '0.0.1';

        try {
            // Create mock files on disk
            await mkdir(join(cwd, '.agents/workflows'), { recursive: true });
            await writeFile(join(cwd, '.agents/workflows/only-one-idea.md'), '# idea');
            await mkdir(join(cwd, '.agents/skills/c4-diagrams'), { recursive: true });
            await writeFile(join(cwd, '.agents/skills/c4-diagrams/SKILL.md'), '# skill');

            await recordInstalledAssetsBatch(cwd, [
                { type: 'workflows', id: 'only-one-idea', version: ideaVersion },
                { type: 'skills', id: 'c4-diagrams', version: skillVersion },
            ]);

            const result = await inspectAssetUpdates(cwd);
            expect(result.inspected).toHaveLength(2);
            expect(result.outdated).toHaveLength(0);
            expect(result.upToDate).toHaveLength(2);

            // Simulate outdated asset (version 0.0.0 is older than current version)
            await recordInstalledAssetsBatch(cwd, [{ type: 'workflows', id: 'only-one-idea', version: '0.0.0' }]);

            const updatedResult = await inspectAssetUpdates(cwd);
            expect(updatedResult.outdated).toHaveLength(1);
            expect(updatedResult.outdated[0].id).toBe('only-one-idea');
            expect(updatedResult.outdated[0].status).toBe('outdated');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('applies asset updates and persists latest version to lockfile', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'sync-test-'));
        try {
            await mkdir(join(cwd, '.agents/workflows'), { recursive: true });
            await writeFile(join(cwd, '.agents/workflows/only-one-idea.md'), '# idea');

            await recordInstalledAssetsBatch(cwd, [{ type: 'workflows', id: 'only-one-idea', version: '0.0.0' }]);

            const inspect = await inspectAssetUpdates(cwd);
            expect(inspect.outdated).toHaveLength(1);

            const updateResult = await applyAssetUpdates(cwd, inspect.outdated);
            expect(updateResult.updated).toHaveLength(1);
            expect(updateResult.updated[0].id).toBe('only-one-idea');

            // Re-inspect to verify it is now up-to-date
            const postInspect = await inspectAssetUpdates(cwd);
            expect(postInspect.outdated).toHaveLength(0);
            expect(postInspect.upToDate).toHaveLength(1);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('identifies missing assets when files are deleted on disk and restores them', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'sync-test-missing-'));
        const ideaVersion = WORKFLOWS.find((w) => w.name === 'only-one-idea')?.version ?? '0.0.1';

        try {
            // Recorded in lockfile but file does NOT exist on disk
            await recordInstalledAssetsBatch(cwd, [{ type: 'workflows', id: 'only-one-idea', version: ideaVersion }]);

            const inspect = await inspectAssetUpdates(cwd);
            expect(inspect.missing).toHaveLength(1);
            expect(inspect.missing[0].id).toBe('only-one-idea');
            expect(inspect.missing[0].status).toBe('missing');

            // Apply updates to restore missing asset
            const restoreResult = await applyAssetUpdates(cwd, inspect.missing);
            expect(restoreResult.restored).toHaveLength(1);
            expect(restoreResult.restored[0].id).toBe('only-one-idea');
            expect(existsSync(join(cwd, '.agents/workflows/only-one-idea.md'))).toBe(true);

            // Re-inspect: now it should be up-to-date
            const postInspect = await inspectAssetUpdates(cwd);
            expect(postInspect.missing).toHaveLength(0);
            expect(postInspect.upToDate).toHaveLength(1);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('identifies removed assets and prunes them from disk and lockfile', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'sync-test-removed-'));
        try {
            // Create mock file for obsolete skill
            const orphanSkillDir = join(cwd, '.agents/skills/obsolete-skill');
            await mkdir(orphanSkillDir, { recursive: true });
            await writeFile(join(orphanSkillDir, 'SKILL.md'), '# Obsolete');

            // Record in lockfile as installed
            await recordInstalledAssetsBatch(cwd, [{ type: 'skills', id: 'obsolete-skill', version: '0.0.1' }]);

            const inspect = await inspectAssetUpdates(cwd);
            expect(inspect.removed).toHaveLength(1);
            expect(inspect.removed[0].id).toBe('obsolete-skill');
            expect(inspect.removed[0].status).toBe('removed');

            // Prune removed assets
            const pruneResult = await pruneAssetUpdates(cwd, inspect.removed);
            expect(pruneResult.pruned).toHaveLength(1);
            expect(pruneResult.pruned[0].id).toBe('obsolete-skill');
            expect(existsSync(orphanSkillDir)).toBe(false);

            // Re-inspect: no longer exists in lockfile
            const postInspect = await inspectAssetUpdates(cwd);
            expect(postInspect.removed).toHaveLength(0);
            expect(postInspect.inspected).toHaveLength(0);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});
