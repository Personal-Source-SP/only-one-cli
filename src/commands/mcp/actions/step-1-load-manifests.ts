import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { readMcpManifests, type McpManifest } from '@/core/mcp/index.js';

export const loadMcpManifestsStep = async (deps: ProgramDeps): Promise<McpManifest[]> => {
    const { manifests, warnings } = await readMcpManifests();
    for (const warning of warnings) {
        deps.stdout(COLORS.warning(`Warning: skipped ${warning.file}: ${warning.message}`));
    }

    if (!manifests?.length) {
        throw new Error('No MCP manifests available');
    }

    return manifests;
};
