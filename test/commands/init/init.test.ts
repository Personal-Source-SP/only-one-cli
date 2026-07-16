import { describe, expect, it, vi } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createProgram } from '@src/index.js';

vi.mock('@src/prompts/searchable-multi-select.js', () => ({
    searchableMultiSelect: vi.fn().mockResolvedValue([]),
}));

vi.mock('@inquirer/prompts', () => ({
    confirm: vi.fn().mockResolvedValue(true),
    select: vi.fn().mockResolvedValue('combo'),
}));

vi.mock('node:child_process', () => ({
    execFile: vi.fn((file, args, options, callback) => {
        const cb = typeof options === 'function' ? options : callback;
        if (cb) {
            cb(null, { stdout: '', stderr: '' });
        }
    }),
}));

describe('init command', () => {
    it('runs init with --yes and skips all steps', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'init-test-skipall-'));
        const writes: string[] = [];

        try {
            const program = createProgram({
                cwd,
                env: {},
                fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['init', '--yes', '--skip', 'tools,packages,skills'], { from: 'user' });

            expect(writes.join('\n')).toContain('Init complete');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('accepts --step flag to run specific step', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'init-test-step-'));
        const writes: string[] = [];

        try {
            const program = createProgram({
                cwd,
                env: {},
                fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['init', '--yes', '--step', 'packages', '--skip', 'tools,skills'], { from: 'user' });

            expect(writes.join('\n')).toContain('Init complete');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('accepts path argument', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'init-test-path-'));
        const writes: string[] = [];

        try {
            const program = createProgram({
                cwd,
                env: {},
                fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['init', cwd, '--yes', '--skip', 'tools,packages,skills'], { from: 'user' });

            expect(writes.join('\n')).toContain('Init complete');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('accepts --combo flag', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'init-test-combo-'));
        const writes: string[] = [];

        try {
            const program = createProgram({
                cwd,
                env: {},
                fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['init', '--yes', '--combo', 'idsd-flow', '--skip', 'tools'], { from: 'user' });

            expect(writes.join('\n')).toContain('Init complete');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('runs subcommand skill and updates .gitignore', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'init-test-sub-skill-'));
        const writes: string[] = [];

        try {
            const { searchableMultiSelect } = await import('@src/prompts/searchable-multi-select.js');
            vi.mocked(searchableMultiSelect).mockResolvedValueOnce(['grill-me']);

            // Create .cursor directory in temp project dir so it is detected as configured
            const { mkdir } = await import('node:fs/promises');
            await mkdir(join(cwd, '.cursor'), { recursive: true });

            const program = createProgram({
                cwd,
                env: {},
                fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['init', 'skill', cwd, '--yes'], { from: 'user' });

            expect(writes.join('\n')).toContain('Init complete');

            const gitignorePath = join(cwd, '.gitignore');
            const { existsSync } = await import('node:fs');
            expect(existsSync(gitignorePath)).toBe(true);
            const gitignoreContent = await import('node:fs/promises').then((fs) => fs.readFile(gitignorePath, 'utf-8'));
            expect(gitignoreContent).toContain('.cursor/');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('runs subcommand skill with --no-ignore and does not update .gitignore', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'init-test-sub-skill-no-ignore-'));
        const writes: string[] = [];

        try {
            const { searchableMultiSelect } = await import('@src/prompts/searchable-multi-select.js');
            vi.mocked(searchableMultiSelect).mockResolvedValueOnce(['grill-me']);

            const { mkdir } = await import('node:fs/promises');
            await mkdir(join(cwd, '.cursor'), { recursive: true });

            const program = createProgram({
                cwd,
                env: {},
                fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['init', 'skill', cwd, '--yes', '--no-ignore'], { from: 'user' });

            expect(writes.join('\n')).toContain('Init complete');

            const gitignorePath = join(cwd, '.gitignore');
            const { existsSync } = await import('node:fs');
            expect(existsSync(gitignorePath)).toBe(false);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('writes default AI ignores and the custom header # AI ignores to .gitignore', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'init-test-default-ignores-'));
        const writes: string[] = [];

        try {
            const program = createProgram({
                cwd,
                env: {},
                fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['init', 'skill', cwd, 'grill-me', '--yes'], { from: 'user' });

            const gitignorePath = join(cwd, '.gitignore');
            const { existsSync } = await import('node:fs');
            expect(existsSync(gitignorePath)).toBe(true);

            const gitignoreContent = await import('node:fs/promises').then((fs) => fs.readFile(gitignorePath, 'utf-8'));
            expect(gitignoreContent).toContain('# AI ignores');
            expect(gitignoreContent).toContain('.agent/');
            expect(gitignoreContent).toContain('openspec/');
            expect(gitignoreContent).toContain('adr');
            expect(gitignoreContent).toContain('openspec');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});
