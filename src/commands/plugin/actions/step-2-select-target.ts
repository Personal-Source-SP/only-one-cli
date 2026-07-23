import type { ProgramDeps } from '@/cli/deps.js';
import type { AllowedToolId } from '@/constants/allowed-tools.js';
import { selectSingleAllowedAgentTarget } from '@/core/target-selection/index.js';
import type { TargetSelectionOption } from '@/core/target-selection/types.js';
import type { PluginCommandOptions } from '../types.js';

export const selectPluginTargetStep = async (
    deps: ProgramDeps,
    options: PluginCommandOptions,
    explicitPluginIds: string[],
): Promise<{ targetTool: TargetSelectionOption; targetId: AllowedToolId; targetIds: AllowedToolId[] }> => {
    if (!options.tool && explicitPluginIds.length > 0 && !deps.prompts?.checkbox) {
        throw new Error('Target selection is required in non-interactive mode. Specify target using --tool option.');
    }

    const targetTool = await selectSingleAllowedAgentTarget({
        automatic: false,
        explicit: options.tool,
        message: 'Select target IDEs/Tools for plugin installation:',
        prompts: deps.prompts,
    });

    const targetId = targetTool.value as AllowedToolId;
    return { targetTool, targetId, targetIds: [targetId] };
};
