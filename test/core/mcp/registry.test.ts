import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtemp } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { readMcpManifests, validateMcpServerConfig } from '@src/core/mcp/registry.js';

describe('MCP manifest registry', () => {
    it('reads valid manifests deterministically', async () => {
        const directory = await mkdtemp(join(tmpdir(), 'mcp-registry-'));
        await mkdir(directory, { recursive: true });
        await writeFile(join(directory, 'github.json'), JSON.stringify({ command: 'npx', env: { TOKEN: '' } }));
        await writeFile(join(directory, 'clockify.json'), JSON.stringify({ command: 'npx', args: ['-y', 'clockify'] }));

        const result = await readMcpManifests(directory);

        expect(result.warnings).toEqual([]);
        expect(result.manifests.map((manifest) => manifest.id)).toEqual(['clockify', 'github']);
    });

    it('warns for malformed and invalid manifests', async () => {
        const directory = await mkdtemp(join(tmpdir(), 'mcp-registry-'));
        await writeFile(join(directory, 'bad-json.json'), '{');
        await writeFile(join(directory, 'bad-shape.json'), JSON.stringify({ args: [] }));

        const result = await readMcpManifests(directory);

        expect(result.manifests).toEqual([]);
        expect(result.warnings).toHaveLength(2);
    });

    it('rejects non-empty secret placeholders', () => {
        expect(() => validateMcpServerConfig('github', { command: 'npx', env: { TOKEN: 'secret' } })).toThrow(/placeholders must be empty/);
    });

    it('includes GitNexus in packaged registry with correct launch args, read-only policy, and no credential placeholders', async () => {
        const { manifests, warnings } = await readMcpManifests();
        expect(warnings).toEqual([]);

        const gitnexus = manifests.find((manifest) => manifest.id === 'gitnexus');
        expect(gitnexus).toBeDefined();
        expect(gitnexus?.server).toEqual({
            command: 'npx',
            args: ['-y', 'gitnexus@latest', 'mcp'],
            env: {
                GITNEXUS_MCP_READ_ONLY: '1',
            },
        });
    });
});
