import { describe, expect, it, vi } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { createProgram } from '@src/index.js';

describe.skip('init-source command', () => {
    it('clones selected source files to local directory with checkbox unchecked by default', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-init-source-'));
        const writes: string[] = [];

        try {
            const fetcher = vi.fn(async (url: string, init?: RequestInit) => {
                if (url.endsWith('/projects')) {
                    return {
                        ok: true,
                        json: async () => [{ id: 'p123', organization: 'myorg', project: 'myrepo', name: 'myorg/myrepo' }],
                    };
                }
                if (url.endsWith('/projects/p123/source/files')) {
                    return {
                        ok: true,
                        json: async () => ({
                            projectId: 'p123',
                            files: ['package.json', 'src/main.ts'],
                            indexedAt: new Date().toISOString(),
                        }),
                    };
                }
                if (url.includes('/projects/p123/source/file-content')) {
                    const parsedUrl = new URL(url);
                    const path = parsedUrl.searchParams.get('path');
                    return {
                        ok: true,
                        json: async () => ({
                            projectId: 'p123',
                            filePath: path,
                            content: `content of ${path}`,
                        }),
                    };
                }
                return { ok: true, json: async () => ({}) };
            });

            const selectMock = vi.fn().mockResolvedValue('p123');
            const checkboxMock = vi.fn().mockResolvedValue(['package.json', 'src/main.ts']);
            const confirmMock = vi.fn().mockResolvedValue(true);
            const inputMock = vi.fn().mockResolvedValue('');

            const program = createProgram({
                cwd,
                env: {},
                fetcher,
                stdout: (line) => writes.push(line),
                prompts: {
                    select: selectMock,
                    checkbox: checkboxMock,
                    confirm: confirmMock,
                    input: inputMock,
                },
            });

            await program.parseAsync(['init-source'], { from: 'user' });

            expect(selectMock).toHaveBeenCalled();
            expect(checkboxMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    choices: [
                        { name: 'package.json', value: 'package.json', checked: false },
                        { name: 'src/main.ts', value: 'src/main.ts', checked: false },
                    ],
                }),
            );
            expect(confirmMock).toHaveBeenCalled();

            expect(existsSync(join(cwd, 'package.json'))).toBe(true);
            expect(existsSync(join(cwd, 'src/main.ts'))).toBe(true);

            expect(await readFile(join(cwd, 'package.json'), 'utf-8')).toBe('content of package.json');
            expect(await readFile(join(cwd, 'src/main.ts'), 'utf-8')).toBe('content of src/main.ts');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('displays file content when run with --view <path>', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-init-source-view-'));
        const writes: string[] = [];

        try {
            const fetcher = vi.fn(async (url: string, init?: RequestInit) => {
                if (url.endsWith('/projects')) {
                    return {
                        ok: true,
                        json: async () => [{ id: 'p123', organization: 'myorg', project: 'myrepo', name: 'myorg/myrepo' }],
                    };
                }
                if (url.endsWith('/projects/p123/source/files')) {
                    return {
                        ok: true,
                        json: async () => ({
                            projectId: 'p123',
                            files: ['package.json', 'src/main.ts'],
                            indexedAt: new Date().toISOString(),
                        }),
                    };
                }
                if (url.includes('/projects/p123/source/file-content')) {
                    const parsedUrl = new URL(url);
                    const path = parsedUrl.searchParams.get('path');
                    return {
                        ok: true,
                        json: async () => ({
                            projectId: 'p123',
                            filePath: path,
                            content: `content of ${path}`,
                        }),
                    };
                }
                return { ok: true, json: async () => ({}) };
            });

            const selectMock = vi.fn().mockResolvedValue('p123');
            const checkboxMock = vi.fn();
            const confirmMock = vi.fn();
            const inputMock = vi.fn().mockResolvedValue('');

            const program = createProgram({
                cwd,
                env: {},
                fetcher,
                stdout: (line) => writes.push(line),
                prompts: {
                    select: selectMock,
                    checkbox: checkboxMock,
                    confirm: confirmMock,
                    input: inputMock,
                },
            });

            await program.parseAsync(['init-source', '--view', 'package.json'], { from: 'user' });

            expect(selectMock).toHaveBeenCalled();
            expect(checkboxMock).not.toHaveBeenCalled();
            expect(writes).toContain('content of package.json');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('displays file content interactively when run with --view flag without path', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-init-source-view-interactive-'));
        const writes: string[] = [];

        try {
            const fetcher = vi.fn(async (url: string, init?: RequestInit) => {
                if (url.endsWith('/projects')) {
                    return {
                        ok: true,
                        json: async () => [{ id: 'p123', organization: 'myorg', project: 'myrepo', name: 'myorg/myrepo' }],
                    };
                }
                if (url.endsWith('/projects/p123/source/files')) {
                    return {
                        ok: true,
                        json: async () => ({
                            projectId: 'p123',
                            files: ['package.json', 'src/main.ts'],
                            indexedAt: new Date().toISOString(),
                        }),
                    };
                }
                if (url.includes('/projects/p123/source/file-content')) {
                    const parsedUrl = new URL(url);
                    const path = parsedUrl.searchParams.get('path');
                    return {
                        ok: true,
                        json: async () => ({
                            projectId: 'p123',
                            filePath: path,
                            content: `content of ${path}`,
                        }),
                    };
                }
                return { ok: true, json: async () => ({}) };
            });

            // First select: project selection -> returns 'p123'
            // Second select: file selection -> returns 'src/main.ts'
            const selectMock = vi.fn().mockResolvedValueOnce('p123').mockResolvedValueOnce('src/main.ts');
            const checkboxMock = vi.fn();
            const confirmMock = vi.fn();
            const inputMock = vi.fn().mockResolvedValue('');

            const program = createProgram({
                cwd,
                env: {},
                fetcher,
                stdout: (line) => writes.push(line),
                prompts: {
                    select: selectMock,
                    checkbox: checkboxMock,
                    confirm: confirmMock,
                    input: inputMock,
                },
            });

            await program.parseAsync(['init-source', '--view'], { from: 'user' });

            expect(selectMock).toHaveBeenCalledTimes(2);
            expect(checkboxMock).not.toHaveBeenCalled();
            expect(writes).toContain('content of src/main.ts');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});
