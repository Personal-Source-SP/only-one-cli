import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { antigravityMcpAdapter, cursorMcpAdapter } from '@src/core/mcp/adapters.js';
import { mergeMcpServers } from '@src/core/mcp/merge.js';

describe('MCP IDE adapters', () => {
    it('resolves Cursor global config path', () => {
        expect(cursorMcpAdapter.getConfigPath('/Users/test', 'darwin')).toBe('/Users/test/.cursor/mcp.json');
    });

    it('resolves Antigravity global config paths', () => {
        expect(antigravityMcpAdapter.getConfigPath('/Users/test', 'darwin')).toBe(
            join('/Users/test', 'Library', 'Application Support', 'Antigravity IDE', 'User', 'mcp.json'),
        );
        expect(antigravityMcpAdapter.getConfigPath('C:/Users/test', 'win32')).toBe(
            join('C:/Users/test', 'AppData', 'Roaming', 'Antigravity IDE', 'User', 'mcp.json'),
        );
    });
});

describe('mergeMcpServers', () => {
    it('adds missing MCP and preserves unrelated fields', () => {
        const result = mergeMcpServers({ existing: { command: 'node' } }, [{ id: 'github', server: { command: 'npx' } }]);

        expect(result.changed).toBe(true);
        expect(result.servers.existing).toEqual({ command: 'node' });
        expect(result.servers.github).toEqual({ command: 'npx' });
        expect(result.results).toEqual([{ credentialKeys: [], id: 'github', status: 'added' }]);
    });

    it('skips existing MCP without modifying definition', () => {
        const existing = { command: 'custom', env: { TOKEN: 'keep' } };
        const result = mergeMcpServers({ github: existing }, [{ id: 'github', server: { command: 'npx', env: { TOKEN: '' } } }]);

        expect(result.changed).toBe(false);
        expect(result.servers.github).toBe(existing);
        expect(result.results).toEqual([{ credentialKeys: ['TOKEN'], id: 'github', status: 'skipped' }]);
    });
});
