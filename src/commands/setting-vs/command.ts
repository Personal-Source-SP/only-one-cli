import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import type { SettingVsCommandOptions } from './types.js';
import {
    confirmSettingOverwriteStep,
    executeAndReportStep,
    getAvailableSettingKeys,
    loadVsSettingManifestsStep,
    selectEditorsStep,
    selectSettingsStep,
} from './actions/index.js';

export function createSettingVsCommand(deps: ProgramDeps): Command {
    const cmd = new Command('setting-vs')
        .description('⚙️  Merge VS Code editor configurations')
        .helpOption('-h, --help', 'display help for command')
        .argument('[settings]', 'Comma-separated list of setting keys to sync')
        .option('--editors <ids>', 'Comma-separated list of editor identifiers to sync (choices: antigravity, cursor)')
        .option('--settings <keys>', 'Comma-separated list of setting keys to sync')
        .option('--force', 'Force overwrite settings, bypassing merging', false)
        .addHelpText(
            'after',
            `\n${COLORS.cli.header('Examples:')}\n` +
                `  ${COLORS.cli.command('$ only-one setting-vs')}\n` +
                `  ${COLORS.cli.command('$ only-one setting-vs workbench.colorTheme')}\n` +
                `  ${COLORS.cli.command('$ only-one setting-vs --editors antigravity,cursor')}\n` +
                `  ${COLORS.cli.command('$ only-one setting-vs --force')}\n\n` +
                `${COLORS.cli.header('Notes:')}\n` +
                `  - ${COLORS.dim('If no --editors option is provided, an interactive prompt will allow you to select which editors to sync (if supported by terminal).')}\n` +
                `  - ${COLORS.dim('Modifies the global user settings.json of the selected editor applications on your OS.')}`,
        );

    cmd.action(async (settingsArg?: string | SettingVsCommandOptions, rawOptions?: SettingVsCommandOptions) => {
        const options: SettingVsCommandOptions = typeof settingsArg === 'object' && settingsArg !== null ? settingsArg : (rawOptions ?? {});
        const settingsStr = typeof settingsArg === 'string' ? settingsArg : undefined;

        const manifestSettings = await loadVsSettingManifestsStep(deps);
        const availableSettingKeys = getAvailableSettingKeys(manifestSettings);
        const editorIds = await selectEditorsStep(deps, options);
        const { existingChecks, selectedKeys } = await selectSettingsStep(deps, settingsStr, availableSettingKeys, editorIds, options);
        const settingKeysPerEditor = await confirmSettingOverwriteStep(deps, selectedKeys, existingChecks, editorIds, options);
        await executeAndReportStep(deps, editorIds, settingKeysPerEditor, options);
    });

    return cmd;
}
