import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { selectIgnoreTargets } from '@/core/ignore/index.js';
import type { SkillCommandOptions } from './types.js';
import {
    confirmSkillOverwriteStep,
    executeAndReportSkillsStep,
    loadSkillManifestsStep,
    selectSkillsStep,
    selectSkillTargetStep,
} from './actions/index.js';

export function createSkillCommand(deps: ProgramDeps): Command {
    const cmd = new Command('skill')
        .description('🤖 Manage and synchronize custom agent skills')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[names]', 'Comma-separated list of specific skill names to sync')
        .option('--tool <tools>', 'Comma-separated IDE/tool IDs to target')
        .option('--no-ignore', 'Skip updating the project .gitignore file')
        .action(async (pathArg: string | undefined, namesArg: string | undefined, options: SkillCommandOptions) => {
            const { projectDir, availableSkills } = loadSkillManifestsStep(deps, pathArg);
            if (!availableSkills?.length) {
                return;
            }

            const { targetTool, targetTools } = await selectSkillTargetStep(deps, options);
            const { selectedSkills, allExistingSkills } = await selectSkillsStep(
                deps,
                projectDir,
                namesArg,
                availableSkills,
                targetTool,
                targetTools,
            );

            if (!selectedSkills?.length) {
                deps.stdout('No skills selected. Exiting.');
                return;
            }

            const ignoreTargets = await selectIgnoreTargets(deps);

            const overwriteList = await confirmSkillOverwriteStep(deps, selectedSkills, allExistingSkills);
            await executeAndReportSkillsStep(deps, projectDir, targetTools, selectedSkills, overwriteList, options, ignoreTargets);
        });

    return cmd;
}
