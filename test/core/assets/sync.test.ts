import { describe, expect, it } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { recordInstalledAssetsBatch } from '@/core/assets/lockfile.js';
import { inspectAssetUpdates, applyAssetUpdates } from '@/core/assets/sync.js';

describe('Asset Synchronization & Reconciliation', () => {
    it('identifies up-to-date and outdated assets in target project', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'sync-test-'));
        try {
            await recordInstalledAssetsBatch(cwd, [
                { type: 'workflows', id: 'only-one-idea', version: '0.0.1' },
                { type: 'skills', id: 'c4-diagrams', version: '0.0.1' },
            ]);

            const result = await inspectAssetUpdates(cwd);
            expect(result.inspected).toHaveLength(2);
            expect(result.outdated).toHaveLength(0);
            expect(result.upToDate).toHaveLength(2);

            // Simulate outdated asset (version 0.0.0 is older than 0.0.1)
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
});
