import { homedir } from 'node:os';

import { Command } from 'commander';

import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { isComboScopeMatch } from '@/core/combo/index.js';
import { selectIgnoreTargets } from '@/core/ignore/index.js';

import {
    confirmComboOverwriteStep,
    executeAndReportComboStep,
    loadComboManifestsStep,
    selectCombosStep,
    selectComboTargetStep,
} from './actions/index.js';
import type { ComboCommandOptions } from './types.js';

export function createComboCommand(deps: ProgramDeps): Command {
    const cmd = new Command('combo')
        .description('✨ Initialize project using predefined combos (packages, skills, configs, and MCPs)')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[names]', 'Comma-separated list of combo names to apply')
        .option('--tool <tools>', 'Target IDE/tool ID')
        .option('--no-ignore', 'Skip updating the .gitignore file')
        .option('-g, --global', 'Apply combo components globally to user IDE config directories (~/.only-one)')
        .option('-f, --force', 'Force overwrite all existing combo components without prompt')
        .action(async (pathArg: string | undefined, namesArg: string | undefined, options: ComboCommandOptions) => {
            const targetDir = options.global ? homedir() : pathArg;
            const { projectDir, availableCombos } = await loadComboManifestsStep(deps, targetDir);

            if (!availableCombos?.length) {
                return;
            }

            const { targetTool, targetTools } = await selectComboTargetStep(deps, options);
            const comboNamesArg = options.global && pathArg && !namesArg ? pathArg : namesArg;
            const selectedComboNames = await selectCombosStep(
                deps,
                projectDir,
                comboNamesArg,
                availableCombos,
                targetTool,
                targetTools,
                Boolean(options.global),
            );

            if (!selectedComboNames?.length) {
                deps.stdout('No combos selected. Exiting.');

                return;
            }

            const ignoreTargets = options.global || options.ignore === false ? [] : await selectIgnoreTargets(deps);

            for (const comboName of selectedComboNames) {
                const combo = availableCombos.find(
                    (c) => c.id.toLowerCase() === comboName.toLowerCase() || c.name.toLowerCase() === comboName.toLowerCase(),
                );

                if (!combo) {
                    throw new Error(`Combo '${comboName}' not found in assets/combos`);
                }

                if (!isComboScopeMatch(combo, Boolean(options.global))) {
                    const targetScope = options.global ? 'global' : 'local project';

                    throw new Error(
                        `Combo '${combo.name}' is scoped for '${combo.scope}' only and cannot be installed in ${targetScope} mode.`,
                    );
                }

                deps.stdout(`\nProcessing combo: ${COLORS.primary(combo.name)}...`);

                const overwriteList = await confirmComboOverwriteStep(
                    deps,
                    projectDir,
                    combo,
                    targetTools,
                    Boolean(options.global),
                    Boolean(options.force),
                );
                await executeAndReportComboStep(deps, projectDir, combo, targetTools, overwriteList, options, ignoreTargets);
            }
        });

    return cmd;
}
