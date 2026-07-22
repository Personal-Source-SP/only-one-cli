import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { antigravityMcpAdapter, codexMcpAdapter, cursorMcpAdapter } from '@src/core/mcp/adapters.js';
import { mergeMcpServers } from '@src/core/mcp/merge.js';
import { resolveMcpJournalPath, syncMcpGlobalConfig } from '@src/core/mcp/sync.js';

describe('MCP IDE adapters', () => {
    it('resolves Cursor global config path', () => {
        expect(cursorMcpAdapter.getConfigPath('/Users/test', 'darwin').replace(/\\/g, '/')).toBe('/Users/test/.cursor/mcp.json');
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

class MemoryFs implements VsFileSystem {
    public readonly files = new Map<string, string>();
    public readonly dirs = new Set<string>();

    public async copyFile(source: string, target: string): Promise<void> {
        const content = this.files.get(source);
        if (content === undefined) throw new Error('ENOENT');
        this.files.set(target, content);
    }

    public async mkdir(path: string): Promise<void> {
        this.dirs.add(path);
    }

    public async readFile(path: string): Promise<string> {
        const content = this.files.get(path);
        if (content === undefined) throw new Error('ENOENT');
        return content;
    }

    public async rename(source: string, target: string): Promise<void> {
        const content = this.files.get(source);
        if (content === undefined) throw new Error('ENOENT');
        this.files.set(target, content);
        this.files.delete(source);
    }

    public async rm(path: string): Promise<void> {
        this.files.delete(path);
    }

    public async stat(path: string): Promise<{ isFile: () => boolean }> {
        if (!this.files.has(path)) throw new Error('ENOENT');
        return { isFile: () => true };
    }

    public async writeFile(path: string, content: string): Promise<void> {
        this.files.set(path, content);
    }
}

class MemoryRunner implements VsProcessRunner {
    public async run(): Promise<{ code: number; stderr: string; stdout: string }> {
        return { code: 0, stderr: '', stdout: '' };
    }
}

describe('syncMcpGlobalConfig', () => {
    it('syncs global config on Windows and macOS platforms', async () => {
        const fs = new MemoryFs();
        const runner = new MemoryRunner();
        const writes: string[] = [];

        // Sync Cursor on win32
        const resultWin = await syncMcpGlobalConfig({
            cwd: '/repo',
            homeDir: 'C:/Users/test',
            ideIds: ['cursor'],
            manifests: [{ id: 'tavily', server: { command: 'npx', args: ['tavily'] } }],
            platform: 'win32',
            write: (l) => writes.push(l),
            fs,
            runner,
        });

        expect(resultWin.changed).toBe(1);
        const winPath = join('C:/Users/test', '.cursor', 'mcp.json');
        const winContent = JSON.parse(fs.files.get(winPath) ?? '{}');
        expect(winContent.mcpServers.tavily.command).toBe('npx');

        // Sync Antigravity on darwin
        const resultMac = await syncMcpGlobalConfig({
            cwd: '/repo',
            homeDir: '/Users/test',
            ideIds: ['antigravity'],
            manifests: [{ id: 'github', server: { command: 'node', args: ['github'] } }],
            platform: 'darwin',
            write: (l) => writes.push(l),
            fs,
            runner,
        });

        expect(resultMac.changed).toBe(1);
        const macPath = join('/Users/test', 'Library', 'Application Support', 'Antigravity IDE', 'User', 'mcp.json');
        const macContent = JSON.parse(fs.files.get(macPath) ?? '{}');
        expect(macContent.mcpServers.github.command).toBe('node');
    });

    it('preserves existing configs and adds new ones', async () => {
        const fs = new MemoryFs();
        const runner = new MemoryRunner();
        const cursorPath = join('/Users/test', '.cursor', 'mcp.json');

        // Seed existing config with a preset server
        fs.files.set(
            cursorPath,
            JSON.stringify({
                mcpServers: {
                    existing: { command: 'custom-cmd' },
                },
            }),
        );

        await syncMcpGlobalConfig({
            cwd: '/repo',
            homeDir: '/Users/test',
            ideIds: ['cursor'],
            manifests: [
                { id: 'existing', server: { command: 'npx' } }, // Should skip
                { id: 'tavily', server: { command: 'node' } }, // Should add
            ],
            platform: 'darwin',
            write: () => {},
            fs,
            runner,
        });

        const content = JSON.parse(fs.files.get(cursorPath) ?? '{}');
        expect(content.mcpServers.existing.command).toBe('custom-cmd'); // Preserved
        expect(content.mcpServers.tavily.command).toBe('node'); // Added
    });

    it('syncs GitNexus across Antigravity, Claude, Cursor, and Codex with read-only policy', async () => {
        const fs = new MemoryFs();
        const runner = new MemoryRunner();

        const gitnexusManifest = {
            id: 'gitnexus',
            server: {
                command: 'npx',
                args: ['-y', 'gitnexus@latest', 'mcp'],
                env: { GITNEXUS_MCP_READ_ONLY: '1' },
            },
        };

        const syncResult = await syncMcpGlobalConfig({
            cwd: '/repo',
            homeDir: '/Users/test',
            ideIds: ['antigravity', 'claude', 'cursor', 'codex'],
            manifests: [gitnexusManifest],
            platform: 'darwin',
            write: () => {},
            fs,
            runner,
        });

        expect(syncResult.changed).toBe(4);

        const antigravityPath = join('/Users/test', 'Library', 'Application Support', 'Antigravity IDE', 'User', 'mcp.json');
        const claudePath = join('/Users/test', '.claude.json');
        const cursorPath = join('/Users/test', '.cursor', 'mcp.json');
        const codexPath = join('/Users/test', '.codex', 'config.toml');

        const antigravityConfig = JSON.parse(fs.files.get(antigravityPath) ?? '{}');
        const claudeConfig = JSON.parse(fs.files.get(claudePath) ?? '{}');
        const cursorConfig = JSON.parse(fs.files.get(cursorPath) ?? '{}');
        const codexConfig = codexMcpAdapter.codec.parse(fs.files.get(codexPath) ?? '', codexPath);

        expect(antigravityConfig.mcpServers.gitnexus).toEqual(gitnexusManifest.server);
        expect(claudeConfig.mcpServers.gitnexus).toEqual(gitnexusManifest.server);
        expect(cursorConfig.mcpServers.gitnexus).toEqual(gitnexusManifest.server);
        expect(codexMcpAdapter.getMcpServers(codexConfig).gitnexus).toEqual(gitnexusManifest.server);
    });

    it('preserves existing custom GitNexus configuration when reconfiguration is declined', async () => {
        const fs = new MemoryFs();
        const runner = new MemoryRunner();
        const cursorPath = join('/Users/test', '.cursor', 'mcp.json');

        const customGitnexus = {
            command: 'custom-gitnexus-binary',
            args: ['--custom-flag'],
            env: { GITNEXUS_MCP_READ_ONLY: '0' },
        };

        fs.files.set(cursorPath, JSON.stringify({ mcpServers: { gitnexus: customGitnexus } }));

        await syncMcpGlobalConfig({
            cwd: '/repo',
            homeDir: '/Users/test',
            ideIds: ['cursor'],
            manifests: [
                {
                    id: 'gitnexus',
                    server: {
                        command: 'npx',
                        args: ['-y', 'gitnexus@latest', 'mcp'],
                        env: { GITNEXUS_MCP_READ_ONLY: '1' },
                    },
                },
            ],
            platform: 'darwin',
            write: () => {},
            fs,
            runner,
            overwriteList: [], // Declined overwrite
        });

        const cursorConfig = JSON.parse(fs.files.get(cursorPath) ?? '{}');
        expect(cursorConfig.mcpServers.gitnexus).toEqual(customGitnexus);
    });

    it('rolls back Cursor configuration if Antigravity sync fails', async () => {
        const fs = new MemoryFs();
        const runner = new MemoryRunner();
        const cursorPath = join('/Users/test', '.cursor', 'mcp.json');
        const antigravityPath = join('/Users/test', 'Library', 'Application Support', 'Antigravity IDE', 'User', 'mcp.json');

        // Seed Cursor
        fs.files.set(cursorPath, JSON.stringify({ mcpServers: {} }));

        // Mock rename to fail specifically on Antigravity path
        const originalRename = fs.rename.bind(fs);
        fs.rename = async (source, target) => {
            if (target.includes('Antigravity')) {
                throw new Error('Atomic write failure');
            }
            return originalRename(source, target);
        };

        await expect(
            syncMcpGlobalConfig({
                cwd: '/repo',
                homeDir: '/Users/test',
                ideIds: ['cursor', 'antigravity'],
                manifests: [{ id: 'fetch', server: { command: 'npx' } }],
                platform: 'darwin',
                write: () => {},
                fs,
                runner,
            }),
        ).rejects.toThrow('Atomic write failure');

        // Verify Cursor config was rolled back and did not keep the change
        const cursorContent = JSON.parse(fs.files.get(cursorPath) ?? '{}');
        expect(cursorContent.mcpServers.fetch).toBeUndefined();
        // Verify journal was cleaned up
        expect(fs.files.has(resolveMcpJournalPath('/repo'))).toBe(false);
    });
});

it('rolls back JSON when a later TOML target write fails', async () => {
    const fs = new MemoryFs();
    const runner = new MemoryRunner();
    const claudePath = join('/Users/test', '.claude.json');
    const codexPath = join('/Users/test', '.codex', 'config.toml');
    fs.files.set(claudePath, JSON.stringify({ retained: true, mcpServers: {} }));
    fs.files.set(codexPath, 'model = "gpt-5"\n[mcp_servers]\n');

    const originalRename = fs.rename.bind(fs);
    fs.rename = async (source, target) => {
        if (target === codexPath) throw new Error('Codex atomic write failure');
        return originalRename(source, target);
    };

    await expect(
        syncMcpGlobalConfig({
            cwd: '/repo',
            homeDir: '/Users/test',
            ideIds: ['claude', 'codex'],
            manifests: [{ id: 'fetch', server: { command: 'npx' } }],
            platform: 'darwin',
            write: () => {},
            fs,
            runner,
        }),
    ).rejects.toThrow('Codex atomic write failure');

    expect(JSON.parse(fs.files.get(claudePath) ?? '{}')).toEqual({ retained: true, mcpServers: {} });
    expect(fs.files.get(codexPath)).toBe('model = "gpt-5"\n[mcp_servers]\n');
    expect(fs.files.has(resolveMcpJournalPath('/repo'))).toBe(false);
});
