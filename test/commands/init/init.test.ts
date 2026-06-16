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

    it('outputs JSON when --json is passed to parent', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'init-test-json-'));
        const writes: string[] = [];

        try {
            const program = createProgram({
                cwd,
                env: {},
                fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['--json', 'init', '--yes', '--skip', 'tools,packages,skills'], { from: 'user' });

            expect(JSON.parse(writes.join('\n'))).toEqual({});
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

            await program.parseAsync(['init', '--yes', '--combo', 'default', '--skip', 'tools'], { from: 'user' });

            expect(writes.join('\n')).toContain('Init complete');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});
