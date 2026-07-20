import { Command } from 'commander';
import { existsSync } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { getInstallableAgentTools, getAgentToolById } from '@/core/agent/tools.js';
import { resolveProjectDir, assertProjectDirectory } from '@/core/runtime/globals.js';
import { checkExistingSkills, installSkills } from '@/core/skill/index.js';
import { searchableMultiSelect } from '@/prompts/searchable-multi-select.js';

const skillsDir = fileURLToPath(new URL('../../../libraries/skills', import.meta.url));

const getAvailableSkillNames = async (): Promise<string[]> => {
    if (!existsSync(skillsDir)) return [];
    const entries = await readdir(skillsDir);
    const names: string[] = [];
    for (const name of entries) {
        try {
            const s = await stat(join(skillsDir, name));
            if (s.isDirectory()) names.push(name);
        } catch {}
    }
    return names;
};

const parseCsv = (val?: string): string[] =>
    val
        ?.split(',')
        .map((s) => s.trim())
        .filter(Boolean) ?? [];

export function createSkillCommand(deps: ProgramDeps): Command {
    const cmd = new Command('skill')
        .description('🤖 Manage and synchronize custom agent skills')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[names]', 'Comma-separated list of specific skill names to sync')
        .option('--tool <tools>', 'Comma-separated IDE/tool IDs to target')
        .option('--yes', 'Automatically confirm prompts')
        .option('--no-ignore', 'Skip updating the project .gitignore file')
        .action(
            async (
                pathArg: string | undefined,
                namesArg: string | undefined,
                options: { tool?: string; yes?: boolean; ignore?: boolean },
            ) => {
                const projectDir = resolveProjectDir(deps, pathArg);
                assertProjectDirectory(projectDir);

                const allTools = getInstallableAgentTools();
                const availableSkills = await getAvailableSkillNames();

                if (availableSkills.length === 0) {
                    deps.stdout(COLORS.warning('No custom skills available in libraries/skills.'));
                    return;
                }

                // 1. Choose IDEs
                let selectedToolIds = parseCsv(options.tool);
                if (selectedToolIds.length === 0) {
                    if (options.yes || !deps.prompts?.checkbox) {
                        // Default to tools already detected/configured, or all tools
                        const configured = allTools.filter((t) => t.skillsDir && existsSync(join(projectDir, t.skillsDir)));
                        selectedToolIds = configured.length > 0 ? configured.map((t) => t.value) : allTools.map((t) => t.value);
                    } else {
                        selectedToolIds = await deps.prompts.checkbox({
                            message: 'Select target IDEs/Tools for skill installation:',
                            choices: allTools.map((t) => ({
                                name: t.name,
                                value: t.value,
                                checked: t.skillsDir ? existsSync(join(projectDir, t.skillsDir)) : false,
                            })),
                        });
                    }
                }

                if (selectedToolIds.length === 0) {
                    throw new Error('Select at least one target tool/IDE');
                }

                const targetTools = selectedToolIds.map((id) => getAgentToolById(id)).filter(Boolean) as typeof allTools;

                // 2. Select Skills
                let selectedSkills = parseCsv(namesArg);
                if (selectedSkills.length === 0) {
                    if (options.yes || !deps.prompts?.checkbox) {
                        selectedSkills = [...availableSkills];
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
                    if (options.yes || !deps.prompts?.checkbox) {
                        overwriteList = alreadyExisting.map((s) => `${s.toolId}:${s.skillName}`);
                    } else {
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
                        deps.stdout(
                            `  - ${COLORS.secondary(r.skillName)} in ${COLORS.primary(r.toolName)}: ${COLORS.warning(r.error || '')}`,
                        );
                    }
                }

                deps.stdout('\n==================================================\n');
            },
        );

    return cmd;
}
