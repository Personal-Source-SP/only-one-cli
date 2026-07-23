import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { AllowedToolId } from '@/constants/allowed-tools.js';
import { COLORS } from '@/constants/index.js';
import { selectAllowedRuleTargets } from '@/core/target-selection/index.js';
import { resolveProjectDir, assertProjectDirectory } from '@/core/runtime/globals.js';
import { checkExistingRules, installRules } from '@/core/rule/index.js';
import { RULES } from '@assets/rules/index.js';
import { parseCsv } from '@/utils/index.js';

export function createRuleCommand(deps: ProgramDeps): Command {
    const cmd = new Command('rule')
        .description('📜 Manage and copy persistent agent rules')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[ids]', 'Comma-separated list of specific rule IDs to sync')
        .option('--tool <tools>', 'Comma-separated IDE/tool IDs to target')
        .action(async (pathArg: string | undefined, idsArg: string | undefined, options: { tool?: string }) => {
            const projectDir = resolveProjectDir(deps, pathArg);
            assertProjectDirectory(projectDir);

            if (RULES.length === 0) {
                deps.stdout(COLORS.warning('No rules available in assets/rules.'));
                return;
            }

            const explicitRuleIds = parseCsv(idsArg);

            if (!options.tool && explicitRuleIds.length > 0 && !deps.prompts?.checkbox) {
                throw new Error('Target selection is required in non-interactive mode. Specify target using --tool option.');
            }
            if (options.tool && explicitRuleIds.length === 0 && !deps.prompts?.checkbox) {
                throw new Error('Rule selection is required in non-interactive mode. Pass rule IDs positionally.');
            }

            // Target selection routed through rule capability filtering first
            const targetTools = await selectAllowedRuleTargets({
                automatic: false,
                emptyMessage: 'Select at least one target tool/IDE for rules',
                explicit: options.tool,
                message: 'Select target IDEs/Tools for rule installation:',
                preselected: [],
                prompts: deps.prompts,
            });

            // Reject explicit unsupported targets (such as Codex)
            if (options.tool) {
                const explicitRequested = parseCsv(options.tool);
                if (explicitRequested.includes('codex')) {
                    throw new Error(`Target 'codex' does not support rule installation. Valid rule targets: antigravity, claude, cursor`);
                }
            }

            const targetIds = targetTools.map((t) => t.id as AllowedToolId);

            // Step 2: Per-agent rule selection
            const perTargetRuleIds: Record<AllowedToolId, string[]> = {} as Record<AllowedToolId, string[]>;

            if (explicitRuleIds.length > 0) {
                for (const ruleId of explicitRuleIds) {
                    const rule = RULES.find((r) => r.id === ruleId);
                    if (!rule) {
                        throw new Error(`Rule '${ruleId}' not found in assets/rules`);
                    }
                }
                for (const targetId of targetIds) {
                    perTargetRuleIds[targetId] = explicitRuleIds;
                }
            } else if (!deps.prompts?.checkbox) {
                throw new Error('Rule selection is required in non-interactive mode. Pass rule IDs positionally.');
            } else {
                for (const targetTool of targetTools) {
                    const targetId = targetTool.id as AllowedToolId;
                    const compatibleRules = RULES; // All current rules support rule-capable targets
                    const agentName = targetTool.agent?.name ?? targetTool.vs?.name ?? targetTool.id;

                    const selected = await deps.prompts.checkbox({
                        message: `Select rules to sync for ${agentName}:`,
                        choices: compatibleRules.map((r) => ({
                            name: r.id,
                            value: r.id,
                            checked: true,
                        })),
                    });
                    perTargetRuleIds[targetId] = selected;
                }
            }

            const allSelectedRuleIds = [...new Set(Object.values(perTargetRuleIds).flat())];
            if (allSelectedRuleIds.length === 0) {
                deps.stdout('No rules selected. Exiting.');
                return;
            }

            // Check duplicate existing rule files
            const existing = await checkExistingRules(projectDir, targetTools, allSelectedRuleIds);
            const alreadyExisting = existing.filter((r) => r.exists);
            let overwriteList: string[] = [];

            if (alreadyExisting.length > 0) {
                if (deps.prompts?.checkbox) {
                    overwriteList = await deps.prompts.checkbox({
                        message: 'The following rule files already exist. Select which ones you want to overwrite:',
                        choices: alreadyExisting.map((r) => ({
                            name: `${r.ruleId} in ${r.toolName} (${r.destPath})`,
                            value: `${r.toolId}:${r.ruleId}`,
                            checked: true,
                        })),
                    });
                }
                // In non-TTY mode, overwriteList remains empty -> existing items are skipped safely
            }

            deps.stdout('\nSyncing rules...');

            const { results } = await installRules({
                deps,
                projectDir,
                selectedTargets: targetTools,
                ruleIds: allSelectedRuleIds,
                overwriteList,
            });

            // Structured summary report
            deps.stdout('\n==================================================');
            deps.stdout('                RULE SYNC REPORT');
            deps.stdout('==================================================');

            const successes = results.filter((r) => r.status === 'success');
            const notReady = results.filter((r) => r.status === 'installed_not_ready');
            const overwrites = results.filter((r) => r.status === 'overwritten');
            const skips = results.filter((r) => r.status === 'skipped');
            const failures = results.filter((r) => r.status === 'failed');

            if (successes.length > 0) {
                deps.stdout(COLORS.success('\n✓ Successfully Installed:'));
                for (const r of successes) {
                    deps.stdout(`  - ${COLORS.secondary(r.ruleId)} -> ${COLORS.primary(r.toolName)}`);
                }
            }

            if (notReady.length > 0) {
                deps.stdout(COLORS.warning('\n! Installed (Action Required / Pending Dependencies):'));
                for (const r of notReady) {
                    deps.stdout(`  - ${COLORS.secondary(r.ruleId)} -> ${COLORS.primary(r.toolName)}: ${r.details || 'Pending action'}`);
                }
            }

            if (overwrites.length > 0) {
                deps.stdout(COLORS.success('\n✓ Overwritten:'));
                for (const r of overwrites) {
                    deps.stdout(`  - ${COLORS.secondary(r.ruleId)} -> ${COLORS.primary(r.toolName)} [Overwritten]`);
                }
            }

            if (skips.length > 0) {
                deps.stdout(COLORS.dim('\n- Skipped:'));
                for (const r of skips) {
                    deps.stdout(`  - ${COLORS.secondary(r.ruleId)} in ${COLORS.primary(r.toolName)}`);
                }
            }

            if (failures.length > 0) {
                deps.stdout(COLORS.error('\n✗ Failed:'));
                for (const r of failures) {
                    deps.stdout(`  - ${COLORS.secondary(r.ruleId)} in ${COLORS.primary(r.toolName)}: ${COLORS.error(r.error || '')}`);
                }
            }

            deps.stdout('\n==================================================\n');
        });

    return cmd;
}
