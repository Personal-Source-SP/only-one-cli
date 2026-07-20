import { describe, expect, it, vi } from 'vitest';
import { mkdtemp, rm, mkdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { createProgram } from '@src/index.js';

describe('skill command', () => {
    it('runs skill command with --yes and custom skill name', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'skill-test-'));
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

            await program.parseAsync(['skill', cwd, 'grill-me', '--yes'], { from: 'user' });

            const output = writes.join('\n');
            expect(output).toContain('SKILLS SYNC REPORT');
            expect(output).toContain('grill-me');

            const skillPath = join(cwd, '.cursor', 'skills', 'grill-me');
            expect(existsSync(skillPath)).toBe(true);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('runs skill command interactively selecting IDE and skill', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'skill-test-interactive-'));
        const writes: string[] = [];

        try {
            await mkdir(join(cwd, '.cursor'), { recursive: true });

            const checkboxMock = vi
                .fn()
                .mockResolvedValueOnce(['cursor']) // First call: IDE selection
                .mockResolvedValueOnce(['c4-diagrams']); // Second call: Skill selection

            const program = createProgram({
                cwd,
                env: {},
                fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
                stdout: (line) => writes.push(line),
                prompts: {
                    checkbox: checkboxMock,
                },
            });

            await program.parseAsync(['skill', cwd], { from: 'user' });

            const output = writes.join('\n');
            expect(output).toContain('SKILLS SYNC REPORT');
            expect(output).toContain('c4-diagrams');

            const skillPath = join(cwd, '.cursor', 'skills', 'c4-diagrams');
            expect(existsSync(skillPath)).toBe(true);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});
