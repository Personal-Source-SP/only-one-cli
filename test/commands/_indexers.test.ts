import { describe, expect, it, vi } from 'vitest';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { HYBRID_INDEX_CONFIG_FILE, HYBRID_INDEX_DIR } from '@src/core/prebuilt/index-output.js';
import { createManifest } from '@src/core/prebuilt/indexers.js';

vi.mock('@src/core/prebuilt/manifest.js', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@src/core/prebuilt/manifest.js')>();
    return {
        ...actual,
        buildManifestData: vi.fn().mockResolvedValue({
            artifactChecksum: 'abc123',
            cocoindexVersion: '0.12.0',
            commitSha: 'deadbeef',
            createdAt: '2026-05-28T00:00:00.000Z',
            fileCount: 2,
            gitnexusVersion: '1.6.4',
            projectName: 'demo',
            schemaVersion: '1.0',
        }),
        detectGitnexusVersion: vi.fn(),
        detectCocoindexVersion: vi.fn(),
    };
});

describe('prebuilt indexers createManifest', () => {
    it('writes manifest.json under the output directory', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'only-oneers-manifest-'));

        try {
            await mkdir(join(cwd, HYBRID_INDEX_DIR), { recursive: true });
            await writeFile(
                join(cwd, HYBRID_INDEX_DIR, HYBRID_INDEX_CONFIG_FILE),
                ['server: http://api', 'project: demo', 'index_mode: local'].join('\n'),
                'utf-8',
            );
            await mkdir(join(cwd, HYBRID_INDEX_DIR, '.cocoindex'), { recursive: true });

            await createManifest(cwd, join(cwd, HYBRID_INDEX_DIR), 'demo');

            const raw = await readFile(join(cwd, HYBRID_INDEX_DIR, 'manifest.json'), 'utf-8');
            const manifest = JSON.parse(raw) as Record<string, unknown>;
            expect(manifest.schemaVersion).toBe('1.0');
            expect(manifest.gitnexusVersion).toBe('1.6.4');
            expect(manifest.cocoindexVersion).toBe('0.12.0');
            expect(manifest.artifactChecksum).toBe('abc123');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});
