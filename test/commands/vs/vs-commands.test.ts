import { describe, expect, it, vi } from 'vitest';
import { createProgram } from '@src/index.js';
import { VsEditorId, VsPlatform } from '@src/core/vs/types.js';
import { syncVsExtensions, syncVsSettings } from '@src/core/vs/index.js';

vi.mock('@src/core/vs/index.js', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@src/core/vs/index.js')>();
    return {
        ...actual,
        syncVsExtensions: vi
            .fn()
            .mockResolvedValue({ installed: 2, results: [{ editorName: 'VSCode', installedExtensions: ['ext1', 'ext2'] }] }),
        syncVsSettings: vi.fn().mockResolvedValue({
            changed: 2,
            results: [{ editorName: 'VSCode', newKeys: { 'some.new': true }, changedKeys: { 'some.changed': { old: 1, new: 2 } } }],
        }),
    };
});

describe('VS sync commands', () => {
    it('registers setting-vs and extensions-vs commands', () => {
        const program = createProgram({
            cwd: process.cwd(),
            env: {},
            fetcher: (() => Promise.resolve({})) as typeof fetch,
            stdout: () => undefined,
        });
        expect(program.commands.map((command) => command.name())).toContain('setting-vs');
        expect(program.commands.map((command) => command.name())).toContain('extensions-vs');
    });

    it('runs setting-vs for explicit editors and reports progress output', async () => {
        const writes: string[] = [];
        const program = createProgram({
            cwd: '/repo',
            env: {},
            fetcher: (() => Promise.resolve({})) as typeof fetch,
            stdout: (line) => writes.push(line),
        });

        await program.parseAsync(['setting-vs', '--editors', 'antigravity,cursor'], { from: 'user' });

        expect(syncVsSettings).toHaveBeenCalledWith(
            expect.objectContaining({
                cwd: '/repo',
                editorIds: [VsEditorId.Antigravity],
                platform: expect.stringMatching(`${VsPlatform.Darwin}|${VsPlatform.Win32}`),
            }),
        );
        expect(writes.map((w) => w.replace(/\u001b\[\d+m/g, ''))).toContain('\nSync Summary:');
    });

    it('uses checkbox selection for setting-vs when editors option is omitted', async () => {
        const checkbox = vi.fn().mockResolvedValue([VsEditorId.Antigravity]);
        const program = createProgram({
            cwd: '/repo',
            env: {},
            fetcher: (() => Promise.resolve({})) as typeof fetch,
            prompts: { checkbox },
            stdout: () => undefined,
        });

        await program.parseAsync(['setting-vs'], { from: 'user' });

        expect(checkbox).toHaveBeenCalledWith(expect.objectContaining({ message: 'Select editors to sync settings' }));
        expect(syncVsSettings).toHaveBeenLastCalledWith(expect.objectContaining({ editorIds: [VsEditorId.Antigravity] }));
    });

    it('runs extensions-vs for explicit editors and preserves command output conventions', async () => {
        const writes: string[] = [];
        const program = createProgram({
            cwd: '/repo',
            env: {},
            fetcher: (() => Promise.resolve({})) as typeof fetch,
            stdout: (line) => writes.push(line),
        });

        await program.parseAsync(['extensions-vs', '--editors', 'cursor,antigravity'], { from: 'user' });

        expect(syncVsExtensions).toHaveBeenCalledWith(expect.objectContaining({ cwd: '/repo', editorIds: [VsEditorId.Cursor] }));
        expect(writes.map((w) => w.replace(/\u001b\[\d+m/g, ''))).toContain('\nSync Summary:');
    });

    it('rejects VS Code before either sync command has side effects', async () => {
        const program = createProgram({
            cwd: '/repo',
            env: {},
            fetcher: (() => Promise.resolve({})) as typeof fetch,
            stdout: () => undefined,
        });

        await expect(program.parseAsync(['setting-vs', '--editors', 'vscode'], { from: 'user' })).rejects.toThrow(
            "Unsupported target 'vscode'. Valid targets: antigravity, cursor",
        );
        await expect(program.parseAsync(['extensions-vs', '--editors', 'vscode'], { from: 'user' })).rejects.toThrow(
            "Unsupported target 'vscode'. Valid targets: antigravity, cursor",
        );
    });
});
