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
        .description('Install missing editor extensions from the libraries/vs library for local editors.')
        .helpOption('-h, --help', 'display help for command')
        .option('--editors <ids>', 'Comma-separated list of editor identifiers to sync (choices: vscode, cursor, antigravity)')
        .addHelpText(
            'after',
            '\nExamples:\n' +
                '  $ only-one extensions-vs\n' +
                '  $ only-one extensions-vs --editors cursor\n\n' +
                'Notes:\n' +
                '  - If no --editors option is provided, an interactive prompt will allow you to select which editors to sync (if supported by terminal).\n' +
                '  - Requires the corresponding editor CLI tool (e.g. `code` or `cursor`) to be installed and available in the system PATH.',
        );

    cmd.action(async (options: ExtensionsVsOptions) => {
        const editorIds = await selectEditors(deps, options);
        const result = await syncVsExtensions({ cwd: deps.cwd, editorIds, write: deps.stdout });
        deps.stdout(`Extensions installed: ${result.installed}`);
    });

    return cmd;
};
