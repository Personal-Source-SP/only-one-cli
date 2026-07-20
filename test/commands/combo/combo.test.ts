import { describe, expect, it, vi } from 'vitest';
import { mkdtemp, rm, mkdir } from 'node:fs/promises';
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

            await program.parseAsync(['combo', cwd, 'idsd-flow', '--tool', 'cursor', '--yes'], { from: 'user' });

            const output = writes.join('\n');
            expect(output).toContain('Processing combo:');
            expect(output).toContain('IDSD Flow Setup');
            expect(output).toContain("COMBO 'IDSD FLOW SETUP' REPORT");

            // Verify configuration template copy
            const configPath = join(cwd, 'openspec', 'config.yaml');
            expect(existsSync(configPath)).toBe(true);

            // Verify skill copy
            const skillPath = join(cwd, '.cursor', 'skills', 'grill-me');
            expect(existsSync(skillPath)).toBe(true);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});
