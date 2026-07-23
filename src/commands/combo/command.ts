import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import type { ComboCommandOptions } from './types.js';
import {
    confirmComboOverwriteStep,
    executeAndReportComboStep,
    loadComboManifestsStep,
    selectCombosStep,
    selectComboTargetStep,
} from './actions/index.js';

export function createComboCommand(deps: ProgramDeps): Command {
    const cmd = new Command('combo')
        .description('✨ Initialize project using predefined combos (packages, skills, configs, and MCPs)')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[names]', 'Comma-separated list of combo names to apply')
        .option('--tool <tools>', 'Target IDE/tool ID')
        .option('--no-ignore', 'Skip updating the .gitignore file')
        .action(async (pathArg: string | undefined, namesArg: string | undefined, options: ComboCommandOptions) => {
            const { projectDir, availableCombos } = await loadComboManifestsStep(deps, pathArg);
            if (!availableCombos?.length) {
                return;
            }

            const { targetTool, targetTools } = await selectComboTargetStep(deps, options);
            const selectedComboNames = await selectCombosStep(deps, projectDir, namesArg, availableCombos, targetTool, targetTools);

            if (!selectedComboNames?.length) {
                deps.stdout('No combos selected. Exiting.');
                return;
            }

            for (const comboName of selectedComboNames) {
                const combo = availableCombos.find(
                    (c) => c.id.toLowerCase() === comboName.toLowerCase() || c.name.toLowerCase() === comboName.toLowerCase(),
                );
                if (!combo) {
                    throw new Error(`Combo '${comboName}' not found in libraries/combos`);
                }

                deps.stdout(`\nProcessing combo: ${COLORS.primary(combo.name)}...`);

                const overwriteList = await confirmComboOverwriteStep(deps, projectDir, combo, targetTools);
                await executeAndReportComboStep(deps, projectDir, combo, targetTools, overwriteList, options);
            }
        });

    return cmd;
}
