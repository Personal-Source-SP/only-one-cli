import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { AllowedToolId } from '@/constants/allowed-tools.js';
import { COLORS } from '@/constants/index.js';
import { selectAllowedRuleTargets } from '@/core/target-selection/index.js';
import { resolveProjectDir, assertProjectDirectory } from '@/core/runtime/globals.js';
import { checkExistingRules, installRules } from '@/core/rule/index.js';
import { RULES } from '@assets/rules/index.js';

const parseCsv = (val?: string): string[] =>
    val
        ?.split(',')
        .map((s) => s.trim())
        .filter(Boolean) ?? [];

export function createRuleCommand(deps: ProgramDeps): Command {
    const cmd = new Command('rule')
        .description('📜 Manage and copy persistent agent rules')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[ids]', 'Comma-separated list of specific rule IDs to sync')
        .option('--tool <tools>', 'Comma-separated IDE/tool IDs to target')
        .option('--yes', 'Automatically confirm prompts')
        .action(async (pathArg: string | undefined, idsArg: string | undefined, options: { tool?: string; yes?: boolean }) => {
            const projectDir = resolveProjectDir(deps, pathArg);
            assertProjectDirectory(projectDir);

            const availableRules = RULES.map((r) => r.id);

            if (availableRules.length === 0) {
                deps.stdout(COLORS.warning('No rules available in assets/rules.'));
                return;
            }

            // Parse selected rules
            let selectedRuleIds = parseCsv(idsArg);
            if (selectedRuleIds.length === 0) {
                if (options.yes || !deps.prompts?.checkbox) {
                    selectedRuleIds = [...availableRules];
                } else {
                    selectedRuleIds = await deps.prompts.checkbox({
                        message: 'Select rules to sync (default all):',
                        choices: availableRules.map((id) => ({
                            name: id,
                            value: id,
                            checked: true,
                        })),
                    });
                }
            }

            if (selectedRuleIds.length === 0) {
                deps.stdout('No rules selected. Exiting.');
                return;
            }

            for (const ruleId of selectedRuleIds) {
                if (!availableRules.includes(ruleId)) {
                    throw new Error(`Rule '${ruleId}' not found in assets/rules`);
                }
            }

            // Target selection routed through rule capability filtering
            const targetTools = await selectAllowedRuleTargets({
                automatic: Boolean(options.yes || !deps.prompts?.checkbox),
                emptyMessage: 'Select at least one target tool/IDE for rules',
                explicit: options.tool,
                message: 'Select target IDEs/Tools for rule installation:',
                preselected: [],
                prompts: deps.prompts,
            });

            const targetIds = targetTools.map((t) => t.id as AllowedToolId);

            // Reject explicit unsupported targets (such as Codex)
            if (options.tool) {
                const explicitRequested = parseCsv(options.tool);
                if (explicitRequested.includes('codex')) {
                    throw new Error(`Target 'codex' does not support rule installation. Valid rule targets: antigravity, claude, cursor`);
                }
            }

            // Check duplicate existing rule files
            const existing = await checkExistingRules(projectDir, targetTools, selectedRuleIds);
            const alreadyExisting = existing.filter((r) => r.exists);
            let overwriteList: string[] = [];

            if (alreadyExisting.length > 0) {
                if (options.yes || !deps.prompts?.checkbox) {
                    overwriteList = alreadyExisting.map((r) => `${r.toolId}:${r.ruleId}`);
                } else {
                    overwriteList = await deps.prompts.checkbox({
                        message: 'The following rule files already exist. Select which ones you want to overwrite:',
                        choices: alreadyExisting.map((r) => ({
                            name: `${r.ruleId} in ${r.toolName} (${r.destPath})`,
                            value: `${r.toolId}:${r.ruleId}`,
                            checked: true,
                        })),
                    });
                }
            }

            deps.stdout('\nSyncing rules...');

            const { results } = await installRules({
                deps,
                projectDir,
                selectedTargets: targetTools,
                ruleIds: selectedRuleIds,
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
