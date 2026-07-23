import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import type { ExtensionsVsCommandOptions } from './types.js';
import {
    confirmExtensionOverwriteStep,
    executeAndReportStep,
    loadVsLibraryManifestStep,
    selectEditorsStep,
    selectExtensionsStep,
} from './actions/index.js';

export function createExtensionsVsCommand(deps: ProgramDeps): Command {
    const cmd = new Command('extensions-vs')
        .description('🧩 Install missing VS Code extensions')
        .helpOption('-h, --help', 'display help for command')
        .argument('[extensions]', 'Comma-separated list of extension IDs to install')
        .option('--editors <ids>', 'Comma-separated list of editor identifiers to sync (choices: antigravity, cursor)')
        .option('--extensions <ids>', 'Comma-separated list of extension IDs to install')
        .option('--force', 'Force install all extensions, bypassing merge', false)
        .addHelpText(
            'after',
            `\n${COLORS.cli.header('Examples:')}\n` +
                `  ${COLORS.cli.command('$ only-one extensions-vs')}\n` +
                `  ${COLORS.cli.command('$ only-one extensions-vs johnpapa.vscode-peacock')}\n` +
                `  ${COLORS.cli.command('$ only-one extensions-vs --editors cursor')}\n` +
                `  ${COLORS.cli.command('$ only-one extensions-vs --force')}\n\n` +
                `${COLORS.cli.header('Notes:')}\n` +
                `  - ${COLORS.dim('If no --editors option is provided, an interactive prompt will allow you to select which editors to sync (if supported by terminal).')}\n` +
                `  - ${COLORS.dim('Requires the corresponding editor CLI tool (e.g. `code` or `cursor`) to be installed and available in the system PATH.')}`,
        );

    cmd.action(async (extensionsArg?: string | ExtensionsVsCommandOptions, rawOptions?: ExtensionsVsCommandOptions) => {
        const options: ExtensionsVsCommandOptions =
            typeof extensionsArg === 'object' && extensionsArg !== null ? extensionsArg : (rawOptions ?? {});
        const extensionsStr = typeof extensionsArg === 'string' ? extensionsArg : undefined;

        const availableExtensions = await loadVsLibraryManifestStep(deps);
        const editorIds = await selectEditorsStep(deps, options);
        const { existingChecks, selectedExtensions } = await selectExtensionsStep(
            deps,
            extensionsStr,
            availableExtensions,
            editorIds,
            options,
        );
        const extensionIdsPerEditor = await confirmExtensionOverwriteStep(deps, selectedExtensions, existingChecks, editorIds, options);
        await executeAndReportStep(deps, editorIds, extensionIdsPerEditor, options);
    });

    return cmd;
}
