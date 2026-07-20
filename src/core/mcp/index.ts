import { existsSync, readFileSync } from 'node:fs';
import { mcpIdeAdapters, findMcpIdeAdapter } from './adapters.js';
import { parseJsoncObject } from '@/core/vs/json.js';

export interface ExistingMcp {
    ideId: string;
    ideName: string;
    mcpId: string;
    configPath: string;
    exists: boolean;
}

export const checkExistingMcps = async (
    homeDir: string,
    platform: NodeJS.Platform,
    ideIds: string[],
    mcpIds: string[],
): Promise<ExistingMcp[]> => {
    const results: ExistingMcp[] = [];
    const adapters = ideIds.map((id) => findMcpIdeAdapter(id)).filter(Boolean) as typeof mcpIdeAdapters;

    for (const adapter of adapters) {
        const configPath = adapter.getConfigPath(homeDir, platform);
        let config: Record<string, any> = {};
        if (existsSync(configPath)) {
            try {
                config = parseJsoncObject(readFileSync(configPath, 'utf8')) as Record<string, any>;
            } catch {
                config = {};
            }
        }
        const mcpServers = adapter.getMcpServers(config);
        for (const mcpId of mcpIds) {
            const exists = Object.prototype.hasOwnProperty.call(mcpServers, mcpId);
            results.push({
                ideId: adapter.id,
                ideName: adapter.name,
                mcpId,
                configPath,
                exists,
            });
        }
    }
    return results;
};

export { syncMcpGlobalConfig } from './sync.js';
export { readMcpManifests } from './registry.js';
export { mcpIdeAdapters } from './adapters.js';
export type { SyncMcpGlobalConfigRequest, SyncMcpGlobalConfigResponse, SyncMcpGlobalConfigResult } from './sync.js';
export type { McpManifest } from './types.js';
