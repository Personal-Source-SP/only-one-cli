import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { syncVsExtensions, type VsEditorId } from '@/core/vs/index.js';
import { selectAllowedVsExtensionsTargets } from '@/core/target-selection/index.js';

import { COLORS } from '@/constants/index.js';

interface ExtensionsVsOptions {
    editors?: string;
    force?: boolean;
}

const selectEditors = async (deps: ProgramDeps, options: ExtensionsVsOptions): Promise<VsEditorId[]> => {
    const editors = await selectAllowedVsExtensionsTargets({
        automatic: !deps.prompts?.checkbox,
        emptyMessage: 'Select at least one supported editor',
        explicit: options.editors,
        message: 'Select editors to sync extensions',
        prompts: deps.prompts,
    });
    return editors.map((editor) => editor.id);
};

export const createExtensionsVsCommand = (deps: ProgramDeps): Command => {
    const cmd = new Command('extensions-vs')
        .description('🧩 Install missing VS Code extensions')
        .helpOption('-h, --help', 'display help for command')
        .option('--editors <ids>', 'Comma-separated list of editor identifiers to sync (choices: antigravity, cursor)')
        .option('--force', 'Force install all extensions, bypassing merge', false)
        .addHelpText(
            'after',
            `\n${COLORS.cli.header('Examples:')}\n` +
                `  ${COLORS.cli.command('$ only-one extensions-vs')}\n` +
                `  ${COLORS.cli.command('$ only-one extensions-vs --editors cursor')}\n` +
                `  ${COLORS.cli.command('$ only-one extensions-vs --force')}\n\n` +
                `${COLORS.cli.header('Notes:')}\n` +
                `  - ${COLORS.dim('If no --editors option is provided, an interactive prompt will allow you to select which editors to sync (if supported by terminal).')}\n` +
                `  - ${COLORS.dim('Requires the corresponding editor CLI tool (e.g. `code` or `cursor`) to be installed and available in the system PATH.')}`,
        );

    cmd.action(async (options: ExtensionsVsOptions) => {
        const editorIds = await selectEditors(deps, options);
        const result = await syncVsExtensions({ cwd: deps.cwd, editorIds, write: deps.stdout, force: options.force });

        deps.stdout(COLORS.cli.header('\nSync Summary:'));
        for (const res of result.results) {
            deps.stdout(COLORS.secondary(`${res.editorName}:`));
            if (res.installedExtensions.length > 0) {
                deps.stdout(COLORS.success(`  Installed extensions:`));
                for (const ext of res.installedExtensions) {
                    deps.stdout(`    - ${COLORS.cli.option(ext)}`);
                }
            } else {
                deps.stdout(COLORS.dim(`  No new extensions installed.`));
            }
        }
    });

    return cmd;
};
