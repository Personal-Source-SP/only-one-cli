import { describe, expect, it, vi } from 'vitest';
import { VsEditorId, VsPlatform, mergeSettings, normalizeExtensionIds, parseVsEditorIds, vsEditors } from '@src/core/vs/index.js';
import { PercentProgressReporter } from '@src/core/vs/progress.js';

describe('VS core sync helpers', () => {
    it('merges settings deeply and lets source win conflicts', () => {
        expect(
            mergeSettings(
                {
                    editor: { fontSize: 12, tabSize: 2 },
                    files: { autoSave: 'off' },
                    keep: true,
                    list: ['target'],
                },
                {
                    editor: { tabSize: 4 },
                    files: 'source-wins',
                    list: ['source'],
                },
            ),
        ).toEqual({
            editor: { fontSize: 12, tabSize: 4 },
            files: 'source-wins',
            keep: true,
            list: ['source'],
        });
    });

    it('deduplicates extension ids case-insensitively', () => {
        expect(normalizeExtensionIds(['ESBENP.prettier-vscode', 'esbenp.prettier-vscode', ' dbaeumer.vscode-eslint '])).toEqual([
            'esbenp.prettier-vscode',
            'dbaeumer.vscode-eslint',
        ]);
    });

    it('resolves supported editor settings paths by platform', () => {
        const vscode = vsEditors.find((editor) => editor.id === VsEditorId.VSCode);
        expect(vscode?.resolveSettingsPath('/Users/me', VsPlatform.Darwin)).toContain(
            'Library/Application Support/Code/User/settings.json',
        );
        expect(vscode?.resolveSettingsPath('C:/Users/me', VsPlatform.Win32)).toContain('AppData/Roaming/Code/User/settings.json');
    });

    it('parses comma-separated editor ids and ignores unsupported ids', () => {
        expect(parseVsEditorIds('vscode,cursor,unknown,antigravity')).toEqual([
            VsEditorId.VSCode,
            VsEditorId.Cursor,
            VsEditorId.Antigravity,
        ]);
    });

    it('reports monotonic progress and reaches 100 at final step', () => {
        const writes: string[] = [];
        const reporter = new PercentProgressReporter((line) => writes.push(line));
        reporter.start(2, 'start');
        reporter.step('one');
        reporter.step('two');
        expect(writes).toEqual(['[0%] start', '[50%] one', '[100%] two']);
    });
});
