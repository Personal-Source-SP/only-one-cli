import { describe, expect, it, vi } from 'vitest';
import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { createProgram } from '@src/index.js';

let tempHome: string;

vi.mock('node:os', async () => {
    const actual = await vi.importActual<typeof import('node:os')>('node:os');
    return {
        ...actual,
        homedir: () => tempHome,
    };
});

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
        tempHome = cwd;
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

            await program.parseAsync(['combo', 'backend-flow', '--global', '--tool', 'cursor'], { from: 'user' });

            const output = writes.join('\n');
            expect(output).toContain('Processing combo:');
            expect(output).toContain('Backend Flow Setup');
            expect(output).toContain("COMBO 'BACKEND FLOW SETUP' REPORT");

            // Verify skill copy
            const skillPath = join(tempHome, '.cursor', 'skills', 'only-one-nestjs-development');
            expect(existsSync(skillPath)).toBe(true);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('leaves existing combo components unchecked for overwrite by default', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'combo-overwrite-test-'));
        tempHome = cwd;
        const prompts: Array<{ message: string; choices: Array<{ checked?: boolean }> }> = [];

        try {
            await mkdir(join(tempHome, '.cursor', 'skills', 'only-one-nestjs-development'), { recursive: true });
            await writeFile(join(tempHome, '.cursor', 'skills', 'only-one-nestjs-development', 'SKILL.md'), 'existing: true\n');
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

            await program.parseAsync(['combo', 'backend-flow', '--global', '--tool', 'cursor'], { from: 'user' });

            const overwritePrompt = prompts.find((prompt) => prompt.message.includes('already exist'));
            expect(overwritePrompt?.choices.length).toBeGreaterThan(0);
            expect(overwritePrompt?.choices.every((choice) => choice.checked === false)).toBe(true);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('applies frontend flow rules and workflows instead of silently ignoring them', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'combo-frontend-test-'));
        tempHome = cwd;
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

            await program.parseAsync(['combo', 'frontend-flow', '--global', '--tool', 'cursor'], { from: 'user' });

            expect(existsSync(join(tempHome, '.cursor', 'rules', '02-next-architecture-stack.md'))).toBe(true);
            expect(existsSync(join(tempHome, '.cursor', 'skills', 'only-one-nextjs-development', 'SKILL.md'))).toBe(true);
            expect(writes.join('\n')).toContain('Rules:');
            expect(writes.join('\n')).toContain('Skills:');
            expect(writes.join('\n')).toContain('Initializing UI/UX Pro Max CLI...');
            expect(writes.join('\n')).toContain('UI/UX Pro Max initialized successfully for Cursor');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('shows combo id, name, and description without dependency details', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'combo-details-test-'));
        tempHome = cwd;
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

            await program.parseAsync(['combo', '--global', '--tool', 'cursor'], { from: 'user' });

            const frontend = comboChoices.find((choice) => choice.name.includes('frontend-flow'));
            expect(frontend?.name).toContain('frontend-flow — Frontend Flow Setup [Global]');
            expect(frontend?.checked).toBe(true);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('rejects installing global-only combo in project mode', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'combo-scope-err-'));
        try {
            const program = createProgram({
                cwd,
                env: {},
                fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
                stdout: () => undefined,
            });

            await expect(program.parseAsync(['combo', cwd, 'frontend-flow', '--tool', 'cursor'], { from: 'user' })).rejects.toThrow(
                "Combo 'Frontend Flow Setup' is scoped for 'global' only and cannot be installed in local project mode.",
            );
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});
