import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { antigravityMcpAdapter, claudeMcpAdapter, codexMcpAdapter, cursorMcpAdapter, McpIdeId } from '@/core/mcp/adapters.js';

describe('MCP IDE Adapters', () => {
    const fakeHome = '/home/user';

    it('antigravityMcpAdapter returns ~/.gemini/config/mcp_config.json', () => {
        expect(antigravityMcpAdapter.id).toBe(McpIdeId.Antigravity);
        expect(antigravityMcpAdapter.getConfigPath(fakeHome, 'darwin')).toBe(join(fakeHome, '.gemini', 'config', 'mcp_config.json'));
        expect(antigravityMcpAdapter.getConfigPath(fakeHome, 'win32')).toBe(join(fakeHome, '.gemini', 'config', 'mcp_config.json'));
        expect(antigravityMcpAdapter.getConfigPath(fakeHome, 'linux')).toBe(join(fakeHome, '.gemini', 'config', 'mcp_config.json'));
    });

    it('cursorMcpAdapter returns ~/.cursor/mcp.json', () => {
        expect(cursorMcpAdapter.id).toBe(McpIdeId.Cursor);
        expect(cursorMcpAdapter.getConfigPath(fakeHome, 'darwin')).toBe(join(fakeHome, '.cursor', 'mcp.json'));
    });

    it('claudeMcpAdapter returns ~/.claude.json', () => {
        expect(claudeMcpAdapter.id).toBe(McpIdeId.Claude);
        expect(claudeMcpAdapter.getConfigPath(fakeHome, 'darwin')).toBe(join(fakeHome, '.claude.json'));
    });

    it('codexMcpAdapter returns ~/.codex/config.toml', () => {
        expect(codexMcpAdapter.id).toBe(McpIdeId.Codex);
        expect(codexMcpAdapter.getConfigPath(fakeHome, 'darwin')).toBe(join(fakeHome, '.codex', 'config.toml'));
    });
});
