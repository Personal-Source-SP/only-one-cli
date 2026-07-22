import { describe, expect, it } from 'vitest';
import { claudeMcpAdapter, codexMcpAdapter } from '@src/core/mcp/adapters.js';

describe('MCP codecs and adapters', () => {
    it('resolves verified Claude and Codex paths', () => {
        expect(claudeMcpAdapter.getConfigPath('/Users/test', 'darwin')).toBe('/Users/test/.claude.json');
        expect(codexMcpAdapter.getConfigPath('/Users/test', 'darwin')).toBe('/Users/test/.codex/config.toml');
    });

    it('preserves unrelated JSON and TOML configuration through MCP container updates', () => {
        const claude = claudeMcpAdapter.codec.parse(
            '{"theme":"dark","mcpServers":{"existing":{"command":"node"}}}',
            '/Users/test/.claude.json',
        );
        const codex = codexMcpAdapter.codec.parse(
            'model = "gpt-5"\n[mcp_servers.existing]\ncommand = "node"\n',
            '/Users/test/.codex/config.toml',
        );

        const nextClaude = claudeMcpAdapter.setMcpServers(claude, { ...claudeMcpAdapter.getMcpServers(claude), fetch: { command: 'npx' } });
        const nextCodex = codexMcpAdapter.setMcpServers(codex, { ...codexMcpAdapter.getMcpServers(codex), fetch: { command: 'npx' } });

        expect(JSON.parse(claudeMcpAdapter.codec.stringify(nextClaude))).toMatchObject({
            theme: 'dark',
            mcpServers: { fetch: { command: 'npx' } },
        });
        expect(codexMcpAdapter.codec.parse(codexMcpAdapter.codec.stringify(nextCodex), '/Users/test/.codex/config.toml')).toMatchObject({
            model: 'gpt-5',
            mcp_servers: { fetch: { command: 'npx' } },
        });
    });

    it('reports malformed JSON and TOML paths', () => {
        expect(() => claudeMcpAdapter.codec.parse('{', '/Users/test/.claude.json')).toThrow(
            "Malformed JSON MCP configuration at '/Users/test/.claude.json'",
        );
        expect(() => codexMcpAdapter.codec.parse('[', '/Users/test/.codex/config.toml')).toThrow(
            "Malformed TOML MCP configuration at '/Users/test/.codex/config.toml'",
        );
    });

    it('serializes GitNexus arguments and policy environment across JSON and TOML codecs', () => {
        const gitnexusServer = {
            command: 'npx',
            args: ['-y', 'gitnexus@latest', 'mcp'],
            env: { GITNEXUS_MCP_READ_ONLY: '1' },
        };

        const jsonDoc = claudeMcpAdapter.setMcpServers({}, { gitnexus: gitnexusServer });
        const serializedJson = claudeMcpAdapter.codec.stringify(jsonDoc);
        const parsedJson = claudeMcpAdapter.getMcpServers(claudeMcpAdapter.codec.parse(serializedJson, '/Users/test/.claude.json'));

        expect(parsedJson.gitnexus).toEqual(gitnexusServer);

        const tomlDoc = codexMcpAdapter.setMcpServers({}, { gitnexus: gitnexusServer });
        const serializedToml = codexMcpAdapter.codec.stringify(tomlDoc);
        const parsedToml = codexMcpAdapter.getMcpServers(codexMcpAdapter.codec.parse(serializedToml, '/Users/test/.codex/config.toml'));

        expect(parsedToml.gitnexus).toEqual(gitnexusServer);
    });
});
