import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:child_process', () => ({
    execFileSync: vi.fn(),
}));

import { execFileSync } from 'node:child_process';
import {
    buildDoctorReport,
    buildSampleCommands,
    checkCocoindex,
    checkDocker,
    checkGit,
    checkGitnexus,
    checkHybridApiKey,
    checkGlobalConfig,
    checkLocalConfig,
    checkNode,
    checkServer,
    checkYamlConfig,
    runIndexingChecks,
} from '@src/core/doctor/checks.js';
import { buildInstallScript, installMissingDependencies, missingIndexingDependencies } from '@src/core/doctor/install.js';

describe('indexing doctor checks', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('checkDocker', () => {
        it('returns ok when docker daemon responds', async () => {
            vi.mocked(execFileSync).mockImplementation((cmd: string, args?: readonly string[]) => {
                if (cmd === 'docker' && args?.[0] === 'info') return '27.0.3\n';
                if (cmd === 'docker' && args?.[0] === 'version') return '27.0.3\n';
                throw new Error('unexpected');
            });
            const result = await checkDocker('docker');
            expect(result.ok).toBe(true);
            expect(result.detail).toContain('27.0.3');
            expect(result.required).toBe(true);
        });

        it('returns failure when docker daemon is unavailable', async () => {
            vi.mocked(execFileSync).mockImplementation(() => {
                throw new Error('Cannot connect to the Docker daemon');
            });
            const result = await checkDocker('docker');
            expect(result.ok).toBe(false);
            expect(result.detail).toBe('daemon not running');
            expect(result.remediation).toContain('Docker');
        });

        it('is optional in local mode', async () => {
            vi.mocked(execFileSync).mockImplementation(() => {
                throw new Error('Cannot connect to the Docker daemon');
            });
            const result = await checkDocker('local');
            expect(result.ok).toBe(false);
            expect(result.required).toBe(false);
        });
    });

    describe('checkGitnexus', () => {
        it('returns ok in local mode when gitnexus is available', async () => {
            vi.mocked(execFileSync).mockReturnValue('1.6.4\n');
            const result = await checkGitnexus('local');
            expect(result.ok).toBe(true);
            expect(result.detail).toBe('1.6.4');
        });

        it('returns failure in local mode when gitnexus is missing', async () => {
            vi.mocked(execFileSync).mockImplementation(() => {
                throw new Error('ENOENT');
            });
            const result = await checkGitnexus('local');
            expect(result.ok).toBe(false);
            expect(result.remediation).toContain('npm install -g gitnexus');
        });

        it('returns ok in docker mode when image exists and container is running', async () => {
            vi.mocked(execFileSync).mockImplementation((cmd: string, args?: readonly string[]) => {
                if (cmd !== 'docker') throw new Error('unexpected');
                if (args?.[0] === 'image' && args?.[1] === 'inspect') return '';
                if (args?.[0] === 'inspect' && args?.[2] === '{{.State.Running}}') return 'true\n';
                if (args?.[0] === 'exec') return '1.6.4\n';
                throw new Error(`unexpected docker args: ${args?.join(' ')}`);
            });
            const result = await checkGitnexus('docker');
            expect(result.ok).toBe(true);
            expect(result.detail).toContain('only-one-gitnexus');
        });

        it('auto-starts gitnexus container when image exists but container is stopped', async () => {
            let running = false;
            vi.mocked(execFileSync).mockImplementation((cmd: string, args?: readonly string[]) => {
                if (cmd !== 'docker') throw new Error('unexpected');
                if (args?.[0] === 'image' && args?.[1] === 'inspect') return '';
                if (args?.[0] === 'inspect' && args?.[2] === '{{.State.Running}}') {
                    return running ? 'true\n' : 'false\n';
                }
                if (args?.[0] === 'start') {
                    running = true;
                    return '';
                }
                if (args?.[0] === 'exec') return '1.6.4\n';
                throw new Error(`unexpected docker args: ${args?.join(' ')}`);
            });
            const result = await checkGitnexus('docker');
            expect(result.ok).toBe(true);
            expect(execFileSync).toHaveBeenCalledWith('docker', ['start', 'only-one-gitnexus'], expect.any(Object));
        });
    });

    describe('checkCocoindex', () => {
        it('returns ok in local mode when python and script are available', async () => {
            vi.mocked(execFileSync).mockReturnValue('Python 3.11.8\n');
            const result = await checkCocoindex('local');
            expect(result.ok).toBe(true);
            expect(result.detail).toContain('Python 3.11.8');
        });

        it('returns failure in local mode when python is missing', async () => {
            vi.mocked(execFileSync).mockImplementation(() => {
                throw new Error('python3 not found');
            });
            const result = await checkCocoindex('local');
            expect(result.ok).toBe(false);
            expect(result.detail).toBe('python3 not found');
        });

        it('returns ok in docker mode when image exists and container is running', async () => {
            vi.mocked(execFileSync).mockImplementation((cmd: string, args?: readonly string[]) => {
                if (cmd !== 'docker') throw new Error('unexpected');
                if (args?.[0] === 'image' && args?.[1] === 'inspect') return '';
                if (args?.[0] === 'inspect' && args?.[2] === '{{.State.Running}}') return 'true\n';
                if (args?.[0] === 'exec') return 'Usage: ccc\n';
                throw new Error(`unexpected docker args: ${args?.join(' ')}`);
            });
            const result = await checkCocoindex('docker');
            expect(result.ok).toBe(true);
            expect(result.detail).toContain('only-one-cocoindex');
        });
    });

    describe('buildDoctorReport', () => {
        it('returns READY when all required indexing checks pass', () => {
            const report = buildDoctorReport('local', 'config', [
                { name: 'docker', ok: false, detail: 'optional', required: false },
                { name: 'gitnexus', ok: true, detail: '1.6.4', required: true },
                { name: 'cocoindex', ok: true, detail: 'ready', required: true },
            ]);
            expect(report.status).toBe('READY');
            expect(report.modeSource).toBe('config');
            expect(report.missing).toEqual([]);
        });

        it('returns MISSING with remediation when required checks fail', () => {
            const report = buildDoctorReport('local', 'cli', [
                {
                    name: 'gitnexus',
                    ok: false,
                    detail: 'not found',
                    required: true,
                    remediation: 'Install GitNexus',
                },
                { name: 'cocoindex', ok: true, detail: 'ready', required: true },
            ]);
            expect(report.status).toBe('MISSING');
            expect(report.modeSource).toBe('cli');
            expect(report.missing).toEqual(['gitnexus']);
            expect(report.remediation).toEqual(['Install GitNexus']);
        });
    });

    describe('runIndexingChecks', () => {
        it('runs docker, gitnexus, and cocoindex checks for local mode', async () => {
            vi.mocked(execFileSync).mockImplementation((cmd: string, args?: readonly string[]) => {
                if (cmd === 'docker') throw new Error('no docker');
                if (args?.includes('--version')) return '1.0.0\n';
                if (args?.includes('gitnexus')) return '1.6.4\n';
                return 'Python 3.11.8\n';
            });

            const checks = await runIndexingChecks('local');
            expect(checks).toHaveLength(3);
            expect(checks.map((check) => check.name)).toEqual(['docker', 'gitnexus', 'cocoindex']);
        });
    });
});

describe('doctor install helpers', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('buildInstallScript', () => {
        it('prints local install commands for missing gitnexus and cocoindex', () => {
            const script = buildInstallScript({ mode: 'local', missing: ['gitnexus', 'cocoindex'] });
            expect(script).toContain('npm install -g gitnexus@1.6.4');
            expect(script).toContain('pip3 install cocoindex');
        });

        it('prints docker pull commands for official publisher images', () => {
            const script = buildInstallScript({ mode: 'docker', missing: ['gitnexus', 'cocoindex'] });
            expect(script).toContain('docker pull ghcr.io/abhigyanpatwari/gitnexus:1.6.4');
            expect(script).toContain('docker pull cocoindex/cocoindex-code:latest');
        });

        it('includes docker install guidance when docker is missing', () => {
            const script = buildInstallScript({ mode: 'local', missing: ['docker'] });
            expect(script).toContain('docs.docker.com/get-docker');
        });
    });

    describe('installMissingDependencies', () => {
        it('skips install when user declines confirmation', async () => {
            const results = await installMissingDependencies({
                mode: 'local',
                missing: ['gitnexus'],
                options: { confirm: async () => false },
            });
            expect(results).toEqual([{ dependency: 'gitnexus', ok: false, detail: 'skipped by user' }]);
            expect(execFileSync).not.toHaveBeenCalled();
        });

        it('installs gitnexus locally when confirmed', async () => {
            vi.mocked(execFileSync).mockReturnValue('');
            const results = await installMissingDependencies({
                mode: 'local',
                missing: ['gitnexus'],
                options: { confirm: async () => true },
            });
            expect(results).toEqual([
                {
                    dependency: 'gitnexus',
                    ok: true,
                    detail: 'installed globally via npm',
                },
            ]);
            expect(execFileSync).toHaveBeenCalledWith('npm', ['install', '-g', 'gitnexus@1.6.4'], expect.any(Object));
        });

        it('pulls images and starts containers in docker mode when confirmed', async () => {
            vi.mocked(execFileSync).mockImplementation((cmd: string, args?: readonly string[]) => {
                if (cmd === 'docker' && args?.[0] === 'inspect' && args?.[2] === '{{.State.Running}}') {
                    throw new Error('missing');
                }
                return '';
            });
            const results = await installMissingDependencies({
                mode: 'docker',
                missing: ['gitnexus', 'cocoindex'],
                options: { skipConfirm: true },
            });
            expect(results).toHaveLength(2);
            expect(results.every((result) => result.ok)).toBe(true);
            expect(execFileSync).toHaveBeenCalledWith('docker', ['pull', 'ghcr.io/abhigyanpatwari/gitnexus:1.6.4'], expect.any(Object));
            expect(execFileSync).toHaveBeenCalledWith('docker', ['pull', 'cocoindex/cocoindex-code:latest'], expect.any(Object));
            expect(execFileSync).toHaveBeenCalledWith(
                'docker',
                ['run', '-d', '--name', 'only-one-gitnexus', '--restart', 'unless-stopped', 'ghcr.io/abhigyanpatwari/gitnexus:1.6.4'],
                expect.any(Object),
            );
        });
    });

    describe('missingIndexingDependencies', () => {
        it('returns only required failed checks', () => {
            const missing = missingIndexingDependencies([
                { name: 'docker', ok: false, detail: 'down', required: false },
                { name: 'gitnexus', ok: false, detail: 'missing', required: true },
            ]);
            expect(missing).toEqual(['gitnexus']);
        });
    });
});

describe('doctor checks (existing)', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('checkGit', () => {
        it('returns ok with version when git is found', async () => {
            vi.mocked(execFileSync).mockReturnValue('git version 2.43.0\n');
            const result = await checkGit();
            expect(result.ok).toBe(true);
            expect(result.detail).toBe('2.43.0');
        });

        it('returns failure when git is not found', async () => {
            vi.mocked(execFileSync).mockImplementation(() => {
                throw new Error('ENOENT');
            });
            const result = await checkGit();
            expect(result.ok).toBe(false);
            expect(result.detail).toBe('not found');
        });
    });

    describe('checkNode', () => {
        it('returns ok for node >= 18', async () => {
            const result = await checkNode();
            expect(result.ok).toBe(true);
        });
    });

    describe('checkServer', () => {
        it('returns ok when server responds 200', async () => {
            const fetcher = vi.fn().mockResolvedValue({ ok: true, status: 200 });
            const result = await checkServer('http://localhost:3000', fetcher as any, { apiKey: 'secret' });
            expect(result.ok).toBe(true);
            expect(result.detail).toBe('status 200');
        });

        it('probes server with built-in api key when none passed', async () => {
            const fetcher = vi.fn().mockResolvedValue({ ok: true, status: 200 });
            const result = await checkServer('http://localhost:3000', fetcher as any);
            expect(result.ok).toBe(true);
            expect(fetcher).toHaveBeenCalledWith(
                'http://localhost:3000/api/v1/projects?status=all',
                expect.objectContaining({
                    headers: { Authorization: 'Bearer dev-api-key' },
                }),
            );
        });

        it('returns ok on 200 when API key is sent', async () => {
            const fetcher = vi.fn().mockResolvedValue({ ok: true, status: 200 });
            const result = await checkServer('http://localhost:3000', fetcher as any, {
                apiKey: 'secret',
            });
            expect(result.ok).toBe(true);
            expect(fetcher).toHaveBeenCalledWith(
                'http://localhost:3000/api/v1/projects?status=all',
                expect.objectContaining({
                    headers: { Authorization: 'Bearer secret' },
                }),
            );
        });

        it('returns failure when server is unreachable', async () => {
            const fetcher = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));
            const result = await checkServer('http://localhost:3000', fetcher as any, { apiKey: 'secret' });
            expect(result.ok).toBe(false);
            expect(result.detail).toBe('unreachable');
        });
    });

    describe('buildSampleCommands', () => {
        it('returns init command when project is not initialized', () => {
            const commands = buildSampleCommands('NOT_INITIALIZED');
            expect(commands).toEqual([
                {
                    command: 'only-one init',
                    description: 'Create .only-one/.onlyonecli.yml for this project',
                },
            ]);
        });

        it('returns install commands when dependencies are missing', () => {
            const commands = buildSampleCommands('MISSING');
            expect(commands.map((item) => item.command)).toEqual(['only-one doctor --yes', 'only-one doctor --print-install-script']);
        });

        it('returns index lifecycle commands when ready', () => {
            const commands = buildSampleCommands('READY');
            expect(commands.map((item) => item.command)).toEqual([
                'only-one structure-generate',
                'only-one setting-vs --editors antigravity,cursor',
                'only-one extensions-vs --editors antigravity,cursor',
            ]);
            expect(commands[0].description).toContain('structural blueprint');
            expect(commands[1].description).toContain('settings');
        });
    });

    describe('checkYamlConfig', () => {
        it('validates yaml fields only (no credential keys)', () => {
            const checks = checkYamlConfig({
                server: 'http://localhost:3000',
                project: 'demo',
                index_mode: 'docker',
            });
            expect(checks.find((check) => check.name === 'api_key')).toBeUndefined();
            expect(checks.find((check) => check.name === 'server')?.detail).toBe('http://localhost:3000');
            expect(checks.every((check) => (check.required ? check.ok : true))).toBe(true);
        });
    });

    describe('checkHybridApiKey', () => {
        it('always passes with built-in constant', () => {
            const result = checkHybridApiKey();
            expect(result.ok).toBe(true);
            expect(result.name).toBe('api_key');
            expect(result.detail).toContain('constant');
        });
    });

    describe('config checks', () => {
        it('returns ok if local config not found', async () => {
            const result = await checkLocalConfig('/nonexistent-dir');
            expect(result.ok).toBe(true);
            expect(result.detail).toBe('not found (optional)');
        });

        it('returns ok if global config not found', async () => {
            const result = await checkGlobalConfig();
            expect(result.ok).toBe(true);
            expect(result.detail).toBe('not found (optional)');
        });
    });
});
