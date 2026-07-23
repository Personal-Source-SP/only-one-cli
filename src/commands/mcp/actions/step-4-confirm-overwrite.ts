import type { ProgramDeps } from '@/cli/deps.js';
import type { checkExistingMcps } from '@/core/mcp/index.js';

export const confirmMcpOverwriteStep = async (
    deps: ProgramDeps,
    selectedMcpIds: string[],
    allExisting: Awaited<ReturnType<typeof checkExistingMcps>>,
): Promise<string[]> => {
    const alreadyExisting = allExisting.filter((m) => selectedMcpIds.includes(m.mcpId) && m.exists);
    let overwriteList: string[] = [];

    if (alreadyExisting.length > 0 && deps.prompts?.checkbox) {
        overwriteList = await deps.prompts.checkbox({
            message: 'The following MCP configurations already exist. Select which ones you want to overwrite/reconfigure:',
            choices: alreadyExisting.map((m) => ({
                name: `${m.mcpId} in ${m.ideName}`,
                value: `${m.ideId}:${m.mcpId}`,
                checked: true,
            })),
        });
    }

    return overwriteList;
};
