import { describe, expect, it, vi } from 'vitest';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildManifestData, computeArtifactChecksum, persistIndexVersionId, readManifestFile } from '@src/core/prebuilt/manifest.js';

vi.mock('node:child_process', () => ({
    execFile: vi.fn((_cmd, args, _opts, cb) => {
        const callback = typeof _opts === 'function' ? _opts : cb;
        if (args?.[0] === 'rev-parse') {
            callback?.(null, { stdout: 'abc123def456\n' });
            return;
        }
        if (args?.includes('gitnexus') || args?.includes('--version')) {
            callback?.(null, { stdout: '1.6.4\n' });
            return;
        }
        callback?.(null, { stdout: 'Python 3.12.0\n' });
    }),
}));

describe('manifest', () => {
    it('computes a stable artifactChecksum from artifact trees', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-manifest-'));

        try {
            await mkdir(join(cwd, '.only-one', '.gitnexus'), { recursive: true });
            await mkdir(join(cwd, '.only-one', '.cocoindex'), { recursive: true });
            await writeFile(join(cwd, '.only-one', '.gitnexus', 'graph.json'), '{"a":1}', 'utf-8');
            await writeFile(join(cwd, '.only-one', '.cocoindex', 'documents.json'), '[]', 'utf-8');

            const first = await computeArtifactChecksum(join(cwd, '.only-one'));
            const second = await computeArtifactChecksum(join(cwd, '.only-one'));
            expect(first).toBe(second);
            expect(first).toMatch(/^[a-f0-9]{64}$/);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('buildManifestData includes required schema fields', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-manifest-fields-'));

        try {
            await mkdir(join(cwd, '.only-one', '.cocoindex'), { recursive: true });
            await writeFile(join(cwd, '.only-one', '.cocoindex', 'documents.json'), '[]', 'utf-8');

            const manifest = await buildManifestData(cwd, join(cwd, '.only-one'), 'demo', 'local');

            expect(manifest.schemaVersion).toBe('1.0');
            expect(manifest.projectName).toBe('demo');
            expect(manifest.commitSha).toBeTruthy();
            expect(manifest.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
            expect(manifest.gitnexusVersion).toBeTruthy();
            expect(manifest.cocoindexVersion).toBeTruthy();
            expect(manifest.fileCount).toBe(1);
            expect(manifest.artifactChecksum).toMatch(/^[a-f0-9]{64}$/);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('persists indexVersionId without dropping existing manifest fields', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-manifest-persist-id-'));
        const manifestPath = join(cwd, '.only-one', 'manifest.json');

        try {
            await mkdir(join(cwd, '.only-one'), { recursive: true });
            await writeFile(
                manifestPath,
                JSON.stringify({
                    schemaVersion: '1.0',
                    projectName: 'demo',
                    commitSha: 'abc123',
                    createdAt: '2026-05-28T00:00:00.000Z',
                    gitnexusVersion: '1.6.4',
                    cocoindexVersion: '0.12.0',
                    fileCount: 1,
                    artifactChecksum: 'checksum-abc',
                }),
                'utf-8',
            );

            await persistIndexVersionId(manifestPath, 'idx-v99');
            const manifest = await readManifestFile(manifestPath);

            expect(manifest.indexVersionId).toBe('idx-v99');
            expect(manifest.artifactChecksum).toBe('checksum-abc');
            expect(manifest.projectName).toBe('demo');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});
