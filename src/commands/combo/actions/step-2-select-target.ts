import type { ProgramDeps } from '@/cli/deps.js';
import type { AgentToolOption } from '@/core/agent/tools.js';
import { selectSingleAllowedAgentTarget } from '@/core/target-selection/index.js';
import type { ComboCommandOptions } from '../types.js';

export const selectComboTargetStep = async (
    deps: ProgramDeps,
    options: ComboCommandOptions,
): Promise<{ targetTool: AgentToolOption; targetTools: AgentToolOption[] }> => {
    const targetTool = await selectSingleAllowedAgentTarget({
        automatic: false,
        explicit: options.tool,
        message: 'Select target IDEs/Tools for combo setup:',
        prompts: deps.prompts,
    });
    return { targetTool, targetTools: [targetTool] };
};
