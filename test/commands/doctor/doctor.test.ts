import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ONLY_ONE_DIR, ONLY_ONE_CONFIG_FILE } from '@src/core/prebuilt/index-output.js';

vi.mock('node:child_process', async (importOriginal) => {
    const actual = await importOriginal<typeof import('node:child_process')>();
    return {
        ...actual,
        execFileSync: vi.fn(),
    };
});

import { execFileSync } from 'node:child_process';
import { createProgram } from '@src/index.js';

function isGitnexusDockerVerify(args?: readonly string[]): boolean {
    return args?.some((arg) => arg.includes('gitnexus/dist/cli/index.js') || arg.includes('abhigyanpatwari/gitnexus')) ?? false;
}

function isCocoindexDockerVerify(args?: readonly string[]): boolean {
    return args?.includes('ccc') === true && args?.includes('--help') === true;
}

async function withProjectConfig(configYaml: string, run: (cwd: string) => Promise<void>): Promise<void> {
    const cwd = await mkdtemp(join(tmpdir(), 'hybrid-doctor-'));
    await mkdir(join(cwd, ONLY_ONE_DIR), { recursive: true });
    await writeFile(join(cwd, ONLY_ONE_DIR, ONLY_ONE_CONFIG_FILE), configYaml);
    try {
        await run(cwd);
    } finally {
        await rm(cwd, { recursive: true, force: true });
    }
}

describe('doctor command', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(execFileSync).mockImplementation((cmd: string, args?: readonly string[]) => {
            if (cmd === 'git') return 'git version 2.43.0\n';
            if (cmd === 'docker') return '27.0.0\n';
            if (args?.includes('gitnexus')) return '1.6.4\n';
            return 'Python 3.11.8\n';
        });
    });

    it('returns NOT_INITIALIZED when init has not been run', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-doctor-uninit-'));
        const writes: string[] = [];

        try {
            const program = createProgram({
                cwd,
                env: { HYBRID_API_KEY: 'test-key' },
                fetcher: vi.fn().mockResolvedValue({ ok: true, status: 200 }),
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['doctor'], { from: 'user' });
            expect(writes.join('\n')).toContain('NOT_INITIALIZED');
            expect(writes.join('\n')).toContain('only-one init');
            expect(process.exitCode).toBe(1);
        } finally {
            process.exitCode = undefined;
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('prints READY report using config index_mode', async () => {
        await withProjectConfig(['server: http://localhost:3000', 'project: demo', 'index_mode: local'].join('\n'), async (cwd) => {
            const writes: string[] = [];
            const program = createProgram({
                cwd,
                env: { HYBRID_API_KEY: 'test-key' },
                fetcher: vi.fn().mockResolvedValue({ ok: true, status: 200 }),
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['doctor'], { from: 'user' });
            expect(writes.join('\n')).toContain('Pre-indexing readiness: READY');
            expect(writes.join('\n')).toContain('source: config');
            expect(writes.join('\n')).toContain('gitnexus');
            expect(writes.join('\n')).toContain('Config (.only-one/.onlyonecli.yml):');
            expect(writes.join('\n')).toContain('Commands:');
            expect(writes.join('\n')).toContain('only-one index:create');
            expect(writes.join('\n')).toContain('only-one push-index');
        });
    });

    it('uses docker checks when config index_mode is docker', async () => {
        await withProjectConfig(['server: http://localhost:3000', 'project: demo', 'index_mode: docker'].join('\n'), async (cwd) => {
            const writes: string[] = [];
            const program = createProgram({
                cwd,
                env: { HYBRID_API_KEY: 'test-key' },
                fetcher: vi.fn().mockResolvedValue({ ok: true, status: 200 }),
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['doctor'], { from: 'user' });
            expect(writes.join('\n')).toContain('mode: docker');
            expect(writes.join('\n')).toContain('source: config');
            expect(execFileSync).toHaveBeenCalledWith(
                'docker',
                ['image', 'inspect', 'ghcr.io/abhigyanpatwari/gitnexus:1.6.4'],
                expect.any(Object),
            );
        });
    });

    it('lets CLI --mode override config index_mode for one run', async () => {
        await withProjectConfig(['server: http://localhost:3000', 'project: demo', 'index_mode: local'].join('\n'), async (cwd) => {
            const writes: string[] = [];
            const program = createProgram({
                cwd,
                env: { HYBRID_API_KEY: 'test-key' },
                fetcher: vi.fn().mockResolvedValue({ ok: true, status: 200 }),
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['doctor', '--mode', 'docker'], {
                from: 'user',
            });
            expect(writes.join('\n')).toContain('mode: docker');
            expect(writes.join('\n')).toContain('source: cli');
        });
    });

    it('prints MISSING report with remediation', async () => {
        vi.mocked(execFileSync).mockImplementation((cmd: string, args?: readonly string[]) => {
            if (cmd === 'docker') return '27.0.0\n';
            if (args?.includes('gitnexus')) throw new Error('missing');
            return 'Python 3.11.8\n';
        });

        await withProjectConfig(['server: http://localhost:3000', 'project: demo', 'index_mode: local'].join('\n'), async (cwd) => {
            const writes: string[] = [];
            const program = createProgram({
                cwd,
                env: { HYBRID_API_KEY: 'test-key' },
                fetcher: vi.fn().mockResolvedValue({ ok: true, status: 200 }),
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['doctor'], { from: 'user' });
            expect(writes.join('\n')).toContain('Pre-indexing readiness: MISSING');
            expect(writes.join('\n')).toContain('Remediation:');
            expect(writes.join('\n')).toContain('npm install -g gitnexus');
        });
    });

    it('prints install script without executing installs', async () => {
        vi.mocked(execFileSync).mockImplementation((cmd: string, args?: readonly string[]) => {
            if (cmd === 'docker') return '27.0.0\n';
            if (args?.includes('gitnexus')) throw new Error('missing');
            return 'Python 3.11.8\n';
        });

        await withProjectConfig(['server: http://localhost:3000', 'project: demo', 'index_mode: local'].join('\n'), async (cwd) => {
            const writes: string[] = [];
            const program = createProgram({
                cwd,
                env: { HYBRID_API_KEY: 'test-key' },
                fetcher: vi.fn().mockResolvedValue({ ok: true, status: 200 }),
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['doctor', '--print-install-script'], {
                from: 'user',
            });
            expect(writes.join('\n')).toContain('npm install -g gitnexus@1.6.4');
        });
    });

    it('prompts to install missing dependencies in interactive mode', async () => {
        let gitnexusReady = false;
        vi.mocked(execFileSync).mockImplementation((cmd: string, args?: readonly string[]) => {
            if (cmd === 'git') return 'git version 2.43.0\n';
            if (cmd === 'docker') {
                if (args?.[0] === 'pull') {
                    if (args[1]?.includes('gitnexus')) gitnexusReady = true;
                    return '';
                }
                if (isGitnexusDockerVerify(args) && !gitnexusReady) {
                    throw new Error('missing');
                }
                if (isGitnexusDockerVerify(args)) return '1.6.4\n';
                if (isCocoindexDockerVerify(args)) return 'Usage: ccc\n';
                return '27.0.0\n';
            }
            return 'Python 3.11.8\n';
        });

        await withProjectConfig(['server: http://localhost:3000', 'project: demo', 'index_mode: docker'].join('\n'), async (cwd) => {
            const writes: string[] = [];
            const confirm = vi.fn().mockResolvedValueOnce(true);
            const program = createProgram({
                cwd,
                env: { HYBRID_API_KEY: 'test-key' },
                fetcher: vi.fn().mockResolvedValue({ ok: true, status: 200 }),
                stdout: (line) => writes.push(line),
                prompts: {
                    input: vi.fn(),
                    select: vi.fn(),
                    confirm,
                },
            });

            await program.parseAsync(['doctor'], { from: 'user' });
            expect(confirm).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('Install missing dependencies now?'),
                }),
            );
            expect(writes.join('\n')).toContain('Installing missing dependencies');
            expect(execFileSync).toHaveBeenCalledWith('docker', ['pull', 'ghcr.io/abhigyanpatwari/gitnexus:1.6.4'], expect.any(Object));
        });
    });

    it('installs immediately with --yes', async () => {
        let gitnexusReady = false;
        vi.mocked(execFileSync).mockImplementation((cmd: string, args?: readonly string[]) => {
            if (cmd === 'git') return 'git version 2.43.0\n';
            if (cmd === 'docker') {
                if (args?.[0] === 'pull') {
                    if (args[1]?.includes('gitnexus')) gitnexusReady = true;
                    return '';
                }
                if (isGitnexusDockerVerify(args) && !gitnexusReady) {
                    throw new Error('missing');
                }
                if (isGitnexusDockerVerify(args)) return '1.6.4\n';
                if (isCocoindexDockerVerify(args)) return 'Usage: ccc\n';
                return '27.0.0\n';
            }
            return 'Python 3.11.8\n';
        });

        await withProjectConfig(['server: http://localhost:3000', 'project: demo', 'index_mode: docker'].join('\n'), async (cwd) => {
            const writes: string[] = [];
            const program = createProgram({
                cwd,
                env: { HYBRID_API_KEY: 'test-key' },
                fetcher: vi.fn().mockResolvedValue({ ok: true, status: 200 }),
                stdout: (line) => writes.push(line),
            });

            await program.parseAsync(['doctor', '--yes'], { from: 'user' });
            expect(writes.join('\n')).toContain('Installing missing dependencies');
            expect(execFileSync).toHaveBeenCalledWith('docker', ['pull', 'ghcr.io/abhigyanpatwari/gitnexus:1.6.4'], expect.any(Object));
        });
    });

    it('runs install helper when --install-missing is confirmed', async () => {
        let gitnexusReady = false;
        vi.mocked(execFileSync).mockImplementation((cmd: string, args?: readonly string[]) => {
            if (cmd === 'npm') {
                gitnexusReady = true;
                return '';
            }
            if (cmd === 'docker') return '27.0.0\n';
            if (args?.includes('gitnexus') && !gitnexusReady) {
                throw new Error('missing');
            }
            return 'Python 3.11.8\n';
        });

        await withProjectConfig(['server: http://localhost:3000', 'project: demo', 'index_mode: local'].join('\n'), async (cwd) => {
            const writes: string[] = [];
            const program = createProgram({
                cwd,
                env: { HYBRID_API_KEY: 'test-key' },
                fetcher: vi.fn().mockResolvedValue({ ok: true, status: 200 }),
                stdout: (line) => writes.push(line),
                prompts: {
                    input: vi.fn(),
                    confirm: vi.fn().mockResolvedValue(true),
                },
            });

            await program.parseAsync(['doctor', '--install-missing'], {
                from: 'user',
            });
            expect(writes.join('\n')).toContain('Installing missing dependencies');
            expect(execFileSync).toHaveBeenCalledWith('npm', ['install', '-g', 'gitnexus@1.6.4'], expect.any(Object));
        });
    });
});
