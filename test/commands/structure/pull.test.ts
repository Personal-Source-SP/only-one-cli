import { describe, expect, it, vi } from 'vitest';
import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createProgram } from '@src/index.js';

describe('structure-pull command options', () => {
    it('--list --json prints raw JSON array and does not prompt', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-pull-json-'));
        const lines: string[] = [];

        try {
            const fetcher = vi.fn().mockImplementation((url) => {
                if (url.endsWith('/api/v1/projects/structure')) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () =>
                            Promise.resolve([
                                {
                                    projectId: 'proj-1',
                                    organization: 'org1',
                                    project: 'slug1',
                                    name: 'name1',
                                    structuralFilename: 'org1-slug1-structural.md',
                                    structuralFileSize: 2048,
                                },
                            ]),
                    });
                }
                return Promise.resolve({ ok: false, status: 404 });
            });

            const program = createProgram({
                cwd,
                env: { HYBRID_API_KEY: 'test-key' },
                fetcher: fetcher as any,
                stdout: (line) => lines.push(line),
            });

            await program.parseAsync(['--json', 'structure-pull', '--list'], { from: 'user' });

            const payload = JSON.parse(lines.join('\n'));
            expect(payload).toHaveLength(1);
            expect(payload[0].projectId).toBe('proj-1');
            expect(payload[0].structuralFileSize).toBe(2048);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('--list prints table, prompts user, and pulls selected blueprint', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-pull-list-select-'));
        const lines: string[] = [];

        try {
            await mkdir(join(cwd, '.only-one'), { recursive: true });
            await writeFile(join(cwd, '.only-one', 'config.yaml'), 'organization: org1\nproject: slug1\n');

            const fetcher = vi.fn().mockImplementation((url) => {
                if (url.endsWith('/api/v1/projects/structure')) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () =>
                            Promise.resolve([
                                {
                                    projectId: 'proj-1',
                                    organization: 'org1',
                                    project: 'slug1',
                                    name: 'name1',
                                    structuralFilename: 'org1-slug1-structural.md',
                                    structuralFileSize: 2048,
                                },
                            ]),
                    });
                }
                if (url.endsWith('/api/v1/projects/proj-1/structure')) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () =>
                            Promise.resolve({
                                projectId: 'proj-1',
                                filePath: 'structure/org1-slug1-structural.md',
                                content: '# structural blueprint content',
                            }),
                    });
                }
                return Promise.resolve({ ok: false, status: 404 });
            });

            const selectMock = vi.fn().mockResolvedValue('proj-1');

            const program = createProgram({
                cwd,
                env: { HYBRID_API_KEY: 'test-key' },
                fetcher: fetcher as any,
                stdout: (line) => lines.push(line),
                prompts: {
                    select: selectMock,
                } as any,
            });

            await program.parseAsync(['structure-pull', '--list', '--force'], { from: 'user' });

            const output = lines.join('\n');
            expect(output).toContain('ORGANIZATION');
            expect(output).toContain('org1');
            expect(output).toContain('slug1');
            expect(output).toContain('name1');
            expect(output).toContain('2.0 KB');
            expect(selectMock).toHaveBeenCalled();
            expect(output).toContain('Successfully pulled structural blueprint for project "name1"');

            const { readFile } = await import('node:fs/promises');
            const fileContent = await readFile(join(cwd, '.only-one', 'structure', 'org1-slug1-structural.md'), 'utf-8');
            expect(fileContent).toBe('# structural blueprint content');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});
