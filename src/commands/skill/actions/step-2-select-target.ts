import type { ProgramDeps } from '@/cli/deps.js';
import { selectSingleAllowedAgentTarget } from '@/core/target-selection/index.js';
import type { TargetSelectionOption } from '@/core/target-selection/types.js';
import type { SkillCommandOptions } from '../types.js';

export const selectSkillTargetStep = async (
    deps: ProgramDeps,
    options: SkillCommandOptions,
): Promise<{ targetTool: TargetSelectionOption; targetTools: TargetSelectionOption[] }> => {
    const targetTool = await selectSingleAllowedAgentTarget({
        automatic: false,
        explicit: options.tool,
        message: 'Select target IDEs/Tools for skill installation:',
        prompts: deps.prompts,
    });
    return { targetTool, targetTools: [targetTool] };
};
