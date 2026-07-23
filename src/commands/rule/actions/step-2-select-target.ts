import type { ProgramDeps } from '@/cli/deps.js';
import { selectSingleAllowedRuleTarget } from '@/core/target-selection/index.js';
import type { RuleTargetOption } from '@/core/target-selection/types.js';
import type { RuleCommandOptions } from '../types.js';

export const selectRuleTargetStep = async (
    deps: ProgramDeps,
    options: RuleCommandOptions,
    explicitRuleIds: string[],
): Promise<{ selectedTarget: RuleTargetOption; targetTools: RuleTargetOption[]; agentName: string }> => {
    if (!options.tool && explicitRuleIds.length > 0 && !deps.prompts?.checkbox) {
        throw new Error('Target selection is required in non-interactive mode. Specify target using --tool option.');
    }

    const selectedTarget = await selectSingleAllowedRuleTarget({
        automatic: false,
        explicit: options.tool,
        message: 'Select target IDEs/Tools for rule installation:',
        prompts: deps.prompts,
    });

    const targetTools = [selectedTarget];
    const agentName = selectedTarget.agent?.name ?? selectedTarget.vs?.name ?? selectedTarget.id;

    return { selectedTarget, targetTools, agentName };
};
