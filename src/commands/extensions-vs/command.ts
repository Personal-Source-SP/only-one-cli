import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import type { ExtensionsVsCommandOptions } from './types.js';
import { selectEditorsStep, syncExtensionsStep } from './actions/index.js';

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

    cmd.action(async (options: ExtensionsVsCommandOptions) => {
        const editorIds = await selectEditorsStep(deps, options);
        await syncExtensionsStep(deps, editorIds, options);
    });

    return cmd;
};
