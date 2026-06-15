import { describe, expect, it, vi } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { HybridApiClient } from '@src/core/client/index.js';
import { findProjectByIdentity, resolveBackendProjectId, syncBackendProjectOnInit } from '@src/core/runtime/project-identity.js';

describe('project-identity', () => {
    it('findProjectByIdentity matches organization and project slug', async () => {
        const client = {
            listProjects: vi.fn().mockResolvedValue([
                { id: 'proj-a', organization: 'acme', project: 'payments-api', status: 'ready' },
                { id: 'proj-b', organization: 'acme', project: 'other-api', status: 'ready' },
            ]),
        } as unknown as HybridApiClient;

        await expect(findProjectByIdentity({ client, organization: 'acme', project: 'payments-api' })).resolves.toMatchObject({
            id: 'proj-a',
        });
    });

    it('resolveBackendProjectId prefers explicit override', async () => {
        const client = { listProjects: vi.fn() } as unknown as HybridApiClient;

        await expect(
            resolveBackendProjectId({
                client,
                config: { organization: 'acme', project: 'payments-api', project_id: 'cached-id' },
                override: 'override-id',
            }),
        ).resolves.toEqual({ projectId: 'override-id' });

        expect(client.listProjects).not.toHaveBeenCalled();
    });

    it('resolveBackendProjectId uses cached project_id', async () => {
        const client = { listProjects: vi.fn() } as unknown as HybridApiClient;

        await expect(
            resolveBackendProjectId({
                client,
                config: { project_id: 'cached-id' },
            }),
        ).resolves.toEqual({ projectId: 'cached-id' });
    });

    it('resolveBackendProjectId looks up git identity when project_id is absent', async () => {
        const client = {
            listProjects: vi.fn().mockResolvedValue([{ id: 'proj-a', organization: 'acme', project: 'payments-api' }]),
        } as unknown as HybridApiClient;

        await expect(
            resolveBackendProjectId({
                client,
                config: { organization: 'acme', project: 'payments-api' },
                persistLookup: false,
            }),
        ).resolves.toEqual({ projectId: 'proj-a' });
    });

    it('resolveBackendProjectId treats legacy uuid project field as backend id', async () => {
        const client = { listProjects: vi.fn() } as unknown as HybridApiClient;

        await expect(
            resolveBackendProjectId({
                client,
                config: { project: '550e8400-e29b-41d4-a716-446655440000' },
            }),
        ).resolves.toEqual({ projectId: '550e8400-e29b-41d4-a716-446655440000' });
    });

    it('resolveBackendProjectId returns failure when identity is missing on backend', async () => {
        const client = {
            listProjects: vi.fn().mockResolvedValue([]),
        } as unknown as HybridApiClient;

        await expect(
            resolveBackendProjectId({
                client,
                config: { organization: 'acme', project: 'payments-api' },
            }),
        ).resolves.toMatchObject({
            failure: {
                summary: 'Backend project not found for Git identity',
            },
        });
    });

    it('syncBackendProjectOnInit skips backend calls when api key is missing', async () => {
        const writes: string[] = [];
        const client = {
            listProjects: vi.fn(),
            createProject: vi.fn(),
        } as unknown as HybridApiClient;

        await syncBackendProjectOnInit({
            client,
            cwd: process.cwd(),
            hasApiKey: false,
            organization: 'acme',
            project: 'payments-api',
            projectName: 'acme/payments-api',
            stdout: (line) => writes.push(line),
        });

        expect(client.listProjects).not.toHaveBeenCalled();
        expect(client.createProject).not.toHaveBeenCalled();
        expect(writes.some((line) => line.includes('skipped backend project registration'))).toBe(true);
    });

    it('syncBackendProjectOnInit calls create and persists project_id', async () => {
        const writes: string[] = [];
        const createProject = vi.fn().mockResolvedValue({ id: 'proj-created' });
        const client = {
            listProjects: vi.fn(),
            createProject,
        } as unknown as HybridApiClient;

        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-sync-'));

        try {
            await syncBackendProjectOnInit({
                client,
                cwd,
                hasApiKey: true,
                organization: 'acme',
                project: 'payments-api',
                projectName: 'acme/payments-api',
                stdout: (line) => writes.push(line),
            });

            expect(client.listProjects).not.toHaveBeenCalled();
            expect(createProject).toHaveBeenCalledWith({
                name: 'acme/payments-api',
                organization: 'acme',
                project: 'payments-api',
                sourceType: 'prebuilt',
            });
            expect(writes.some((line) => line.includes('Linked backend project: acme/payments-api (proj-created)'))).toBe(true);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});
