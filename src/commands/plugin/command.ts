import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { AllowedToolId } from '@/constants/allowed-tools.js';
import { COLORS } from '@/constants/index.js';
import { selectAllowedAgentTargets } from '@/core/target-selection/index.js';
import { resolveProjectDir, assertProjectDirectory } from '@/core/runtime/globals.js';
import { executePluginActions } from '@/core/plugin/index.js';
import { PLUGINS } from '@assets/plugins/index.js';

const parseCsv = (val?: string): string[] =>
    val
        ?.split(',')
        .map((s) => s.trim())
        .filter(Boolean) ?? [];

export function createPluginCommand(deps: ProgramDeps): Command {
    const cmd = new Command('plugin')
        .description('🔌 Manage and install target-specific agent plugins')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[ids]', 'Comma-separated list of specific plugin IDs to install')
        .option('--tool <tools>', 'Comma-separated IDE/tool IDs to target')
        .option('--yes', 'Automatically confirm prompts')
        .action(async (pathArg: string | undefined, idsArg: string | undefined, options: { tool?: string; yes?: boolean }) => {
            const projectDir = resolveProjectDir(deps, pathArg);
            assertProjectDirectory(projectDir);

            const availablePlugins = PLUGINS.map((p) => p.id);

            if (availablePlugins.length === 0) {
                deps.stdout(COLORS.warning('No plugins available in assets/plugins.'));
                return;
            }

            let selectedPluginIds = parseCsv(idsArg);

            if (selectedPluginIds.length === 0) {
                if (options.yes || !deps.prompts?.checkbox) {
                    selectedPluginIds = [...availablePlugins];
                } else {
                    selectedPluginIds = await deps.prompts.checkbox({
                        message: 'Select plugins to install (default all):',
                        choices: availablePlugins.map((id) => ({
                            name: id,
                            value: id,
                            checked: true,
                        })),
                    });
                }
            }

            if (selectedPluginIds.length === 0) {
                deps.stdout('No plugins selected. Exiting.');
                return;
            }

            for (const pluginId of selectedPluginIds) {
                if (!availablePlugins.includes(pluginId)) {
                    throw new Error(`Plugin '${pluginId}' not found in assets/plugins`);
                }
            }

            const targetTools = await selectAllowedAgentTargets({
                automatic: Boolean(options.yes || !deps.prompts?.checkbox),
                emptyMessage: 'Select at least one target tool/IDE',
                explicit: options.tool,
                message: 'Select target IDEs/Tools for plugin installation:',
                preselected: [],
                prompts: deps.prompts,
            });

            const targetIds = targetTools.map((t) => t.value as AllowedToolId);

            for (const pluginId of selectedPluginIds) {
                const plugin = PLUGINS.find((p) => p.id === pluginId);
                if (plugin) {
                    for (const targetId of targetIds) {
                        if (!plugin.supportedTargets.includes(targetId)) {
                            throw new Error(
                                `Plugin '${pluginId}' does not support target '${targetId}'. Supported targets: ${plugin.supportedTargets.join(', ')}`,
                            );
                        }
                    }
                }
            }

            deps.stdout('\nInstalling plugins...');

            const result = await executePluginActions({
                deps,
                projectDir,
                pluginManifests: PLUGINS,
                selectedPluginIds,
                targetIds,
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
