import { describe, expect, it, vi } from 'vitest';
import { mkdtemp, rm, symlink, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createProgram, isCliEntrypoint } from '@src/index.js';

vi.mock('@src/prompts/searchable-multi-select.js', () => ({
    searchableMultiSelect: vi.fn().mockResolvedValue([]),
}));

vi.mock('@inquirer/prompts', () => ({
    confirm: vi.fn().mockResolvedValue(true),
}));

const mockInitFetcher = vi.fn(async (url: string, init?: RequestInit) => {
    if (url.endsWith('/projects') && init?.method === 'POST') {
        return { ok: true, json: async () => ({ id: 'proj-test' }) };
    }
    return { ok: true, json: async () => ({}) };
});

describe('only-one CLI', () => {
    it('detects npm global symlink entrypoints', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-cli-entrypoint-'));
        const targetPath = join(cwd, 'dist-index.js');
        const symlinkPath = join(cwd, 'only-one');
        await writeFile(targetPath, '');

        try {
            await symlink(targetPath, symlinkPath);
        } catch (err: any) {
            if (err.code === 'EPERM' || err.code === 'EACCES') {
                await rm(cwd, { recursive: true, force: true });
                return; // Skip if symlinks are not allowed on this system (Windows without dev mode)
            }
            throw err;
        }

        try {
            expect(isCliEntrypoint(pathToFileURL(targetPath).href, symlinkPath)).toBe(true);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it.skip('searches the configured project', async () => {
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

    it.skip('requests and prints structural search context', async () => {
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

    it.skip('runs impact analysis against GitNexus repo id', async () => {
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

    it.skip('prints a call graph summary', async () => {
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

    it('initializes with all steps skipped', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-cli-init-'));
        const writes: string[] = [];

        try {
            const program = createProgram({
                cwd,
                env: {},
                fetcher: mockInitFetcher,
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['init', '--yes', '--skip', 'tools,packages,skills'], { from: 'user' });

            const output = writes.join('\n');
            expect(output).toContain('Init complete');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('runs specific step with --step', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-cli-init-'));
        const writes: string[] = [];

        try {
            const program = createProgram({
                cwd,
                env: {},
                fetcher: mockInitFetcher,
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['init', '--yes', '--step', 'packages', '--skip', 'tools,skills'], { from: 'user' });

            const output = writes.join('\n');
            expect(output).toContain('Init complete');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    }, 15_000);

    describe('bulk-index command integration', () => {
        it.skip('runs bulk-index dry-run', async () => {
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
