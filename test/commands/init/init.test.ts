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
    it('runs init and skips all steps', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'init-test-skipall-'));
        const writes: string[] = [];

        try {
            const program = createProgram({
                cwd,
                env: {},
                fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['init', '--skip', 'tools,packages,skills'], { from: 'user' });

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

            await program.parseAsync(['init', '--step', 'packages', '--skip', 'tools,skills'], { from: 'user' });

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

            await program.parseAsync(['init', cwd, '--skip', 'tools,packages,skills'], { from: 'user' });

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

            await program.parseAsync(['init', '--combo', 'idsd-flow', '--skip', 'tools'], { from: 'user' });

            expect(writes.join('\n')).toContain('Init complete');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('executes ui-ux-pro-max-cli package post-install hook', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'init-test-uiux-'));
        const writes: string[] = [];

        try {
            const { mkdir } = await import('node:fs/promises');
            // Create dummy .cursor directory so the tool is detected as configured
            await mkdir(join(cwd, '.cursor'), { recursive: true });

            const program = createProgram({
                cwd,
                env: {},
                fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['init', 'package', cwd, 'ui-ux-pro-max-cli'], { from: 'user' });

            const output = writes.join('\n');
            expect(output).toContain('Installing ui-ux-pro-max-cli...');
            expect(output).toContain('Installed ui-ux-pro-max-cli');
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

            await program.parseAsync(['init', 'skill', cwd, 'grill-me'], { from: 'user' });

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

            await program.parseAsync(['init', 'skill', cwd, 'grill-me', '--no-ignore'], { from: 'user' });

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

            await program.parseAsync(['init', 'skill', cwd, 'grill-me'], { from: 'user' });

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

    it('runs init mcp with explicit names and configured IDEs', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'init-test-mcp-'));
        const tempHome = join(cwd, 'home');
        const writes: string[] = [];

        try {
            const program = createProgram({
                cwd,
                env: { HOME: tempHome, USERPROFILE: tempHome },
                fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['init', 'mcp', 'github,clockify', '--ide', 'cursor'], { from: 'user' });

            const output = writes.join('\n').replace(/\u001b\[\d+m/g, '');
            expect(output).toContain('Cursor (');
            expect(output).toContain('github: added');
            expect(output).toContain('clockify: added');

            const cursorConfigPath = join(tempHome, '.cursor', 'mcp.json');
            const { existsSync } = await import('node:fs');
            expect(existsSync(cursorConfigPath)).toBe(true);

            const cursorConfig = JSON.parse(await import('node:fs/promises').then((fs) => fs.readFile(cursorConfigPath, 'utf-8')));
            expect(cursorConfig.mcpServers.github.command).toBe('npx');
            expect(cursorConfig.mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN).toBe('');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('runs init mcp interactively, prompts for selection, and skips existing mcp', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'init-test-mcp-interactive-'));
        const tempHome = join(cwd, 'home');
        const writes: string[] = [];

        const { mkdir, writeFile } = await import('node:fs/promises');
        const cursorMcpDir = join(tempHome, '.cursor');
        await mkdir(cursorMcpDir, { recursive: true });
        const cursorMcpPath = join(cursorMcpDir, 'mcp.json');
        await writeFile(
            cursorMcpPath,
            JSON.stringify({
                mcpServers: {
                    github: { command: 'existing-command', env: { GITHUB_PERSONAL_ACCESS_TOKEN: 'existing-token' } },
                },
            }),
        );

        try {
            const mockCheckbox = vi.fn().mockImplementation(async (opts: any) => {
                if (opts?.message?.includes('Select MCP servers')) return ['github', 'clockify'];
                if (opts?.message?.includes('Select IDEs')) return ['cursor'];
                return ['github', 'clockify'];
            });
            const program = createProgram({
                cwd,
                env: { HOME: tempHome, USERPROFILE: tempHome },
                fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
                prompts: {
                    checkbox: mockCheckbox,
                    confirm: vi.fn().mockResolvedValue(true),
                    select: vi.fn().mockResolvedValue('custom'),
                    input: vi.fn().mockResolvedValue(''),
                },
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['init', 'mcp', '--ide', 'cursor'], { from: 'user' });

            expect(mockCheckbox).toHaveBeenCalled();
            const output = writes.join('\n').replace(/\u001b\[\d+m/g, '');
            expect(output).toContain('github: skipped');
            expect(output).toContain('clockify: added');

            const cursorConfig = JSON.parse(await import('node:fs/promises').then((fs) => fs.readFile(cursorMcpPath, 'utf-8')));
            expect(cursorConfig.mcpServers.github.command).toBe('existing-command');
            expect(cursorConfig.mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN).toBe('existing-token');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('fails when unsupported IDE is selected for mcp init', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'init-test-mcp-unsupported-'));
        const writes: string[] = [];

        try {
            const program = createProgram({
                cwd,
                env: {},
                fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
                stdout: (line) => writes.push(line),
                stderr: (line) => writes.push(line),
            });

            await expect(program.parseAsync(['mcp', 'github', '--ide', 'invalid-ide'], { from: 'user' })).rejects.toThrow();
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});
