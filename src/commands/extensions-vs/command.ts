import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { parseVsEditorIds, syncVsExtensions, vsEditors, type VsEditorId } from '@/core/vs/index.js';

interface ExtensionsVsOptions {
    editors?: string;
}

const selectEditors = async (deps: ProgramDeps, options: ExtensionsVsOptions): Promise<VsEditorId[]> => {
    const parsed = parseVsEditorIds(options.editors);
    if (parsed.length) return parsed;
    if (deps.prompts?.checkbox) {
        return deps.prompts.checkbox({
            message: 'Select editors to sync extensions',
            choices: vsEditors.map((editor) => ({ name: editor.name, value: editor.id, checked: true })),
        });
    }
    return vsEditors.map((editor) => editor.id);
};

export const createExtensionsVsCommand = (deps: ProgramDeps): Command => {
    const cmd = new Command('extensions-vs')
        .description('Install missing VS Code/Cursor/Antigravity extensions from libraries/vs')
        .option('--editors <ids>', 'Comma-separated editor ids: vscode,cursor,antigravity');

    cmd.action(async (options: ExtensionsVsOptions) => {
        const editorIds = await selectEditors(deps, options);
        const result = await syncVsExtensions({ cwd: deps.cwd, editorIds, write: deps.stdout });
        deps.stdout(`Extensions installed: ${result.installed}`);
    });

    return cmd;
};
