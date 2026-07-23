import { Command } from 'commander';
import { existsSync } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { confirm } from '@inquirer/prompts';
import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { selectAllowedAgentTargets } from '@/core/target-selection/index.js';
import { resolveProjectDir, assertProjectDirectory } from '@/core/runtime/globals.js';
import { checkExistingSkills, installSkills } from '@/core/skill/index.js';
import { installWorkflows, checkExistingWorkflows } from '@/core/workflow/index.js';
import { searchableMultiSelect } from '@/prompts/searchable-multi-select.js';
import { SKILLS } from '@assets/skills/index.js';

const getAvailableSkillNames = (): string[] => {
    return SKILLS.map((s) => s.name);
};
import { parseCsv } from '@/utils/index.js';

export function createSkillCommand(deps: ProgramDeps): Command {
    const cmd = new Command('skill')
        .description('🤖 Manage and synchronize custom agent skills')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[names]', 'Comma-separated list of specific skill names to sync')
        .option('--tool <tools>', 'Comma-separated IDE/tool IDs to target')
        .option('--no-ignore', 'Skip updating the project .gitignore file')
        .action(async (pathArg: string | undefined, namesArg: string | undefined, options: { tool?: string; ignore?: boolean }) => {
            const projectDir = resolveProjectDir(deps, pathArg);
            assertProjectDirectory(projectDir);

            const availableSkills = await getAvailableSkillNames();

            if (availableSkills.length === 0) {
                deps.stdout(COLORS.warning('No custom skills available in libraries/skills.'));
                return;
            }

            const targetTools = await selectAllowedAgentTargets({
                automatic: false,
                emptyMessage: 'Select at least one target tool/IDE',
                explicit: options.tool,
                message: 'Select target IDEs/Tools for skill installation:',
                preselected: [],
                prompts: deps.prompts,
            });

            // 2. Select Skills
            let selectedSkills = parseCsv(namesArg);
            if (selectedSkills.length === 0) {
                if (!deps.prompts?.checkbox) {
                    throw new Error('Skill selection is required in non-interactive mode. Pass skill names positionally.');
                } else {
                    selectedSkills = await deps.prompts.checkbox({
                        message: 'Select custom skills to add (default all):',
                        choices: availableSkills.map((name) => ({
                            name,
                            value: name,
                            checked: true,
                        })),
                    });
                }
            }

            if (selectedSkills.length === 0) {
                deps.stdout('No skills selected. Exiting.');
                return;
            }

            // Validate requested skills exist
            for (const skill of selectedSkills) {
                if (!availableSkills.includes(skill)) {
                    throw new Error(`Skill '${skill}' not found in libraries/skills`);
                }
            }

            // 3. Pre-execution Duplicate Check
            const existing = await checkExistingSkills(projectDir, targetTools, selectedSkills);
            const alreadyExisting = existing.filter((s) => s.exists);
            let overwriteList: string[] = [];

            // 4. Verification Checkbox Prompt
            if (alreadyExisting.length > 0) {
                if (deps.prompts?.checkbox) {
                    overwriteList = await deps.prompts.checkbox({
                        message: 'The following skills already exist. Select which ones you want to overwrite/reinstall:',
                        choices: alreadyExisting.map((s) => ({
                            name: `${s.skillName} in ${s.toolName} (${s.destPath})`,
                            value: `${s.toolId}:${s.skillName}`,
                            checked: true,
                        })),
                    });
                }
            }

            deps.stdout('\nSyncing skills...');

            // 5. Execution
            const results = await installSkills({
                deps,
                projectDir,
                selectedTools: targetTools,
                skillNames: selectedSkills,
                overwriteList,
                noIgnore: options.ignore === false,
            });

            // 6. Summary Report
            deps.stdout('\n==================================================');
            deps.stdout('                SKILLS SYNC REPORT');
            deps.stdout('==================================================');

            const successes = results.filter((r) => r.status === 'success');
            const overwrites = results.filter((r) => r.status === 'overwritten');
            const skips = results.filter((r) => r.status === 'skipped');
            const failures = results.filter((r) => r.status === 'failed');

            if (successes.length > 0) {
                deps.stdout(COLORS.success('\n✓ Successfully Installed (New):'));
                for (const r of successes) {
                    deps.stdout(`  - ${COLORS.secondary(r.skillName)} -> ${COLORS.primary(r.toolName)}`);
                }
            }

            if (overwrites.length > 0) {
                deps.stdout(COLORS.success('\n✓ Successfully Overwritten/Reinstalled:'));
                for (const r of overwrites) {
                    deps.stdout(`  - ${COLORS.secondary(r.skillName)} -> ${COLORS.primary(r.toolName)} [Overwritten]`);
                }
            }

            if (skips.length > 0) {
                deps.stdout(COLORS.dim('\n- Skipped (Kept Existing):'));
                for (const r of skips) {
                    deps.stdout(`  - ${COLORS.secondary(r.skillName)} in ${COLORS.primary(r.toolName)}`);
                }
            }

            if (failures.length > 0) {
                deps.stdout(COLORS.error('\n✗ Failed:'));
                for (const r of failures) {
                    deps.stdout(`  - ${COLORS.secondary(r.skillName)} in ${COLORS.primary(r.toolName)}: ${COLORS.warning(r.error || '')}`);
                }
            }

            deps.stdout('\n==================================================\n');

            // 7. Associated Workflows Check
            const installedSkillNames = [...successes, ...overwrites].map((r) => r.skillName);
            const workflowsToPrompt = new Set<string>();

            for (const skillName of installedSkillNames) {
                const skillMeta = SKILLS.find((s) => s.name === skillName);
                if (skillMeta?.associatedWorkflows) {
                    for (const wf of skillMeta.associatedWorkflows) {
                        workflowsToPrompt.add(wf);
                    }
                }
            }

            if (workflowsToPrompt.size > 0 && deps.prompts?.checkbox) {
                const wfList = Array.from(workflowsToPrompt);
                const checks = await checkExistingWorkflows(projectDir, targetTools, wfList);
                const missingWorkflows = Array.from(new Set(checks.filter((w) => !w.exists).map((w) => w.workflowName)));

                if (missingWorkflows.length > 0) {
                    const installWfs = await confirm({
                        message: `The installed skills are associated with workflow(s): ${missingWorkflows.join(', ')}. Would you like to install them?`,
                        default: true,
                    });

                    if (installWfs) {
                        deps.stdout('\nSyncing workflows...');
                        const wfResults = await installWorkflows({
                            deps,
                            projectDir,
                            selectedTools: targetTools,
                            workflowNames: missingWorkflows,
                            overwriteList: missingWorkflows.map((w) => targetTools.map((t) => `${t.value}:${w}`)).flat(),
                            noIgnore: options.ignore === false,
                        });

                        deps.stdout('\n==================================================');
                        deps.stdout('               WORKFLOWS SYNC REPORT');
                        deps.stdout('==================================================');
                        for (const r of wfResults) {
                            const statusColor =
                                r.status === 'success' ? COLORS.success : r.status === 'skipped' ? COLORS.dim : COLORS.error;
                            deps.stdout(
                                `  - ${COLORS.secondary(r.workflowName)} -> ${COLORS.primary(r.toolName)}: ${statusColor(r.status)}${r.error ? ` (${r.error})` : ''}`,
                            );
                        }
                        deps.stdout('==================================================\n');
                    }
                }
            }
        });

    return cmd;
}
