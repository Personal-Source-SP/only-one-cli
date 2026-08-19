import { resolve } from 'node:path';
import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { selectIgnoreTargets } from '@/core/ignore/index.js';
import { selectSingleAllowedAgentTarget } from '@/core/target-selection/index.js';
import type { AgentToolOption } from '@/core/agent/tools.js';
import { installSkills } from '@/core/skill/index.js';
import { readSkillsLockfile } from '@/core/skill/remote/lockfile.js';
import type { SkillCommandOptions } from './types.js';
import {
    confirmSkillOverwriteStep,
    executeAndReportSkillsStep,
    loadSkillManifestsStep,
    reportOutdatedSkillsStep,
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
        .option('--outdated', 'Check for outdated skills against upstream GitHub')
        .action(
            async (pathArg: string | undefined, namesArg: string | undefined, options: SkillCommandOptions & { outdated?: boolean }) => {
                const projectDir = resolve(pathArg || process.cwd());

                if (options.outdated) {
                    await reportOutdatedSkillsStep(deps, projectDir);
                    return;
                }

                const { availableSkills } = loadSkillManifestsStep(deps, pathArg);
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
            },
        );

    cmd.command('outdated [path]')
        .description('Check skills freshness and update availability against upstream GitHub')
        .action(async (pathArg?: string) => {
            const projectDir = resolve(pathArg || process.cwd());
            await reportOutdatedSkillsStep(deps, projectDir);
        });

    cmd.command('update [name]')
        .description('Update one or all installed skills to their latest upstream version')
        .argument('[name]', 'Specific skill name to update')
        .option('--path <path>', 'Target project directory path')
        .option('--tool <tools>', 'Target IDE tools')
        .action(async (nameArg: string | undefined, opts: { path?: string; tool?: string }) => {
            const projectDir = resolve(opts.path || process.cwd());
            const targetTool = await selectSingleAllowedAgentTarget({
                automatic: false,
                explicit: opts.tool,
                message: 'Select target IDEs/Tools for skill update:',
                prompts: deps.prompts,
            });
            const targetTools: AgentToolOption[] = [targetTool];
            const lock = await readSkillsLockfile(projectDir);

            const skillNamesToUpdate = nameArg ? [nameArg] : Object.keys(lock.skills);

            if (skillNamesToUpdate.length === 0) {
                deps.stdout('No skills found in lockfile to update.');
                return;
            }

            deps.stdout(`Updating ${skillNamesToUpdate.length} skill(s) from upstream GitHub...`);

            const overwriteList = skillNamesToUpdate.flatMap((s) => targetTools.map((t: AgentToolOption) => `${t.value}:${s}`));

            await installSkills({
                deps,
                projectDir,
                selectedTools: targetTools,
                skillNames: skillNamesToUpdate,
                overwriteList,
            });

            deps.stdout('\n✓ Skills update completed.');
        });

    return cmd;
}
