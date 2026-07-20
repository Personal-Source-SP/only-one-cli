import { Command } from 'commander';
import { homedir } from 'node:os';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { getInstallableAgentTools, getAgentToolById } from '@/core/agent/tools.js';
import { resolveProjectDir, assertProjectDirectory } from '@/core/runtime/globals.js';
import { readComboManifests, checkExistingComboComponents, installCombo } from '@/core/combo/index.js';

const parseCsv = (val?: string): string[] =>
    val
        ?.split(',')
        .map((s) => s.trim())
        .filter(Boolean) ?? [];

export function createComboCommand(deps: ProgramDeps): Command {
    const cmd = new Command('combo')
        .description('✨ Initialize project using predefined combos (packages, skills, configs, and MCPs)')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[names]', 'Comma-separated list of combo names to apply')
        .option('--tool <tools>', 'Comma-separated IDE/tool IDs to target')
        .option('--yes', 'Automatically confirm prompts')
        .option('--no-ignore', 'Skip updating the .gitignore file')
        .action(
            async (
                pathArg: string | undefined,
                namesArg: string | undefined,
                options: { tool?: string; yes?: boolean; ignore?: boolean },
            ) => {
                const projectDir = resolveProjectDir(deps, pathArg);
                assertProjectDirectory(projectDir);

                const allTools = getInstallableAgentTools();
                const availableCombos = await readComboManifests();

                if (availableCombos.length === 0) {
                    deps.stdout(COLORS.warning('No predefined combos available in libraries/combos.'));
                    return;
                }

                // 1. Choose IDEs
                let selectedToolIds = parseCsv(options.tool);
                if (selectedToolIds.length === 0) {
                    if (options.yes || !deps.prompts?.checkbox) {
                        const configured = allTools.filter((t) => t.skillsDir && existsSync(join(projectDir, t.skillsDir)));
                        selectedToolIds = configured.length > 0 ? configured.map((t) => t.value) : allTools.map((t) => t.value);
                    } else {
                        selectedToolIds = await deps.prompts.checkbox({
                            message: 'Select target IDEs/Tools for combo setup:',
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

                // 2. Select Combo
                let selectedComboNames = parseCsv(namesArg);
                if (selectedComboNames.length === 0) {
                    if (options.yes || !deps.prompts?.checkbox) {
                        selectedComboNames = [availableCombos[0].id];
                    } else {
                        selectedComboNames = await deps.prompts.checkbox({
                            message: 'Select combos to install (default first):',
                            choices: availableCombos.map((c) => ({
                                name: c.description ? `${c.name} — ${c.description}` : c.name,
                                value: c.id,
                            })),
                        });
                    }
                }

                if (selectedComboNames.length === 0) {
                    deps.stdout('No combos selected. Exiting.');
                    return;
                }

                // Process combos one by one
                for (const comboName of selectedComboNames) {
                    const combo = availableCombos.find(
                        (c) => c.id.toLowerCase() === comboName.toLowerCase() || c.name.toLowerCase() === comboName.toLowerCase(),
                    );
                    if (!combo) {
                        throw new Error(`Combo '${comboName}' not found in libraries/combos`);
                    }

                    deps.stdout(`\nProcessing combo: ${COLORS.primary(combo.name)}...`);

                    // 3. Pre-execution Duplicate Check
                    const checks = await checkExistingComboComponents({
                        projectDir,
                        homeDir: homedir(),
                        platform: process.platform,
                        selectedTools: targetTools,
                        combo,
                    });

                    const alreadyExisting = checks.filter((c) => c.exists);
                    let overwriteList: string[] = [];

                    // 4. Verification Checkbox Prompt
                    if (alreadyExisting.length > 0) {
                        if (options.yes || !deps.prompts?.checkbox) {
                            overwriteList = alreadyExisting.map((c) => c.id);
                        } else {
                            overwriteList = await deps.prompts.checkbox({
                                message: `The following components in combo '${combo.name}' already exist. Select which ones you want to overwrite/reinstall:`,
                                choices: alreadyExisting.map((c) => ({
                                    name: c.label,
                                    value: c.id,
                                    checked: true,
                                })),
                            });
                        }
                    }

                    // 5. Execution
                    const results = await installCombo({
                        deps,
                        projectDir,
                        homeDir: homedir(),
                        platform: process.platform,
                        selectedTools: targetTools,
                        combo,
                        overwriteList,
                        noIgnore: options.ignore === false,
                    });

                    // 6. Summary Report
                    deps.stdout('\n==================================================');
                    deps.stdout(`             COMBO '${combo.name.toUpperCase()}' REPORT`);
                    deps.stdout('==================================================');

                    // Packages
                    if (results.packages.length > 0) {
                        deps.stdout('\nPackages:');
                        for (const p of results.packages) {
                            const statusColor =
                                p.status === 'success' ? COLORS.success : p.status === 'skipped' ? COLORS.dim : COLORS.error;
                            deps.stdout(`  - ${COLORS.secondary(p.name)}: ${statusColor(p.status)}${p.error ? ` (${p.error})` : ''}`);
                        }
                    }

                    // Configs
                    if (results.configs.length > 0) {
                        deps.stdout('\nConfigs:');
                        for (const c of results.configs) {
                            const statusColor =
                                c.status === 'success' ? COLORS.success : c.status === 'skipped' ? COLORS.dim : COLORS.error;
                            deps.stdout(`  - ${COLORS.secondary(c.name)}: ${statusColor(c.status)}${c.error ? ` (${c.error})` : ''}`);
                        }
                    }

                    // Skills
                    if (results.skills.length > 0) {
                        deps.stdout('\nSkills:');
                        for (const s of results.skills) {
                            const toolName = targetTools.find((t) => t.value === s.toolId)?.name || s.toolId;
                            const statusColor =
                                s.status === 'success' || s.status === 'overwritten'
                                    ? COLORS.success
                                    : s.status === 'skipped'
                                      ? COLORS.dim
                                      : COLORS.error;
                            deps.stdout(
                                `  - ${COLORS.secondary(s.skillName)} in ${COLORS.primary(toolName)}: ${statusColor(s.status)}${s.error ? ` (${s.error})` : ''}`,
                            );
                        }
                    }

                    // MCPs
                    if (results.mcps.length > 0) {
                        deps.stdout('\nMCP Configurations:');
                        for (const m of results.mcps) {
                            const ideName = m.ideId === 'cursor' ? 'Cursor' : m.ideId === 'antigravity' ? 'Antigravity' : m.ideId;
                            const statusColor =
                                m.status === 'success' ? COLORS.success : m.status === 'skipped' ? COLORS.dim : COLORS.error;
                            deps.stdout(
                                `  - ${COLORS.secondary(m.mcpId)} in ${COLORS.primary(ideName)}: ${statusColor(m.status)}${m.error ? ` (${m.error})` : ''}`,
                            );
                        }
                    }

                    deps.stdout('\n==================================================\n');
                }
            },
        );

    return cmd;
}
