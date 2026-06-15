import { describe, expect, it, vi } from 'vitest';
import { mkdtemp, readFile, rm, symlink, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { HYBRID_INDEX_DIR, HYBRID_INDEX_CONFIG_FILE } from '@src/core/prebuilt/index-output.js';
import { createProgram, isCliEntrypoint } from '@src/index.js';

const projectConfigPath = (cwd: string) => join(cwd, HYBRID_INDEX_DIR, HYBRID_INDEX_CONFIG_FILE);

const apiHeaders = { Authorization: 'Bearer dev-api-key' };

const mockInitFetcher = vi.fn(async (url: string, init?: RequestInit) => {
    if (url.endsWith('/projects') && init?.method === 'POST') {
        return { ok: true, json: async () => ({ id: 'proj-test' }) };
    }
    return { ok: true, json: async () => ({}) };
});

describe('only-one-cli CLI', () => {
    it('detects npm global symlink entrypoints', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-cli-entrypoint-'));
        const targetPath = join(cwd, 'dist-index.js');
        const symlinkPath = join(cwd, 'only-one-cli');
        await writeFile(targetPath, '');
        await symlink(targetPath, symlinkPath);

        try {
            expect(isCliEntrypoint(pathToFileURL(targetPath).href, symlinkPath)).toBe(true);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('searches the configured project', async () => {
        const writes: string[] = [];
        const fetcher = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                results: [
                    {
                        filePath: 'src/app.ts',
                        startLine: 4,
                        score: 1.25,
                        content: 'auth flow',
                    },
                ],
                total: 1,
            }),
        });

        const program = createProgram({
            cwd: process.cwd(),
            env: { HYBRID_PROJECT: 'proj-1' },
            fetcher,
            stdout: (line) => writes.push(line),
        });

        await program.parseAsync(['--server', 'http://api', 'search', 'auth flow', '--top-k', '3'], {
            from: 'user',
        });

        expect(fetcher).toHaveBeenCalledWith(
            'http://api/api/v1/query/search',
            expect.objectContaining({
                body: JSON.stringify({
                    query: 'auth flow',
                    projectId: 'proj-1',
                    scope: 'per-project',
                    topK: 3,
                }),
            }),
        );
        expect(writes.join('\n')).toContain('src/app.ts · L4');
    });

    it('requests and prints structural search context', async () => {
        const writes: string[] = [];
        const fetcher = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                results: [],
                total: 0,
                structural: {
                    processes: [{ summary: 'Search -> Score' }],
                },
            }),
        });

        const program = createProgram({
            cwd: process.cwd(),
            env: {},
            fetcher,
            stdout: (line) => writes.push(line),
        });

        await program.parseAsync(
            ['--server', 'http://api', '--project', 'hybrid-codebase-rag', 'search', 'semantic search', '--structural'],
            { from: 'user' },
        );

        expect(fetcher).toHaveBeenCalledWith(
            'http://api/api/v1/query/search',
            expect.objectContaining({
                body: JSON.stringify({
                    query: 'semantic search',
                    projectId: 'hybrid-codebase-rag',
                    scope: 'per-project',
                    topK: 10,
                    includeStructural: true,
                }),
            }),
        );
        expect(writes.join('\n')).toContain('GitNexus flows (1)');
        expect(writes.join('\n')).toContain('Search -> Score');
    });

    it('runs impact analysis against GitNexus repo id', async () => {
        const writes: string[] = [];
        const fetcher = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ risk: 'LOW', summary: { direct: 2 } }),
        });

        const program = createProgram({
            cwd: process.cwd(),
            env: {},
            fetcher,
            stdout: (line) => writes.push(line),
        });

        await program.parseAsync(['--server', 'http://api', '--project', 'hybrid-codebase-rag', 'impact', 'ProjectStoreService'], {
            from: 'user',
        });

        expect(fetcher).toHaveBeenCalledWith(
            'http://api/api/v1/query/impact',
            expect.objectContaining({
                body: JSON.stringify({
                    symbol: 'ProjectStoreService',
                    projectId: 'hybrid-codebase-rag',
                    depth: 3,
                }),
            }),
        );
        expect(writes.join('\n')).toContain('Risk: LOW');
    });

    it('prints a call graph summary', async () => {
        const writes: string[] = [];
        const fetcher = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                root: { name: 'handler' },
                nodes: [{}, {}],
                edges: [{}],
            }),
        });

        const program = createProgram({
            cwd: process.cwd(),
            env: {},
            fetcher,
            stdout: (line) => writes.push(line),
        });

        await program.parseAsync(['--server', 'http://api', '--project', 'hybrid-codebase-rag', 'call-graph', 'handler'], { from: 'user' });

        expect(fetcher).toHaveBeenCalledWith(
            'http://api/api/v1/query/call-graph',
            expect.objectContaining({
                body: JSON.stringify({
                    symbol: 'handler',
                    projectId: 'hybrid-codebase-rag',
                    direction: 'both',
                }),
            }),
        );
        expect(writes.join('\n')).toContain('Root: handler');
    });

    it('initializes a config file without prompts', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-cli-init-'));
        const writes: string[] = [];

        try {
            const program = createProgram({
                cwd,
                env: {},
                fetcher: mockInitFetcher,
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(
                ['init', '--no-install-skill', '--server', 'http://api', '--project-name', 'acme/demo', '--index-mode', 'local'],
                {
                    from: 'user',
                },
            );

            const config = await readFile(projectConfigPath(cwd), 'utf-8');
            expect(config).toContain('server: http://api');
            expect(config).toContain('project: demo');
            expect(config).not.toContain('api_key:');
            expect(config).toContain('index_mode: local');
            expect(writes.join('\n')).toContain('Created .only-one-cli/.onlyonecli.yml');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('prints init output as JSON when requested', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-cli-init-'));
        const writes: string[] = [];

        try {
            const program = createProgram({
                cwd,
                env: {},
                fetcher: mockInitFetcher,
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(
                ['--json', 'init', '--no-install-skill', '--server', 'http://api', '--project-name', 'acme/demo', '--index-mode', 'local'],
                {
                    from: 'user',
                },
            );

            expect(JSON.parse(writes.join('\n'))).toMatchObject({
                path: '.only-one-cli/.onlyonecli.yml',
                config: {
                    server: 'http://api',
                    project: 'demo',
                    project_name: expect.any(String),
                    index_mode: 'local',
                },
            });
            expect(JSON.parse(writes.join('\n')).config).not.toHaveProperty('api_key');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('prompts for init values when flags are omitted', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-cli-init-'));

        try {
            const program = createProgram({
                cwd,
                env: {},
                fetcher: mockInitFetcher,
                stdout: vi.fn(),
                prompts: {
                    input: vi.fn().mockResolvedValueOnce('http://prompted').mockResolvedValueOnce('acme/demo'),
                    select: vi.fn().mockResolvedValueOnce('docker'),
                    confirm: vi.fn().mockResolvedValueOnce(false),
                },
            });

            await program.parseAsync(['init', '--no-install-skill'], { from: 'user' });

            const config = await readFile(projectConfigPath(cwd), 'utf-8');
            expect(config).toContain('server: http://prompted');
            expect(config).toContain('project_name: acme/demo');
            expect(config).toContain('organization: acme');
            expect(config).toContain('project: demo');
            expect(config).not.toContain('api_key:');
            expect(config).toContain('index_mode: docker');
            expect(config).toContain('incremental: false');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('writes index_mode from --index-mode flag', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-cli-init-'));

        try {
            const program = createProgram({
                cwd,
                env: {},
                fetcher: mockInitFetcher,
                stdout: vi.fn(),
            });

            await program.parseAsync(
                ['init', '--no-install-skill', '--server', 'http://api', '--project', 'demo', '--index-mode', 'docker'],
                { from: 'user' },
            );

            const config = await readFile(projectConfigPath(cwd), 'utf-8');
            expect(config).toContain('index_mode: docker');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('cancels init when existing config is not confirmed for overwrite', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-cli-init-'));
        await writeFile(join(cwd, '.onlyonecli.yml'), 'server: http://old\n');

        try {
            const program = createProgram({
                cwd,
                env: {},
                fetcher: mockInitFetcher,
                stdout: vi.fn(),
                prompts: {
                    input: vi.fn(),
                    select: vi.fn(),
                    confirm: vi.fn().mockResolvedValueOnce(false),
                },
            });

            await program.parseAsync(['init', '--no-install-skill', '--server', 'http://api', '--project', 'demo'], {
                from: 'user',
            });

            const config = await readFile(join(cwd, '.onlyonecli.yml'), 'utf-8');
            expect(config).toBe('server: http://old\n');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('overwrites existing config when user confirms', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-cli-init-'));
        await writeFile(join(cwd, '.onlyonecli.yml'), 'server: http://old\n');

        try {
            const program = createProgram({
                cwd,
                env: {},
                fetcher: mockInitFetcher,
                stdout: vi.fn(),
                prompts: {
                    input: vi.fn(),
                    select: vi.fn(),
                    confirm: vi.fn().mockResolvedValueOnce(true),
                },
            });

            await program.parseAsync(
                ['init', '--no-install-skill', '--server', 'http://api', '--project', 'demo', '--index-mode', 'docker'],
                { from: 'user' },
            );

            const config = await readFile(projectConfigPath(cwd), 'utf-8');
            expect(config).toContain('server: http://api');
            expect(config).toContain('index_mode: docker');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('overwrites existing config when --force is used', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-cli-init-'));
        await writeFile(join(cwd, '.onlyonecli.yml'), 'server: http://old\n');

        try {
            const program = createProgram({
                cwd,
                env: {},
                fetcher: mockInitFetcher,
                stdout: vi.fn(),
            });

            await program.parseAsync(['init', '--no-install-skill', '--server', 'http://api', '--project', 'demo', '--force'], {
                from: 'user',
            });

            const config = await readFile(projectConfigPath(cwd), 'utf-8');
            expect(config).toContain('server: http://api');
            expect(config).not.toContain('http://old');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    describe('bulk-index command integration', () => {
        it('runs bulk-index dry-run', async () => {
            const cwd = await mkdtemp(join(tmpdir(), 'hybrid-cli-bulk-'));
            await mkdir(join(cwd, 'repo-a', '.git'), { recursive: true });
            const writes: string[] = [];
            try {
                const program = createProgram({
                    cwd,
                    env: {},
                    fetcher: mockInitFetcher,
                    stdout: (line) => writes.push(line),
                });
                await program.parseAsync(['bulk-index', '--dry-run'], { from: 'user' });
                expect(writes.join('\n')).toContain('Total discovered: 1');
                expect(writes.join('\n')).toContain('repo-a');
            } finally {
                await rm(cwd, { recursive: true, force: true });
            }
        });
    });

    describe('doctor command integration', () => {
        it('registers doctor command', () => {
            const program = createProgram({
                cwd: process.cwd(),
                env: {},
                fetcher: mockInitFetcher,
                stdout: () => undefined,
            });
            expect(program.commands.some((command) => command.name() === 'doctor')).toBe(true);
        });
    });
});
