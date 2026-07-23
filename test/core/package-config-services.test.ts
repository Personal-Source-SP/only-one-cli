import { describe, expect, it, vi } from 'vitest';
import { planPackages } from '@/core/package/planner.js';
import { planConfigs } from '@/core/config/planner.js';
import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

vi.mock('@/core/combo/index.js', () => ({
    isPackageInstalled: vi.fn(async (name: string) => name === 'existing-pkg'),
}));

describe('Package & Config Planners (Tasks 2.1 - 2.6)', () => {
    it('plans packages without side effects and detects existing package', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'package-plan-test-'));
        try {
            const mockManifests = [
                { id: 'new-pkg', name: 'New Pkg', installer: { kind: 'npm', packageName: 'new-pkg' } },
                { id: 'existing-pkg', name: 'Existing Pkg', installer: { kind: 'npm', packageName: 'existing-pkg' } },
            ] as any;

            const items = await planPackages({
                projectDir: cwd,
                selectedPackageIds: ['new-pkg', 'existing-pkg'],
                packageManifests: mockManifests,
            });

            expect(items.length).toBe(2);
            expect(items[0].key).toBe('package:new-pkg');
            expect(items[0].state).toBe('new');
            expect(items[1].key).toBe('package:existing-pkg');
            expect(items[1].state).toBe('existing');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('plans configs without side effects and detects existing config file', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'config-plan-test-'));
        try {
            await mkdir(join(cwd, 'openspec'), { recursive: true });
            await writeFile(join(cwd, 'openspec/config.yaml'), 'existing config');

            const items = await planConfigs({
                projectDir: cwd,
                selectedConfigNames: ['openspec'],
            });

            expect(items.length).toBe(1);
            expect(items[0].key).toBe('config:openspec');
            expect(items[0].state).toBe('existing');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});
