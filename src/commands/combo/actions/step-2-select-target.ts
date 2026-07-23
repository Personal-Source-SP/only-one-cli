import type { ProgramDeps } from '@/cli/deps.js';
import { selectSingleAllowedAgentTarget } from '@/core/target-selection/index.js';
import type { TargetSelectionOption } from '@/core/target-selection/types.js';
import type { ComboCommandOptions } from '../types.js';

export const selectComboTargetStep = async (
    deps: ProgramDeps,
    options: ComboCommandOptions,
): Promise<{ targetTool: TargetSelectionOption; targetTools: TargetSelectionOption[] }> => {
    const targetTool = await selectSingleAllowedAgentTarget({
        automatic: false,
        explicit: options.tool,
        message: 'Select target IDEs/Tools for combo setup:',
        prompts: deps.prompts,
    });
    return { targetTool, targetTools: [targetTool] };
};
