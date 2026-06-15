import { describe, expect, it, vi } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { HybridApiClient } from '@src/core/client/index.js';

describe('HybridApiClient', () => {
    it('lists projects with optional bearer key', async () => {
        const fetcher = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ data: [{ id: 'proj-1', name: 'demo' }] }),
        });

        const client = new HybridApiClient('http://api', 'secret', fetcher);
        const projects = await client.listProjects();

        expect(projects).toHaveLength(1);
        expect(fetcher).toHaveBeenCalledWith('http://api/api/v1/projects', {
            method: 'GET',
            headers: { Authorization: 'Bearer secret' },
        });
    });

    it('gets one project status by id', async () => {
        const fetcher = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ id: 'proj-1', name: 'demo', status: 'ready' }),
        });

        const project = await new HybridApiClient('http://api', 'secret', fetcher).getProject('proj-1');

        expect(project).toMatchObject({ id: 'proj-1', status: 'ready' });
        expect(fetcher).toHaveBeenCalledWith('http://api/api/v1/projects/proj-1', {
            method: 'GET',
            headers: { Authorization: 'Bearer secret' },
        });
    });

    it('lists jobs for a project', async () => {
        const fetcher = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => [{ id: 'job-1', projectId: 'proj-1', status: 'completed' }],
        });

        const jobs = await new HybridApiClient('http://api', 'secret', fetcher).listJobs({
            projectId: 'proj-1',
        });

        expect(jobs).toHaveLength(1);
        expect(fetcher).toHaveBeenCalledWith('http://api/api/v1/jobs?projectId=proj-1', {
            method: 'GET',
            headers: { Authorization: 'Bearer secret' },
        });
    });

    it('gets one job status by id', async () => {
        const fetcher = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                id: 'job-1',
                projectId: 'proj-1',
                status: 'queued',
            }),
        });

        const job = await new HybridApiClient('http://api', 'secret', fetcher).getJob('job-1');

        expect(job).toMatchObject({ id: 'job-1', status: 'queued' });
        expect(fetcher).toHaveBeenCalledWith('http://api/api/v1/jobs/job-1', {
            method: 'GET',
            headers: { Authorization: 'Bearer secret' },
        });
    });

    it('formats API error envelopes', async () => {
        const fetcher = vi.fn().mockResolvedValue({
            ok: false,
            text: async () =>
                JSON.stringify({
                    error: {
                        code: 'HYBRID_BAD_REQUEST',
                        message: 'projectId is required',
                    },
                }),
        });

        await expect(new HybridApiClient('http://api', undefined, fetcher).getJob('missing')).rejects.toThrow(
            'HYBRID_BAD_REQUEST: projectId is required',
        );
    });

    it('parses SSE job logs', async () => {
        const fetcher = vi.fn().mockResolvedValue({
            ok: true,
            text: async () => ['data: {"line":"first"}', '', 'data: {"line":"second"}', ''].join('\n'),
        });

        const lines = await new HybridApiClient('http://api', undefined, fetcher).getJobLogs('job-1');

        expect(lines).toEqual(['first', 'second']);
        expect(fetcher).toHaveBeenCalledWith('http://api/api/v1/jobs/job-1/logs', {
            method: 'GET',
            headers: {},
        });
    });

    it('triggers indexing jobs', async () => {
        const fetcher = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                id: 'job-1',
                projectId: 'proj-1',
                status: 'completed',
            }),
        });

        await new HybridApiClient('http://api', undefined, fetcher).triggerJob({
            projectId: 'proj-1',
            incremental: true,
        });

        expect(fetcher).toHaveBeenCalledWith('http://api/api/v1/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: 'proj-1', incremental: true }),
        });
    });

    it('posts remote git indexing requests', async () => {
        const fetcher = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ id: 'proj-1', name: 'demo', status: 'ready' }),
        });

        await new HybridApiClient('http://api', undefined, fetcher).remoteIndex({
            name: 'demo',
            repoUrl: 'https://github.com/acme/demo.git',
            branch: 'main',
            pat: 'secret',
            tags: ['group:demo'],
        });

        expect(fetcher).toHaveBeenCalledWith('http://api/api/v1/projects/git', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'demo',
                repoUrl: 'https://github.com/acme/demo.git',
                branch: 'main',
                pat: 'secret',
                tags: ['group:demo'],
            }),
        });
    });

    it('posts zip upload requests as multipart form data', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-cli-upload-'));
        const zipPath = join(cwd, 'demo.zip');
        await writeFile(zipPath, 'zip-bytes');
        const fetcher = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ id: 'proj-1', name: 'demo', status: 'ready' }),
        });

        try {
            await new HybridApiClient('http://api', 'secret', fetcher).uploadZip({
                name: 'demo',
                zipPath,
                tags: ['group:demo'],
            });

            expect(fetcher).toHaveBeenCalledWith(
                'http://api/api/v1/projects/upload',
                expect.objectContaining({
                    method: 'POST',
                    headers: { Authorization: 'Bearer secret' },
                }),
            );
            const body = fetcher.mock.calls[0][1].body as FormData;
            expect(body.get('name')).toBe('demo');
            expect(body.get('tags')).toBe('group:demo');
            expect((body.get('file') as File).name).toBe('demo.zip');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('posts search requests', async () => {
        const fetcher = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ results: [], total: 0 }),
        });

        await new HybridApiClient('http://api', undefined, fetcher).search('auth flow', {
            projectId: 'proj-1',
            topK: 4,
        });

        expect(fetcher).toHaveBeenCalledWith('http://api/api/v1/query/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: 'auth flow',
                projectId: 'proj-1',
                scope: 'per-project',
                topK: 4,
            }),
        });
    });

    it('posts cross-project search requests with tags', async () => {
        const fetcher = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ results: [], total: 0 }),
        });

        await new HybridApiClient('http://api', undefined, fetcher).search('auth flow', {
            scope: 'cross-project',
            tags: ['group:platform'],
            topK: 5,
        });

        const [, init] = fetcher.mock.calls[0];
        expect(JSON.parse(String(init.body))).toEqual({
            query: 'auth flow',
            scope: 'cross-project',
            tags: ['group:platform'],
            topK: 5,
        });
    });

    it('posts structural search augmentation requests', async () => {
        const fetcher = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                results: [],
                total: 0,
                structural: { processes: [] },
            }),
        });

        await new HybridApiClient('http://api', undefined, fetcher).search('auth flow', {
            projectId: 'hybrid-codebase-rag',
            topK: 4,
            includeStructural: true,
        });

        expect(fetcher).toHaveBeenCalledWith('http://api/api/v1/query/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: 'auth flow',
                projectId: 'hybrid-codebase-rag',
                scope: 'per-project',
                topK: 4,
                includeStructural: true,
            }),
        });
    });

    it('posts GitNexus impact requests', async () => {
        const fetcher = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ risk: 'LOW' }),
        });

        await new HybridApiClient('http://api', undefined, fetcher).impact('ProjectStoreService', {
            projectId: 'hybrid-codebase-rag',
            depth: 2,
        });

        expect(fetcher).toHaveBeenCalledWith('http://api/api/v1/query/impact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                symbol: 'ProjectStoreService',
                projectId: 'hybrid-codebase-rag',
                depth: 2,
            }),
        });
    });

    it('posts GitNexus call graph requests', async () => {
        const fetcher = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ nodes: [], edges: [] }),
        });

        await new HybridApiClient('http://api', undefined, fetcher).callGraph('handler', {
            projectId: 'hybrid-codebase-rag',
            direction: 'both',
        });

        expect(fetcher).toHaveBeenCalledWith('http://api/api/v1/query/call-graph', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                symbol: 'handler',
                projectId: 'hybrid-codebase-rag',
                direction: 'both',
            }),
        });
    });

    it('gets latest uploaded index metadata for a project', async () => {
        const fetcher = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ commitSha: 'abc123', createdAt: '2026-05-28T00:00:00.000Z' }),
        });

        await new HybridApiClient('http://api', undefined, fetcher).getLatestIndex('proj-1');

        expect(fetcher).toHaveBeenCalledWith('http://api/api/v1/projects/proj-1/indexes/latest', {
            method: 'GET',
            headers: {},
        });
    });

    it('lists project index versions with filters', async () => {
        const fetcher = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => [],
        });

        await new HybridApiClient('http://api', undefined, fetcher).listProjectIndexes('proj-1', {
            tag: 'env:ci',
            limit: 10,
        });

        expect(fetcher).toHaveBeenCalledWith('http://api/api/v1/projects/proj-1/indexes?tag=env%3Aci&limit=10', {
            method: 'GET',
            headers: {},
        });
    });

    it('lists index versions globally with filters', async () => {
        const fetcher = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ data: [] }),
        });

        await new HybridApiClient('http://api', undefined, fetcher).listIndexes({
            projectId: 'proj-1',
            tag: 'env:ci',
            limit: 5,
        });

        expect(fetcher).toHaveBeenCalledWith('http://api/api/v1/indexes?project=proj-1&tag=env%3Aci&limit=5', {
            method: 'GET',
            headers: {},
        });
    });
});
