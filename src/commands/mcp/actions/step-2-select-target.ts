import type { ProgramDeps } from '@/cli/deps.js';
import type { McpIdeAdapter } from '@/core/mcp/types.js';
import { selectSingleAllowedMcpTarget } from '@/core/target-selection/index.js';
import type { McpCommandOptions } from '../types.js';

export const selectMcpTargetStep = async (deps: ProgramDeps, options: McpCommandOptions): Promise<McpIdeAdapter> => {
    return selectSingleAllowedMcpTarget({
        automatic: false,
        explicit: options.ide,
        message: 'Select target IDEs for global MCP sync:',
        prompts: deps.prompts,
    });
};
