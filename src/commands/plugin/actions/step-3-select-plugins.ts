import type { ProgramDeps } from '@/cli/deps.js';
import type { AllowedToolId } from '@/constants/allowed-tools.js';
import type { TargetSelectionOption } from '@/core/target-selection/index.js';
import { PLUGINS } from '@assets/plugins/index.js';
import { parseCsv } from '@/utils/index.js';
import type { PluginCommandOptions } from '../types.js';

export const selectPluginsStep = async (
    deps: ProgramDeps,
    idsArg: string | undefined,
    options: PluginCommandOptions,
    targetTool: TargetSelectionOption,
    targetId: AllowedToolId,
): Promise<string[]> => {
    const explicitPluginIds = parseCsv(idsArg);
    if (options.tool && explicitPluginIds.length === 0 && !deps.prompts?.checkbox) {
        throw new Error('Plugin selection is required in non-interactive mode. Pass plugin IDs positionally.');
    }

    const compatiblePlugins = PLUGINS.filter((p) => p.supportedTargets.includes(targetId));
    if (!compatiblePlugins?.length) {
        deps.stdout(`No plugins available for target '${targetTool.name}'. Exiting.`);
        return [];
    }

    let selectedPluginIds = parseCsv(idsArg);
    if (!selectedPluginIds?.length) {
        if (!deps.prompts?.checkbox) {
            throw new Error('Plugin selection is required in non-interactive mode. Pass plugin IDs positionally.');
        } else {
            selectedPluginIds = await deps.prompts.checkbox({
                message: `Select plugins to install for ${targetTool.name}:`,
                choices: compatiblePlugins.map((p) => ({
                    name: p.id,
                    value: p.id,
                    checked: true,
                })),
            });
        }
    } else {
        for (const pluginId of selectedPluginIds) {
            const plugin = PLUGINS.find((p) => p.id === pluginId);
            if (!plugin) {
                throw new Error(`Plugin '${pluginId}' not found in assets/plugins`);
            }
            if (!plugin.supportedTargets.includes(targetId)) {
                throw new Error(
                    `Plugin '${pluginId}' does not support target '${targetId}'. Supported targets: ${plugin.supportedTargets.join(', ')}`,
                );
            }
        }
    }

    return selectedPluginIds;
};
