import { describe, expect, it, vi } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createProgram } from '@src/index.js';

vi.mock('@src/core/init/openspec-bootstrap.js', () => ({
    ensureOpenspecCli: vi.fn().mockResolvedValue(undefined),
    runOpenspecInit: vi.fn().mockResolvedValue(undefined),
    OpenspecBootstrapError: class extends Error {
        constructor(message: string) {
            super(message);
            this.name = 'OpenspecBootstrapError';
        }
    },
}));

vi.mock('@src/core/init/custom-skills-sync.js', () => ({
    syncCustomSkills: vi.fn().mockResolvedValue(undefined),
    readOpenspecConfig: vi.fn().mockResolvedValue({ agent_tools: [] }),
}));

describe('init command', () => {
    it('runs init successfully with --no-install-skill', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'init-test-noinstall-'));
        const writes: string[] = [];

        try {
            const program = createProgram({
                cwd,
                env: {},
                fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['init', '--no-install-skill'], { from: 'user' });

            expect(writes.join('\n')).toContain('Init complete (skill installation skipped)');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('runs init with openspec bootstrap and custom skills sync', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'init-test-full-'));
        const writes: string[] = [];

        try {
            const program = createProgram({
                cwd,
                env: {},
                fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['init'], { from: 'user' });

            const output = writes.join('\n');
            expect(output).toContain('Checking openspec CLI');
            expect(output).toContain('Running openspec init');
            expect(output).toContain('Syncing custom skills');
            expect(output).toContain('Init complete');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('runs init with --force flag', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'init-test-force-'));
        const writes: string[] = [];

        try {
            const program = createProgram({
                cwd,
                env: {},
                fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['init', '--force'], { from: 'user' });

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

            await program.parseAsync(['--json', 'init', '--no-install-skill'], { from: 'user' });

            expect(JSON.parse(writes.join('\n'))).toEqual({ installSkipped: true });
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('shows deprecation warning for removed flags', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'init-test-deprecate-'));
        const writes: string[] = [];

        try {
            const program = createProgram({
                cwd,
                env: {},
                fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['init', '--no-install-skill', '--project-name', 'acme/demo'], { from: 'user' });

            const output = writes.join('\n');
            expect(output).toContain('[deprecated]');
            expect(output).toContain('--project-name');
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

            await program.parseAsync(['init', cwd, '--no-install-skill'], { from: 'user' });

            expect(writes.join('\n')).toContain('Init complete (skill installation skipped)');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});
