import { existsSync, readFileSync } from 'node:fs';
import { mcpIdeAdapters, findMcpIdeAdapter } from './adapters.js';

export type ExistingMcp = {
    configPath: string;
    exists: boolean;
    ideId: string;
    ideName: string;
    mcpId: string;
};

export const checkExistingMcps = async (
    homeDir: string,
    platform: NodeJS.Platform,
    ideIds: string[],
    mcpIds: string[],
): Promise<ExistingMcp[]> => {
    const results: ExistingMcp[] = [];
    for (const ideId of ideIds) {
        const adapter = findMcpIdeAdapter(ideId);
        if (!adapter) continue;
        const configPath = adapter.getConfigPath(homeDir, platform);
        let config: Record<string, unknown> = {};
        if (existsSync(configPath)) {
            config = adapter.codec.parse(readFileSync(configPath, 'utf8'), configPath);
        }
        const servers = adapter.getMcpServers(config);
        for (const mcpId of mcpIds) {
            results.push({ configPath, exists: Object.prototype.hasOwnProperty.call(servers, mcpId), ideId, ideName: adapter.name, mcpId });
        }
    }
    return results;
};

export * from './types.js';
export * from './adapters.js';
export * from './registry.js';
export * from './sync.js';
