import { describe, expect, it, vi } from 'vitest';
import type { ProgramDeps } from '@/cli/deps.js';
import { executePackageActions } from '@/core/init/package-installer.js';
import { PACKAGES } from '@assets/packages/index.js';

describe('Package Verification & Non-TTY Reinstall Safety (Tasks 4.1 & 4.3)', () => {
    it('skips package when overwriteList does not include package ID', async () => {
        const stdoutLogs: string[] = [];
        const deps: Partial<ProgramDeps> = {
            stdout: (msg) => stdoutLogs.push(msg),
        };

        const execFileSpy = vi.fn(async () => ({ stdout: '', stderr: '' }));

        const result = await executePackageActions({
            deps: deps as ProgramDeps,
            projectDir: '/tmp/test-project',
            packageManifests: PACKAGES,
            selectedPackageIds: ['@fission-ai/openspec'],
            overwriteList: [], // empty overwriteList -> non-TTY skip
            execFileAsync: execFileSpy,
        });

        expect(result.summary.skipped).toContain('@fission-ai/openspec');
        expect(execFileSpy).not.toHaveBeenCalled();
    });

    it('installs package when overwriteList includes package ID', async () => {
        const stdoutLogs: string[] = [];
        const deps: Partial<ProgramDeps> = {
            stdout: (msg) => stdoutLogs.push(msg),
        };

        const execFileSpy = vi.fn(async () => ({ stdout: '', stderr: '' }));

        const result = await executePackageActions({
            deps: deps as ProgramDeps,
            projectDir: '/tmp/test-project',
            packageManifests: PACKAGES,
            selectedPackageIds: ['@fission-ai/openspec'],
            overwriteList: ['@fission-ai/openspec'],
            execFileAsync: execFileSpy,
        });

        expect(result.summary.installed).toContain('@fission-ai/openspec');
        expect(execFileSpy).toHaveBeenCalled();
    });
});
