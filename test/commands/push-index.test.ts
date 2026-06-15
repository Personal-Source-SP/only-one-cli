import { describe, expect, it, vi } from 'vitest';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { HYBRID_INDEX_CONFIG_FILE, HYBRID_INDEX_DIR } from '@src/core/prebuilt/index-output.js';
import { createProgram } from '@src/index.js';

vi.mock('@src/core/doctor/checks.js', () => ({
    assertIndexingReadiness: vi.fn().mockResolvedValue({
        status: 'READY',
        mode: 'local',
        modeSource: 'config',
        checks: [],
        remediation: [],
    }),
}));

describe('push-index command', () => {
    it('uploads prebuilt bundle even when --project id is not validated beforehand', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-push-index-'));
        const fetcher = vi.fn(async (url: string, init?: RequestInit) => {
            if (url.endsWith('/projects/prebuilt') && init?.method === 'POST') {
                return { ok: true, json: async () => ({ id: 'proj-new-1', name: 'demo', status: 'ready' }) };
            }
            return { ok: true, json: async () => ({}) };
        });

        try {
            await mkdir(join(cwd, HYBRID_INDEX_DIR), { recursive: true });
            await writeFile(
                join(cwd, HYBRID_INDEX_DIR, HYBRID_INDEX_CONFIG_FILE),
                ['server: http://api', 'index_mode: local'].join('\n'),
                'utf-8',
            );
            await mkdir(join(cwd, HYBRID_INDEX_DIR, '.gitnexus'), { recursive: true });
            await writeFile(join(cwd, HYBRID_INDEX_DIR, '.gitnexus', 'graph.json'), '{}', 'utf-8');
            await mkdir(join(cwd, HYBRID_INDEX_DIR, '.cocoindex'), { recursive: true });
            await writeFile(join(cwd, HYBRID_INDEX_DIR, '.cocoindex', 'index.bin'), 'x', 'utf-8');
            await writeFile(join(cwd, HYBRID_INDEX_DIR, 'manifest.json'), '{}', 'utf-8');

            const program = createProgram({ cwd, env: {}, fetcher, stdout: () => {} });

            await program.parseAsync(
                ['--server', 'http://api', '--project', 'orien-trade-be', 'push-index', '--skip-gitnexus', '--skip-cocoindex'],
                { from: 'user' },
            );

            expect(fetcher).toHaveBeenCalledWith('http://api/api/v1/projects/prebuilt', expect.objectContaining({ method: 'POST' }));
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('uploads and persists project_id when config slug is stale', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-push-index-stale-'));
        const writes: string[] = [];
        const fetcher = vi.fn(async (url: string, init?: RequestInit) => {
            if (url.endsWith('/projects/prebuilt') && init?.method === 'POST') {
                return { ok: true, json: async () => ({ id: 'proj-new-2', name: 'demo', status: 'ready' }) };
            }
            return { ok: true, json: async () => ({}) };
        });

        try {
            await mkdir(join(cwd, HYBRID_INDEX_DIR), { recursive: true });
            await writeFile(
                join(cwd, HYBRID_INDEX_DIR, HYBRID_INDEX_CONFIG_FILE),
                ['server: http://api', 'project: orien-trade-be', 'index_mode: local'].join('\n'),
                'utf-8',
            );
            await mkdir(join(cwd, HYBRID_INDEX_DIR, '.gitnexus'), { recursive: true });
            await writeFile(join(cwd, HYBRID_INDEX_DIR, '.gitnexus', 'graph.json'), '{}', 'utf-8');
            await mkdir(join(cwd, HYBRID_INDEX_DIR, '.cocoindex'), { recursive: true });
            await writeFile(join(cwd, HYBRID_INDEX_DIR, '.cocoindex', 'index.bin'), 'x', 'utf-8');
            await writeFile(join(cwd, HYBRID_INDEX_DIR, 'manifest.json'), '{}', 'utf-8');

            const program = createProgram({
                cwd,
                env: {},
                fetcher,
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['--server', 'http://api', 'push-index', '--skip-gitnexus', '--skip-cocoindex'], { from: 'user' });

            expect(writes.some((line) => line.includes('Upload complete'))).toBe(true);
            expect(fetcher).toHaveBeenCalledWith('http://api/api/v1/projects/prebuilt', expect.objectContaining({ method: 'POST' }));
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('uploads and persists project_id when config has no project id', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-push-index-empty-'));
        const writes: string[] = [];
        const fetcher = vi.fn(async (url: string, init?: RequestInit) => {
            if (url.includes('/projects?status=all')) {
                return { ok: true, json: async () => [] };
            }
            if (url.endsWith('/projects/prebuilt') && init?.method === 'POST') {
                return { ok: true, json: async () => ({ id: 'proj-new-1', name: 'demo', status: 'ready' }) };
            }
            return { ok: true, json: async () => ({}) };
        });

        try {
            await mkdir(join(cwd, HYBRID_INDEX_DIR), { recursive: true });
            await writeFile(
                join(cwd, HYBRID_INDEX_DIR, HYBRID_INDEX_CONFIG_FILE),
                ['server: http://api', 'project: orien-trade-be', 'index_mode: local'].join('\n'),
                'utf-8',
            );
            await mkdir(join(cwd, HYBRID_INDEX_DIR, '.gitnexus'), { recursive: true });
            await writeFile(join(cwd, HYBRID_INDEX_DIR, '.gitnexus', 'graph.json'), '{}', 'utf-8');
            await mkdir(join(cwd, HYBRID_INDEX_DIR, '.cocoindex'), { recursive: true });
            await writeFile(join(cwd, HYBRID_INDEX_DIR, '.cocoindex', 'index.bin'), 'x', 'utf-8');
            await writeFile(join(cwd, HYBRID_INDEX_DIR, 'manifest.json'), '{}', 'utf-8');

            const program = createProgram({
                cwd,
                env: {},
                fetcher,
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['--server', 'http://api', 'push-index', '--skip-gitnexus', '--skip-cocoindex'], {
                from: 'user',
            });

            expect(writes.some((line) => line.includes('Upload complete'))).toBe(true);
            expect(fetcher).toHaveBeenCalledWith('http://api/api/v1/projects/prebuilt', expect.objectContaining({ method: 'POST' }));
            const config = await readFile(join(cwd, HYBRID_INDEX_DIR, HYBRID_INDEX_CONFIG_FILE), 'utf-8');
            expect(config).toContain('project_id: proj-new-1');
            expect(writes.some((line) => line.includes('Saved project_id'))).toBe(true);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('persists indexVersionId into manifest.json after upload response', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-push-index-save-id-'));
        const writes: string[] = [];
        const fetcher = vi.fn(async (url: string, init?: RequestInit) => {
            if (url.endsWith('/projects/prebuilt') && init?.method === 'POST') {
                return {
                    ok: true,
                    json: async () => ({
                        id: 'proj-new-1',
                        indexVersionId: 'idx-upload-42',
                        name: 'demo',
                        status: 'ready',
                    }),
                };
            }
            return { ok: true, json: async () => ({}) };
        });

        try {
            await mkdir(join(cwd, HYBRID_INDEX_DIR), { recursive: true });
            await writeFile(
                join(cwd, HYBRID_INDEX_DIR, HYBRID_INDEX_CONFIG_FILE),
                ['server: http://api', 'index_mode: local'].join('\n'),
                'utf-8',
            );
            await mkdir(join(cwd, HYBRID_INDEX_DIR, '.gitnexus'), { recursive: true });
            await writeFile(join(cwd, HYBRID_INDEX_DIR, '.gitnexus', 'graph.json'), '{}', 'utf-8');
            await mkdir(join(cwd, HYBRID_INDEX_DIR, '.cocoindex'), { recursive: true });
            await writeFile(join(cwd, HYBRID_INDEX_DIR, '.cocoindex', 'index.bin'), 'x', 'utf-8');
            await writeFile(
                join(cwd, HYBRID_INDEX_DIR, 'manifest.json'),
                JSON.stringify({
                    schemaVersion: '1.0',
                    projectName: 'demo',
                    commitSha: 'abc123',
                    createdAt: '2026-05-28T00:00:00.000Z',
                    gitnexusVersion: '1.6.3',
                    cocoindexVersion: '0.12.0',
                    fileCount: 1,
                    artifactChecksum: 'checksum',
                }),
                'utf-8',
            );

            const program = createProgram({
                cwd,
                env: {},
                fetcher,
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['--server', 'http://api', 'push-index', '--skip-gitnexus', '--skip-cocoindex'], { from: 'user' });

            const manifest = JSON.parse(await readFile(join(cwd, HYBRID_INDEX_DIR, 'manifest.json'), 'utf-8')) as {
                indexVersionId?: string;
            };
            expect(manifest.indexVersionId).toBe('idx-upload-42');
            expect(writes.some((line) => line.includes('Saved indexVersionId'))).toBe(true);
            const config = await readFile(join(cwd, HYBRID_INDEX_DIR, HYBRID_INDEX_CONFIG_FILE), 'utf-8');
            expect(config).toContain('project_id: proj-new-1');
            expect(writes.some((line) => line.includes('Saved project_id'))).toBe(true);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('uploads from target repo config path, not shell cwd or HYBRID_PROJECT', async () => {
        const root = await mkdtemp(join(tmpdir(), 'hybrid-push-index-root-'));
        const repo = join(root, 'orien-trade-backend');
        const writes: string[] = [];
        const fetcher = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ id: 'backend-proj-99', name: 'orien-trade-backend', status: 'ready' }),
        });

        try {
            await mkdir(join(repo, HYBRID_INDEX_DIR, '.gitnexus'), { recursive: true });
            await writeFile(join(repo, HYBRID_INDEX_DIR, '.gitnexus', 'graph.json'), '{}', 'utf-8');
            await mkdir(join(repo, HYBRID_INDEX_DIR, '.cocoindex'), { recursive: true });
            await writeFile(join(repo, HYBRID_INDEX_DIR, '.cocoindex', 'index.bin'), 'x', 'utf-8');
            await writeFile(join(repo, HYBRID_INDEX_DIR, 'manifest.json'), '{}', 'utf-8');
            await writeFile(
                join(repo, HYBRID_INDEX_DIR, HYBRID_INDEX_CONFIG_FILE),
                ['server: http://api', 'project: backend-proj-99', 'index_mode: local'].join('\n'),
                'utf-8',
            );

            const program = createProgram({
                cwd: root,
                env: { HYBRID_PROJECT: 'wrong-env-id' },
                fetcher,
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(
                ['--server', 'http://api', 'push-index', 'orien-trade-backend', '--skip-gitnexus', '--skip-cocoindex'],
                { from: 'user' },
            );

            expect(fetcher).toHaveBeenCalledWith('http://api/api/v1/projects/prebuilt', expect.objectContaining({ method: 'POST' }));
            expect(writes.some((line) => line.includes('.only-one/.hybridindex.yml'))).toBe(true);
        } finally {
            await rm(root, { recursive: true, force: true });
        }
    });
});
