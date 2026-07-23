import { describe, expect, it, vi } from 'vitest';
import type { ProgramDeps } from '@/cli/deps.js';
import { executePackageActions } from '@/core/init/package-installer.js';
import { PACKAGES } from '@assets/packages/index.js';

describe('Package Installation (Task 1.4)', () => {
    it('executes npm installation when npm package is selected', async () => {
        const stdoutSpy = vi.fn();
        const deps: Partial<ProgramDeps> = {
            stdout: stdoutSpy,
        };

        const result = await executePackageActions({
            deps: deps as ProgramDeps,
            projectDir: '/tmp/test-project',
            packageManifests: PACKAGES,
            selectedPackageIds: ['@fission-ai/openspec'],
            execFileAsync: async () => ({ stdout: '', stderr: '' }),
        });

        expect(result.installedPackages).toContain('@fission-ai/openspec');
    });
});
