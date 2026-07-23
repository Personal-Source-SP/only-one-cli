import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { selectIgnoreTargets } from '@/core/ignore/index.js';
import { parseCsv } from '@/utils/index.js';
import type { PluginCommandOptions } from './types.js';
import { executeAndReportPluginsStep, loadPluginManifestsStep, selectPluginsStep, selectPluginTargetStep } from './actions/index.js';

export function createPluginCommand(deps: ProgramDeps): Command {
    const cmd = new Command('plugin')
        .description('🔌 Manage and install target-specific agent plugins')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[ids]', 'Comma-separated list of specific plugin IDs to install')
        .option('--tool <tools>', 'Comma-separated IDE/tool IDs to target')
        .action(async (pathArg: string | undefined, idsArg: string | undefined, options: PluginCommandOptions) => {
            const { projectDir, plugins } = loadPluginManifestsStep(deps, pathArg);
            if (!plugins?.length) {
                return;
            }

            const explicitPluginIds = parseCsv(idsArg);
            const { targetTool, targetId, targetIds } = await selectPluginTargetStep(deps, options, explicitPluginIds);

            const selectedPluginIds = await selectPluginsStep(deps, idsArg, options, targetTool, targetId);
            if (!selectedPluginIds?.length) {
                return;
            }

            const ignoreTargets = await selectIgnoreTargets(deps);

            await executeAndReportPluginsStep(deps, projectDir, selectedPluginIds, targetIds, targetId, ignoreTargets);
        });

    return cmd;
}
