import { homedir } from 'node:os';
import type { ProgramDeps } from '@/cli/deps.js';
import { checkExistingMcps, type McpManifest } from '@/core/mcp/index.js';
import type { McpIdeAdapter } from '@/core/mcp/types.js';
import { parseCsv } from '@/utils/index.js';

export const selectMcpsStep = async (
    deps: ProgramDeps,
    namesArg: string | undefined,
    manifests: McpManifest[],
    selectedIde: McpIdeAdapter,
): Promise<{ selectedMcpIds: string[]; selectedManifests: McpManifest[]; allExisting: Awaited<ReturnType<typeof checkExistingMcps>> }> => {
    const homeDir = deps.env.HOME || deps.env.USERPROFILE || homedir();
    const selectedIdeIds = [selectedIde.id];
    const allExisting = await checkExistingMcps(
        homeDir,
        process.platform,
        selectedIdeIds,
        manifests.map((m) => m.id),
    );

    let selectedMcpIds = parseCsv(namesArg);
    if (!selectedMcpIds?.length) {
        if (!deps.prompts?.checkbox) {
            throw new Error('MCP server selection is required in non-interactive mode. Pass server names positionally.');
        } else {
            const choices = manifests.map((m) => {
                const isExisting = allExisting.some((e) => e.mcpId === m.id && e.exists);
                return {
                    name: isExisting ? `${m.id} (already exists)` : m.id,
                    value: m.id,
                    checked: !isExisting,
                    isExisting,
                };
            });
            choices.sort((a, b) => Number(a.isExisting) - Number(b.isExisting));

            selectedMcpIds = await deps.prompts.checkbox({
                message: `Select MCP servers to configure for ${selectedIde.name}:`,
                choices: choices.map(({ isExisting, ...choice }) => choice),
            });
        }
    }

    if (!selectedMcpIds?.length) {
        return { selectedMcpIds: [], selectedManifests: [], allExisting };
    }

    const selectedManifests = selectedMcpIds.map((id) => {
        const found = manifests.find((m) => m.id === id);
        if (!found) throw new Error(`Unknown MCP server '${id}'`);
        return found;
    });

    return { selectedMcpIds, selectedManifests, allExisting };
};
