import type { ProgramDeps } from '@/cli/deps.js';
import { selectSingleAllowedMcpTarget } from '@/core/target-selection/index.js';
import type { TargetSelectionOption } from '@/core/target-selection/types.js';
import type { McpCommandOptions } from '../types.js';

export const selectMcpTargetStep = async (deps: ProgramDeps, options: McpCommandOptions): Promise<TargetSelectionOption> => {
    return selectSingleAllowedMcpTarget({
        automatic: false,
        explicit: options.ide,
        message: 'Select target IDEs for global MCP sync:',
        prompts: deps.prompts,
    });
};
