import { describe, expect, it, vi } from 'vitest';
import type { ProgramDeps } from '@/cli/deps.js';
import { executePluginActions } from '@/core/plugin/index.js';
import { AllowedToolId } from '@/constants/allowed-tools.js';
import { PLUGINS } from '@assets/plugins/index.js';

describe('Plugin Core Service & Target Actions (Tasks 1.6 & 1.7)', () => {
    it('executes command action for Antigravity target', async () => {
        const stdoutLogs: string[] = [];
        const deps: Partial<ProgramDeps> = {
            stdout: (msg) => stdoutLogs.push(msg),
        };

        const mockExecFileAsync = vi.fn(async () => ({ stdout: '', stderr: '' }));

        const result = await executePluginActions({
            deps: deps as ProgramDeps,
            projectDir: '/tmp/test-project',
            pluginManifests: PLUGINS,
            selectedPluginIds: ['superpowers'],
            targetIds: [AllowedToolId.Antigravity],
            execFileAsync: mockExecFileAsync,
        });

        expect(result.summary.installed).toContain('superpowers:antigravity');
        expect(mockExecFileAsync).toHaveBeenCalledWith(
            'agy',
            ['plugin', 'install', 'https://github.com/obra/superpowers'],
            expect.anything(),
        );
    });

    it('reports actionRequired for manual guidance on Claude, Cursor, and Codex', async () => {
        const stdoutLogs: string[] = [];
        const deps: Partial<ProgramDeps> = {
            stdout: (msg) => stdoutLogs.push(msg),
        };

        const result = await executePluginActions({
            deps: deps as ProgramDeps,
            projectDir: '/tmp/test-project',
            pluginManifests: PLUGINS,
            selectedPluginIds: ['superpowers'],
            targetIds: [AllowedToolId.Claude, AllowedToolId.Cursor, AllowedToolId.Codex],
        });

        expect(result.summary.actionRequired).toContain('superpowers (claude)');
        expect(result.summary.actionRequired).toContain('superpowers (cursor)');
        expect(result.summary.actionRequired).toContain('superpowers (codex)');

        const fullLog = stdoutLogs.join('\n');
        expect(fullLog).toContain('/plugin install superpowers@claude-plugins-official');
        expect(fullLog).toContain('/add-plugin superpowers');
        expect(fullLog).toContain('/plugins');
    });

    it('preserves other target results when Antigravity command fails', async () => {
        const stdoutLogs: string[] = [];
        const deps: Partial<ProgramDeps> = {
            stdout: (msg) => stdoutLogs.push(msg),
        };

        const mockExecFileAsync = vi.fn(async (file: string) => {
            if (file === 'agy') {
                throw new Error('agy: command not found');
            }
            return { stdout: '', stderr: '' };
        });

        const result = await executePluginActions({
            deps: deps as ProgramDeps,
            projectDir: '/tmp/test-project',
            pluginManifests: PLUGINS,
            selectedPluginIds: ['superpowers'],
            targetIds: [AllowedToolId.Antigravity, AllowedToolId.Claude],
            execFileAsync: mockExecFileAsync,
        });

        expect(result.summary.failed).toContain('superpowers:antigravity');
        expect(result.summary.actionRequired).toContain('superpowers (claude)');

        const fullLog = stdoutLogs.join('\n');
        expect(fullLog).toContain('Command execution failed for antigravity: agy: command not found');
        expect(fullLog).toContain('/plugin install superpowers@claude-plugins-official');
    });
});
