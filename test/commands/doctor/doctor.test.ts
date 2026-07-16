import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import { createProgram } from '@src/index.js';

vi.mock('node:child_process', async (importOriginal) => {
    const actual = await importOriginal<typeof import('node:child_process')>();
    return {
        ...actual,
        execFileSync: vi.fn(),
    };
});

describe('doctor command', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(execFileSync).mockImplementation((cmd: string) => {
            if (cmd === 'git') return 'git version 2.43.0\n';
            return 'Python 3.11.8\n';
        });
    });

    it('prints git and node status successfully', async () => {
        const writes: string[] = [];
        const program = createProgram({
            cwd: process.cwd(),
            stdout: (line) => writes.push(line),
        });

        await program.parseAsync(['doctor'], { from: 'user' });
        const output = writes.join('\n');
        expect(output).toContain('✓ git: 2.43.0');
        expect(output).toContain('✓ node:');
        expect(process.exitCode).toBeUndefined();
    });

    it('sets exitCode to 1 if git fails', async () => {
        vi.mocked(execFileSync).mockImplementation((cmd: string) => {
            if (cmd === 'git') throw new Error('not found');
            return 'Python 3.11.8\n';
        });

        const writes: string[] = [];
        const program = createProgram({
            cwd: process.cwd(),
            stdout: (line) => writes.push(line),
        });

        try {
            await program.parseAsync(['doctor'], { from: 'user' });
            const output = writes.join('\n');
            expect(output).toContain('✗ git: not found');
            expect(process.exitCode).toBe(1);
        } finally {
            process.exitCode = undefined;
        }
    });
});
