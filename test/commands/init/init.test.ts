import { describe, expect, it, vi } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { HYBRID_INDEX_DIR, HYBRID_INDEX_CONFIG_FILE } from '@src/core/prebuilt/index-output.js';
import { createProgram } from '@src/index.js';

vi.mock('@src/utils/git-project-name.js', () => ({
    resolveGitProjectName: vi.fn().mockResolvedValue('acme/payments-api'),
}));

describe('init command', () => {
    it('writes search defaults with inline comments', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-init-search-'));

        try {
            const fetcher = vi.fn(async (url: string, init?: RequestInit) => {
                if (url.endsWith('/projects') && init?.method === 'POST') {
                    return { ok: true, json: async () => ({ id: 'proj-init' }) };
                }
                return { ok: true, json: async () => ({}) };
            });

            const program = createProgram({
                cwd,
                env: {},
                fetcher,
                stdout: () => undefined,
                prompts: {
                    confirm: vi.fn(),
                    input: vi.fn(),
                    select: vi.fn(),
                },
            });

            await program.parseAsync(
                [
                    'init',
                    '--force',
                    '--no-install-skill',
                    '--server',
                    'http://api',
                    '--project-name',
                    'acme/payments-api',
                    '--index-mode',
                    'local',
                ],
                { from: 'user' },
            );

            const raw = await readFile(join(cwd, HYBRID_INDEX_DIR, HYBRID_INDEX_CONFIG_FILE), 'utf-8');
            expect(raw).toContain('search:');
            expect(raw).toContain('top_k: 10  # Maximum number of results (-k, --top-k)');
            expect(raw).toContain('snippet_lines: 8');
            expect(raw).toContain('structural: false');
            expect(raw).toContain('scope: per-project');
            expect(raw).toContain('tags: []');
            expect(raw).toContain('interactive: true');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('links backend project via create on init', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-init-create-'));
        const writes: string[] = [];
        const fetcher = vi.fn(async (url: string, init?: RequestInit) => {
            if (url.endsWith('/projects') && init?.method === 'POST') {
                return {
                    ok: true,
                    json: async () => ({ id: 'proj-new' }),
                };
            }
            return { ok: true, json: async () => ({}) };
        });

        try {
            const program = createProgram({
                cwd,
                env: {},
                fetcher,
                stdout: (line) => writes.push(line),
                prompts: {
                    confirm: vi.fn(),
                    input: vi.fn(),
                    select: vi.fn(),
                },
            });

            await program.parseAsync(
                [
                    'init',
                    '--force',
                    '--no-install-skill',
                    '--server',
                    'http://api',
                    '--project-name',
                    'acme/payments-api',
                    '--index-mode',
                    'local',
                ],
                { from: 'user' },
            );

            const raw = await readFile(join(cwd, HYBRID_INDEX_DIR, HYBRID_INDEX_CONFIG_FILE), 'utf-8');
            expect(raw).toContain('project_id: proj-new');
            expect(fetcher).toHaveBeenCalledWith(expect.stringContaining('/projects'), expect.objectContaining({ method: 'POST' }));
            expect(writes.some((line) => line.includes('Linked backend project'))).toBe(true);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('persists agent_tools empty when --tools none', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-init-tools-none-'));

        try {
            const program = createProgram({
                cwd,
                env: {},
                fetcher: vi.fn(async () => ({ ok: true, json: async () => ({ id: 'proj-x' }) })),
                stdout: () => undefined,
                prompts: {
                    confirm: vi.fn(),
                    input: vi.fn(),
                    select: vi.fn(),
                },
            });

            await program.parseAsync(
                [
                    'init',
                    '--force',
                    '--tools',
                    'none',
                    '--server',
                    'http://api',
                    '--project-name',
                    'acme/payments-api',
                    '--index-mode',
                    'local',
                ],
                { from: 'user' },
            );

            const raw = await readFile(join(cwd, HYBRID_INDEX_DIR, HYBRID_INDEX_CONFIG_FILE), 'utf-8');
            expect(raw).toContain('agent_tools: []');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('links existing backend project via idempotent create', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-init-existing-'));
        const writes: string[] = [];
        const fetcher = vi.fn(async (url: string, init?: RequestInit) => {
            if (url.endsWith('/projects') && init?.method === 'POST') {
                return {
                    ok: true,
                    json: async () => ({ id: 'proj-existing' }),
                };
            }
            return { ok: true, json: async () => ({}) };
        });

        try {
            const program = createProgram({
                cwd,
                env: {},
                fetcher,
                stdout: (line) => writes.push(line),
                prompts: {
                    confirm: vi.fn(),
                    input: vi.fn(),
                    select: vi.fn(),
                },
            });

            await program.parseAsync(
                [
                    'init',
                    '--force',
                    '--no-install-skill',
                    '--server',
                    'http://api',
                    '--project-name',
                    'acme/payments-api',
                    '--index-mode',
                    'local',
                ],
                { from: 'user' },
            );

            const raw = await readFile(join(cwd, HYBRID_INDEX_DIR, HYBRID_INDEX_CONFIG_FILE), 'utf-8');
            expect(raw).toContain('project_id: proj-existing');
            expect(fetcher).toHaveBeenCalledWith(expect.stringContaining('/projects'), expect.objectContaining({ method: 'POST' }));
            expect(writes.some((line) => line.includes('Linked backend project'))).toBe(true);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('prompts and saves git details', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-init-git-prompts-'));
        try {
            const fetcher = vi.fn(async (url: string, init?: RequestInit) => {
                if (url.endsWith('/projects') && init?.method === 'POST') {
                    const body = JSON.parse(init.body as string);
                    expect(body.sourceUri).toBe('https://github.com/myorg/myrepo');
                    expect(body.defaultBranch).toBe('dev');
                    return { ok: true, json: async () => ({ id: 'proj-git' }) };
                }
                return { ok: true, json: async () => ({}) };
            });

            const inputMock = vi
                .fn()
                .mockResolvedValueOnce('http://api') // Server
                .mockResolvedValueOnce('acme/payments-api') // Project name
                .mockResolvedValueOnce('https://github.com/myorg/myrepo') // sourceUri
                .mockResolvedValueOnce('dev') // defaultBranch
                .mockResolvedValueOnce('my-token'); // gitToken

            const confirmMock = vi
                .fn()
                .mockResolvedValueOnce(true) // Overwrite if any
                .mockResolvedValueOnce(true) // Enable incremental
                .mockResolvedValueOnce(true); // Is repository private?

            const selectMock = vi.fn().mockResolvedValue('local'); // index mode

            const program = createProgram({
                cwd,
                env: {},
                fetcher,
                stdout: () => undefined,
                prompts: {
                    confirm: confirmMock,
                    input: inputMock,
                    select: selectMock,
                },
            });

            await program.parseAsync(['init', '--force', '--no-install-skill'], { from: 'user' });

            const raw = await readFile(join(cwd, HYBRID_INDEX_DIR, HYBRID_INDEX_CONFIG_FILE), 'utf-8');
            expect(raw).toContain('project_id: proj-git');
            expect(raw).toContain('git_access_token: my-token');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('supports git non-interactive flags and saves token locally', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-init-git-flags-'));
        try {
            const fetcher = vi.fn(async (url: string, init?: RequestInit) => {
                if (url.endsWith('/projects') && init?.method === 'POST') {
                    const body = JSON.parse(init.body as string);
                    expect(body.sourceUri).toBe('https://github.com/foo/bar');
                    expect(body.defaultBranch).toBe('main-branch');
                    return { ok: true, json: async () => ({ id: 'proj-flags' }) };
                }
                return { ok: true, json: async () => ({}) };
            });

            const program = createProgram({
                cwd,
                env: {},
                fetcher,
                stdout: () => undefined,
                prompts: {
                    confirm: vi.fn(),
                    input: vi.fn(),
                    select: vi.fn(),
                },
            });

            await program.parseAsync(
                [
                    'init',
                    '--force',
                    '--no-install-skill',
                    '--server',
                    'http://api',
                    '--project-name',
                    'acme/payments-api',
                    '--index-mode',
                    'local',
                    '--source-uri',
                    'https://github.com/foo/bar',
                    '--default-branch',
                    'main-branch',
                    '--git-token',
                    'flag-token',
                ],
                { from: 'user' },
            );

            const raw = await readFile(join(cwd, HYBRID_INDEX_DIR, HYBRID_INDEX_CONFIG_FILE), 'utf-8');
            expect(raw).toContain('project_id: proj-flags');
            expect(raw).toContain('git_access_token: flag-token');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});
