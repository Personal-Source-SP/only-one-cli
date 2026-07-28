import { describe, expect, it, vi } from 'vitest';
import { mkdtemp, rm, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { createProgram } from '@src/index.js';

vi.mock('node:child_process', () => ({
    execFile: vi.fn((file, args, options, callback) => {
        const cb = typeof options === 'function' ? options : callback;
        if (cb) {
            cb(null, { stdout: '', stderr: '' });
        }
    }),
}));

describe('combo command', () => {
    it('applies a predefined combo setup successfully', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'combo-test-'));
        const writes: string[] = [];

        try {
            await mkdir(join(cwd, '.cursor'), { recursive: true });

            const program = createProgram({
                cwd,
                env: {},
                fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
                stdout: (line) => writes.push(line),
                prompts: {
                    checkbox: vi.fn().mockResolvedValue(['cursor']),
                },
            });

            await program.parseAsync(['combo', cwd, 'backend-flow', '--tool', 'cursor'], { from: 'user' });

            const output = writes.join('\n');
            expect(output).toContain('Processing combo:');
            expect(output).toContain('Backend Flow Setup');
            expect(output).toContain("COMBO 'BACKEND FLOW SETUP' REPORT");

            // Verify configuration template copy
            const configPath = join(cwd, 'openspec', 'config.yaml');
            expect(await readFile(configPath, 'utf8')).toContain('schema: intent-driven-be');
            expect(existsSync(join(cwd, 'openspec', 'schemas', 'intent-driven-be', 'schema.yaml'))).toBe(true);

            // Verify skill copy
            const skillPath = join(cwd, '.cursor', 'skills', 'grill-me');
            expect(existsSync(skillPath)).toBe(true);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('leaves existing combo components unchecked for overwrite by default', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'combo-overwrite-test-'));
        const prompts: Array<{ message: string; choices: Array<{ checked?: boolean }> }> = [];

        try {
            await mkdir(join(cwd, '.cursor'), { recursive: true });
            await mkdir(join(cwd, 'openspec'), { recursive: true });
            await writeFile(join(cwd, 'openspec', 'config.yaml'), 'existing: true\n');
            const program = createProgram({
                cwd,
                env: {},
                fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
                stdout: () => undefined,
                prompts: {
                    checkbox: vi.fn(async (options) => {
                        prompts.push(options);
                        return [];
                    }),
                },
            });

            await program.parseAsync(['combo', cwd, 'backend-flow', '--tool', 'cursor'], { from: 'user' });

            const overwritePrompt = prompts.find((prompt) => prompt.message.includes('already exist'));
            expect(overwritePrompt?.choices.length).toBeGreaterThan(0);
            expect(overwritePrompt?.choices.every((choice) => choice.checked === false)).toBe(true);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('applies frontend flow rules and workflows instead of silently ignoring them', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'combo-frontend-test-'));
        const writes: string[] = [];

        try {
            await mkdir(join(cwd, '.cursor'), { recursive: true });
            const program = createProgram({
                cwd,
                env: {},
                fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
                stdout: (line) => writes.push(line),
                prompts: { checkbox: vi.fn().mockResolvedValue(['cursor']) },
            });

            await program.parseAsync(['combo', cwd, 'frontend-flow', '--tool', 'cursor'], { from: 'user' });

            expect(existsSync(join(cwd, '.cursor', 'rules', '02-architecture-stack.md'))).toBe(true);
            expect(existsSync(join(cwd, '.cursor', 'rules', '01-context-and-tools.md'))).toBe(true);
            expect(existsSync(join(cwd, '.cursor', 'workflows', 'only-one-plan-fe.md'))).toBe(false);
            expect(await readFile(join(cwd, 'openspec', 'config.yaml'), 'utf8')).toContain('schema: intent-driven-fe');
            expect(existsSync(join(cwd, 'openspec', 'schemas', 'intent-driven-fe', 'schema.yaml'))).toBe(true);
            expect(writes.join('\n')).not.toContain('Configuring plugin superpowers');
            expect(writes.join('\n')).toContain('Rules:');
            expect(writes.join('\n')).toContain('Workflows:');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
    it('shows combo id, name, and description without dependency details', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'combo-details-test-'));
        let comboChoices: Array<{ name: string; checked?: boolean }> = [];

        try {
            const program = createProgram({
                cwd,
                env: {},
                fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
                stdout: () => undefined,
                prompts: {
                    checkbox: vi.fn(async (options) => {
                        if (options.message.includes('Select combos')) comboChoices = options.choices;
                        return [];
                    }),
                },
            });

            await program.parseAsync(['combo', cwd, '--tool', 'cursor'], { from: 'user' });

            const frontend = comboChoices.find((choice) => choice.name.includes('frontend-flow'));
            expect(frontend?.name).toBe('frontend-flow — Frontend Flow Setup\n  Next.js and React frontend development toolkit');
            expect(frontend?.checked).toBe(true);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});
