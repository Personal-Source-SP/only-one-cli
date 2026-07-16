import { join } from 'node:path';
import type { McpIdeAdapter } from './types.js';

export enum McpIdeId {
    Antigravity = 'antigravity',
    Cursor = 'cursor',
}

const getRootMcpServers = (config: Record<string, unknown>): Record<string, unknown> => {
    const value = config.mcpServers;
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
};

const setRootMcpServers = (config: Record<string, unknown>, servers: Record<string, unknown>): Record<string, unknown> => ({
    ...config,
    mcpServers: servers,
});

export const cursorMcpAdapter: McpIdeAdapter = {
    id: McpIdeId.Cursor,
    name: 'Cursor',
    getConfigPath(homeDir: string, platform: NodeJS.Platform): string {
        if (platform !== 'darwin' && platform !== 'win32') {
            throw new Error(`Cursor MCP global config is unsupported on ${platform}`);
        }
        return join(homeDir, '.cursor', 'mcp.json');
    },
    getMcpServers: getRootMcpServers,
    setMcpServers: setRootMcpServers,
};

export const antigravityMcpAdapter: McpIdeAdapter = {
    id: McpIdeId.Antigravity,
    name: 'Antigravity',
    getConfigPath(homeDir: string, platform: NodeJS.Platform): string {
        if (platform === 'darwin') {
            return join(homeDir, 'Library', 'Application Support', 'Antigravity IDE', 'User', 'mcp.json');
        }
        if (platform === 'win32') {
            return join(homeDir, 'AppData', 'Roaming', 'Antigravity IDE', 'User', 'mcp.json');
        }
        throw new Error(`Antigravity MCP global config is unsupported on ${platform}`);
    },
    getMcpServers: getRootMcpServers,
    setMcpServers: setRootMcpServers,
};

export const mcpIdeAdapters: McpIdeAdapter[] = [cursorMcpAdapter, antigravityMcpAdapter];

export const findMcpIdeAdapter = (id: string): McpIdeAdapter | undefined => mcpIdeAdapters.find((adapter) => adapter.id === id);
