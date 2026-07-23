import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { AllowedToolId } from '@/constants/allowed-tools.js';
import { COLORS } from '@/constants/index.js';
import { selectAllowedAgentTargets } from '@/core/target-selection/index.js';
import { resolveProjectDir, assertProjectDirectory } from '@/core/runtime/globals.js';
import { executePluginActions } from '@/core/plugin/index.js';
import { PLUGINS } from '@assets/plugins/index.js';
import { parseCsv } from '@/utils/index.js';

export function createPluginCommand(deps: ProgramDeps): Command {
    const cmd = new Command('plugin')
        .description('🔌 Manage and install target-specific agent plugins')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[ids]', 'Comma-separated list of specific plugin IDs to install')
        .option('--tool <tools>', 'Comma-separated IDE/tool IDs to target')
        .action(async (pathArg: string | undefined, idsArg: string | undefined, options: { tool?: string }) => {
            const projectDir = resolveProjectDir(deps, pathArg);
            assertProjectDirectory(projectDir);

            if (PLUGINS.length === 0) {
                deps.stdout(COLORS.warning('No plugins available in assets/plugins.'));
                return;
            }

            const explicitPluginIds = parseCsv(idsArg);

            if (!options.tool && explicitPluginIds.length > 0 && !deps.prompts?.checkbox) {
                throw new Error('Target selection is required in non-interactive mode. Specify target using --tool option.');
            }
            if (options.tool && explicitPluginIds.length === 0 && !deps.prompts?.checkbox) {
                throw new Error('Plugin selection is required in non-interactive mode. Pass plugin IDs positionally.');
            }

            // Step 1: Select agents first
            const targetTools = await selectAllowedAgentTargets({
                automatic: false,
                emptyMessage: 'Select at least one target tool/IDE',
                explicit: options.tool,
                message: 'Select target IDEs/Tools for plugin installation:',
                preselected: [],
                prompts: deps.prompts,
            });

            const targetIds = targetTools.map((t) => t.value as AllowedToolId);

            // Step 2: Resolve per-agent plugin choices
            const perTargetPluginIds: Record<AllowedToolId, string[]> = {} as Record<AllowedToolId, string[]>;

            if (explicitPluginIds.length > 0) {
                for (const pluginId of explicitPluginIds) {
                    const plugin = PLUGINS.find((p) => p.id === pluginId);
                    if (!plugin) {
                        throw new Error(`Plugin '${pluginId}' not found in assets/plugins`);
                    }
                    for (const targetId of targetIds) {
                        if (!plugin.supportedTargets.includes(targetId)) {
                            throw new Error(
                                `Plugin '${pluginId}' does not support target '${targetId}'. Supported targets: ${plugin.supportedTargets.join(', ')}`,
                            );
                        }
                    }
                }
                for (const targetId of targetIds) {
                    perTargetPluginIds[targetId] = explicitPluginIds;
                }
            } else if (!deps.prompts?.checkbox) {
                throw new Error('Plugin selection is required in non-interactive mode. Pass plugin IDs positionally.');
            } else {
                for (const targetId of targetIds) {
                    const compatiblePlugins = PLUGINS.filter((p) => p.supportedTargets.includes(targetId));
                    if (compatiblePlugins.length === 0) continue;

                    const agentName = targetTools.find((t) => t.value === targetId)?.name ?? targetId;
                    const selected = await deps.prompts.checkbox({
                        message: `Select plugins to install for ${agentName}:`,
                        choices: compatiblePlugins.map((p) => ({
                            name: p.id,
                            value: p.id,
                            checked: true,
                        })),
                    });
                    perTargetPluginIds[targetId] = selected;
                }
            }

            const allSelectedPlugins = [...new Set(Object.values(perTargetPluginIds).flat())];
            if (allSelectedPlugins.length === 0) {
                deps.stdout('No plugins selected. Exiting.');
                return;
            }

            deps.stdout('\nInstalling plugins...');

            const result = await executePluginActions({
                deps,
                projectDir,
                pluginManifests: PLUGINS,
                selectedPluginIds: allSelectedPlugins,
                targetIds,
                perTargetPluginIds,
            });

            deps.stdout('\n==================================================');
            deps.stdout('                PLUGIN INSTALL REPORT');
            deps.stdout('==================================================');

            if (result.summary.installed.length > 0) {
                deps.stdout(COLORS.success('\n✓ Successfully Installed:'));
                for (const item of result.summary.installed) {
                    deps.stdout(`  - ${COLORS.primary(item)}`);
                }
            }

            if (result.summary.actionRequired.length > 0) {
                deps.stdout(COLORS.warning('\n[Action Required]:'));
                for (const item of result.summary.actionRequired) {
                    deps.stdout(`  - ${COLORS.secondary(item)}`);
                }
            }

            if (result.summary.skipped.length > 0) {
                deps.stdout(COLORS.dim('\n- Skipped:'));
                for (const item of result.summary.skipped) {
                    deps.stdout(`  - ${COLORS.dim(item)}`);
                }
            }

            if (result.summary.failed.length > 0) {
                deps.stdout(COLORS.error('\n✗ Failed:'));
                for (const item of result.summary.failed) {
                    deps.stdout(`  - ${COLORS.error(item)}`);
                }
            }

            deps.stdout('\n==================================================\n');
        });

    return cmd;
}
