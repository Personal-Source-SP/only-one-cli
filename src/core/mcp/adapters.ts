import { join } from 'node:path';
import { jsonCodec, tomlCodec } from './codecs.js';
import type { McpIdeAdapter } from './types.js';

export enum McpIdeId {
    Antigravity = 'antigravity',
    Claude = 'claude',
    Cursor = 'cursor',
    Codex = 'codex',
}

const getObject = (config: Record<string, unknown>, key: string): Record<string, unknown> => {
    const value = config[key];
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
};

const getRootMcpServers = (config: Record<string, unknown>): Record<string, unknown> => getObject(config, 'mcpServers');
const getTomlMcpServers = (config: Record<string, unknown>): Record<string, unknown> => getObject(config, 'mcp_servers');
const setRootMcpServers = (config: Record<string, unknown>, servers: Record<string, unknown>): Record<string, unknown> => ({
    ...config,
    mcpServers: servers,
});
const setTomlMcpServers = (config: Record<string, unknown>, servers: Record<string, unknown>): Record<string, unknown> => ({
    ...config,
    mcp_servers: servers,
});

export const antigravityMcpAdapter: McpIdeAdapter = {
    codec: jsonCodec,
    id: McpIdeId.Antigravity,
    name: 'Antigravity',
    getConfigPath(homeDir, platform) {
        if (platform === 'darwin') return join(homeDir, 'Library', 'Application Support', 'Antigravity IDE', 'User', 'mcp.json');
        if (platform === 'win32') return join(homeDir, 'AppData', 'Roaming', 'Antigravity IDE', 'User', 'mcp.json');
        throw new Error(`Antigravity MCP global config is unsupported on ${platform}`);
    },
    getMcpServers: getRootMcpServers,
    setMcpServers: setRootMcpServers,
};

export const claudeMcpAdapter: McpIdeAdapter = {
    codec: jsonCodec,
    id: McpIdeId.Claude,
    name: 'Claude',
    getConfigPath: (homeDir) => join(homeDir, '.claude.json'),
    getMcpServers: getRootMcpServers,
    setMcpServers: setRootMcpServers,
};

export const cursorMcpAdapter: McpIdeAdapter = {
    codec: jsonCodec,
    id: McpIdeId.Cursor,
    name: 'Cursor',
    getConfigPath(homeDir, platform) {
        if (platform !== 'darwin' && platform !== 'win32') throw new Error(`Cursor MCP global config is unsupported on ${platform}`);
        return join(homeDir, '.cursor', 'mcp.json');
    },
    getMcpServers: getRootMcpServers,
    setMcpServers: setRootMcpServers,
};

export const codexMcpAdapter: McpIdeAdapter = {
    codec: tomlCodec,
    id: McpIdeId.Codex,
    name: 'Codex',
    getConfigPath: (homeDir) => join(homeDir, '.codex', 'config.toml'),
    getMcpServers: getTomlMcpServers,
    setMcpServers: setTomlMcpServers,
};

export const mcpIdeAdapters: readonly McpIdeAdapter[] = [antigravityMcpAdapter, claudeMcpAdapter, cursorMcpAdapter, codexMcpAdapter];
export const findMcpIdeAdapter = (id: string): McpIdeAdapter | undefined => mcpIdeAdapters.find((adapter) => adapter.id === id);
