import { describe, expect, it, vi } from 'vitest';
import { createProgram } from '@src/index.js';
import { VsEditorId, VsPlatform } from '@src/core/vs/types.js';
import { checkExistingVsExtensions, checkExistingVsSettings, syncVsExtensions, syncVsSettings } from '@src/core/vs/index.js';

vi.mock('@src/core/vs/index.js', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@src/core/vs/index.js')>();
    return {
        ...actual,
        checkExistingVsExtensions: vi.fn().mockImplementation(async ({ editorIds, extensionIds }) => {
            return editorIds.flatMap((editorId: VsEditorId) =>
                extensionIds.map((ext: string) => ({
                    editorId,
                    editorName: editorId === VsEditorId.Antigravity ? 'Antigravity' : 'Cursor',
                    extensionId: ext,
                    exists: ext === 'johnpapa.vscode-peacock',
                })),
            );
        }),
        checkExistingVsSettings: vi.fn().mockImplementation(async ({ editorIds }) => {
            return editorIds.flatMap((editorId: VsEditorId) => [
                {
                    currentValue: 'Gruvbox Dark Hard',
                    editorId,
                    editorName: editorId === VsEditorId.Antigravity ? 'Antigravity' : 'Cursor',
                    exists: true,
                    key: 'workbench.colorTheme',
                    newValue: 'Dracula Theme',
                },
            ]);
        }),
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

    it('prompts setting selection and confirm overwrite in interactive mode for setting-vs', async () => {
        const checkbox = vi
            .fn()
            .mockResolvedValueOnce([VsEditorId.Antigravity])
            .mockResolvedValueOnce(['workbench.colorTheme'])
            .mockResolvedValueOnce(['antigravity:workbench.colorTheme']);

        const program = createProgram({
            cwd: '/repo',
            env: {},
            fetcher: (() => Promise.resolve({})) as typeof fetch,
            prompts: { checkbox },
            stdout: () => undefined,
        });

        await program.parseAsync(['setting-vs'], { from: 'user' });

        expect(checkExistingVsSettings).toHaveBeenCalledWith(
            expect.objectContaining({
                editorIds: [VsEditorId.Antigravity],
            }),
        );

        expect(checkbox).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                message: 'Select VS Code settings to sync:',
            }),
        );

        expect(checkbox).toHaveBeenNthCalledWith(
            3,
            expect.objectContaining({
                message: 'The following settings already exist with different values. Select which ones you want to overwrite:',
            }),
        );

        expect(syncVsSettings).toHaveBeenLastCalledWith(
            expect.objectContaining({
                editorIds: [VsEditorId.Antigravity],
                settingKeysPerEditor: {
                    [VsEditorId.Antigravity]: ['workbench.colorTheme'],
                },
            }),
        );
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

    it('prompts extension selection and confirm overwrite in interactive mode', async () => {
        const checkbox = vi
            .fn()
            .mockResolvedValueOnce(['johnpapa.vscode-peacock', 'signageos.signageos-vscode-sops'])
            .mockResolvedValueOnce(['cursor:johnpapa.vscode-peacock']);

        const program = createProgram({
            cwd: '/repo',
            env: {},
            fetcher: (() => Promise.resolve({})) as typeof fetch,
            prompts: { checkbox },
            stdout: () => undefined,
        });

        await program.parseAsync(['extensions-vs', '--editors', 'cursor'], { from: 'user' });

        expect(checkExistingVsExtensions).toHaveBeenCalledWith(
            expect.objectContaining({
                editorIds: [VsEditorId.Cursor],
            }),
        );

        expect(checkbox).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                message: 'Select VS Code extensions to install:',
            }),
        );

        expect(checkbox).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                message: 'The following extensions already exist. Select which ones you want to overwrite/reinstall:',
            }),
        );

        expect(syncVsExtensions).toHaveBeenLastCalledWith(
            expect.objectContaining({
                editorIds: [VsEditorId.Cursor],
                extensionIdsPerEditor: {
                    [VsEditorId.Cursor]: ['johnpapa.vscode-peacock', 'signageos.signageos-vscode-sops'],
                },
            }),
        );
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
