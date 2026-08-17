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
            selectedPackageIds: ['ui-ux-pro-max-cli'],
            overwriteList: [], // empty overwriteList -> non-TTY skip
            execFileAsync: execFileSpy,
        });

        expect(result.summary.skipped).toContain('ui-ux-pro-max-cli');
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
            selectedPackageIds: ['ui-ux-pro-max-cli'],
            overwriteList: ['ui-ux-pro-max-cli'],
            execFileAsync: execFileSpy,
        });

        expect(result.summary.installed).toContain('ui-ux-pro-max-cli');
        expect(execFileSpy).toHaveBeenCalled();
    });
});
