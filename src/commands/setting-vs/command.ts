import { homedir, platform } from 'node:os';
import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { parseVsEditorIds, syncVsSettings, vsEditors, VsPlatform, type VsEditorId } from '@/core/vs/index.js';

interface SettingVsOptions {
    editors?: string;
}

const resolvePlatform = (): VsPlatform => {
    const current = platform();
    if (current === 'win32') return VsPlatform.Win32;
    return VsPlatform.Darwin;
};

const selectEditors = async (deps: ProgramDeps, options: SettingVsOptions): Promise<VsEditorId[]> => {
    const parsed = parseVsEditorIds(options.editors);
    if (parsed.length) return parsed;
    if (deps.prompts?.checkbox) {
        return deps.prompts.checkbox({
            message: 'Select editors to sync settings',
            choices: vsEditors.map((editor) => ({ name: editor.name, value: editor.id, checked: true })),
        });
    }
    return vsEditors.map((editor) => editor.id);
};

export const createSettingVsCommand = (deps: ProgramDeps): Command => {
    const cmd = new Command('setting-vs')
        .description('Merge VS Code/Cursor/Antigravity settings.json from libraries/vs')
        .option('--editors <ids>', 'Comma-separated editor ids: vscode,cursor,antigravity');

    cmd.action(async (options: SettingVsOptions) => {
        const editorIds = await selectEditors(deps, options);
        const result = await syncVsSettings({
            cwd: deps.cwd,
            editorIds,
            homeDir: homedir(),
            platform: resolvePlatform(),
            write: deps.stdout,
        });
        deps.stdout(`Settings synced: ${result.changed}`);
    });

    return cmd;
};
