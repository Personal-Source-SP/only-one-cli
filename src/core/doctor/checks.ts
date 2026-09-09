import yaml from 'js-yaml';
import { execFileSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { Fetcher } from '@/core/client/index.js';
import {
    hasLocalConfig,
    loadConfig,
    localConfigDisplayPath,
    resolveIndexMode,
    type OnlyOneConfig,
    type IndexModeSource,
} from '@/core/config/index.js';
import { HYBRID_API_KEY_ENV, formatApiKeyConfigHint } from '@/core/runtime/credentials.js';
import { resolveLocalConfigPathForProject } from '@/core/prebuilt/index-output.js';
import type { DoctorMode } from './types.js';
import { getDockerServerVersion, isDockerDaemonRunning } from '@/core/indexing/docker-runtime.js';

export interface RunIndexingChecksOptions {
    autoStartContainers?: boolean;
}

export type ReadinessStatus = 'READY' | 'MISSING' | 'NOT_INITIALIZED';

export interface CheckResult {
    category?: string;
    name: string;
    ok: boolean;
    detail: string;
    required: boolean;
    remediation?: string;
}

export interface DoctorReport {
    status: ReadinessStatus;
    mode: DoctorMode;
    modeSource: IndexModeSource;
    checks: CheckResult[];
    missing: string[];
    remediation: string[];
}

export async function checkGit(): Promise<CheckResult> {
    try {
        const version = execFileSync('git', ['--version'], {
            encoding: 'utf-8',
        }).trim();
        const ver = version.replace(/^git version\s*/, '');
        return { name: 'git', ok: true, detail: ver, required: true };
    } catch {
        return { name: 'git', ok: false, detail: 'not found', required: true };
    }
}

export async function checkNode(): Promise<CheckResult> {
    const version = process.version;
    const major = parseInt(version.slice(1), 10);
    return {
        name: 'node',
        ok: major >= 18,
        detail: version,
        required: true,
    };
}

export function checkHybridApiKey(): CheckResult {
    return {
        name: 'api_key',
        ok: true,
        detail: `constant (${maskApiKey(HYBRID_API_KEY_ENV)})`,
        required: true,
    };
}

export async function checkServer(serverUrl: string, fetcher: Fetcher, options: { apiKey?: string } = {}): Promise<CheckResult> {
    const apiKey = options.apiKey ?? HYBRID_API_KEY_ENV;

    try {
        const headers: Record<string, string> = {
            Authorization: `Bearer ${apiKey}`,
        };

        const response = await fetcher(`${serverUrl}/api/v1/projects?status=all`, {
            method: 'GET',
            headers,
            signal: AbortSignal.timeout(5000),
        });

        if (response.ok) {
            return {
                name: `server ${serverUrl}`,
                ok: true,
                detail: `status ${response.status}`,
                required: true,
            };
        }

        if (response.status === 401) {
            return {
                name: `server ${serverUrl}`,
                ok: false,
                detail: options.apiKey ? 'status 401 (invalid API key)' : 'status 401 (missing API key)',
                required: true,
                remediation: `Verify ${formatApiKeyConfigHint()}`,
            };
        }

        if (response.status === 403) {
            return {
                name: `server ${serverUrl}`,
                ok: false,
                detail: 'status 403 (forbidden)',
                required: true,
                remediation: 'Ensure the API key has access to this server',
            };
        }

        return {
            name: `server ${serverUrl}`,
            ok: false,
            detail: `status ${response.status}`,
            required: true,
        };
    } catch {
        return {
            name: `server ${serverUrl}`,
            ok: false,
            detail: 'unreachable',
            required: true,
            remediation: 'Check server URL in .onlyonecli.yml and that the backend is running',
        };
    }
}

async function fileExists(path: string): Promise<boolean> {
    try {
        await access(path);
        return true;
    } catch {
        return false;
    }
}

export async function checkLocalConfig(cwd: string): Promise<CheckResult> {
    const path = resolveLocalConfigPathForProject(cwd);
    if (!path) {
        return {
            name: 'local config',
            ok: true,
            detail: 'not found (optional)',
            required: false,
        };
    }
    try {
        const raw = await readFile(path, 'utf-8');
        yaml.load(raw);
        return { name: 'local config', ok: true, detail: 'valid', required: true };
    } catch (err: any) {
        return {
            name: 'local config',
            ok: false,
            detail: `parse error: ${err.message}`,
            required: true,
        };
    }
}

export async function checkGlobalConfig(): Promise<CheckResult> {
    const path = join(homedir(), '.onlyonecli', 'config.yaml');
    if (!(await fileExists(path))) {
        return {
            name: 'global config',
            ok: true,
            detail: 'not found (optional)',
            required: false,
        };
    }
    try {
        const raw = await readFile(path, 'utf-8');
        yaml.load(raw);
        return { name: 'global config', ok: true, detail: 'valid', required: true };
    } catch (err: any) {
        return {
            name: 'global config',
            ok: false,
            detail: `parse error: ${err.message}`,
            required: true,
        };
    }
}

function maskApiKey(key: string): string {
    if (key.length <= 4) {
        return '****';
    }
    return `${key.slice(0, 2)}...${key.slice(-2)}`;
}

/** Validates project settings in `.onlyonecli.yml` (not credentials — use `checkHybridApiKey`). */
export function checkYamlConfig(config: OnlyOneConfig): CheckResult[] {
    const checks: CheckResult[] = [
        {
            name: 'server',
            ok: Boolean(config.server),
            detail: config.server ?? 'missing in .onlyonecli.yml',
            required: true,
            remediation: 'Set server in .onlyonecli.yml',
        },
        {
            name: 'project',
            ok: Boolean(config.project),
            detail: config.project ?? 'missing in .onlyonecli.yml',
            required: false,
        },
        {
            name: 'index_mode',
            ok: config.index_mode === 'docker' || config.index_mode === 'local',
            detail: config.index_mode ?? 'default: local',
            required: false,
        },
    ];

    return checks;
}

export async function checkDocker(mode: DoctorMode): Promise<CheckResult> {
    if (!isDockerDaemonRunning()) {
        return {
            name: 'docker',
            ok: false,
            detail: 'daemon not running',
            required: mode === 'docker',
            remediation: 'Start Docker Desktop or the Docker daemon, then re-run only-one doctor',
        };
    }

    const version = getDockerServerVersion();
    return {
        name: 'docker',
        ok: true,
        detail: version ? `running (${version})` : 'running',
        required: mode === 'docker',
    };
}

export async function runIndexingChecks(mode: DoctorMode, _options: RunIndexingChecksOptions = {}): Promise<CheckResult[]> {
    return Promise.all([checkDocker(mode)]);
}

export async function assertIndexingReadiness(cwd: string, modeOverride?: string): Promise<DoctorReport> {
    if (!(await hasLocalConfig(cwd))) {
        throw new Error('Project not initialized. Run only-one init before indexing.');
    }

    const config = await loadConfig(cwd);
    const { mode, source } = resolveIndexMode(config, modeOverride);
    const checks = await runIndexingChecks(mode, { autoStartContainers: true });
    const report = buildDoctorReport(mode, source, checks);

    if (report.status !== 'READY') {
        const remediation = report.remediation.length
            ? `\nRemediation:\n${report.remediation.map((step) => `  - ${step}`).join('\n')}`
            : '';
        throw new Error(`Indexing prerequisites are not ready (status: ${report.status}). Run only-one doctor.${remediation}`);
    }

    return report;
}

export function buildNotInitializedReport(mode: DoctorMode, modeSource: IndexModeSource): DoctorReport {
    return {
        status: 'NOT_INITIALIZED',
        mode,
        modeSource,
        checks: [],
        missing: [localConfigDisplayPath()],
        remediation: ['Run only-one init to create project configuration'],
    };
}

export function buildDoctorReport(mode: DoctorMode, modeSource: IndexModeSource, indexingChecks: CheckResult[]): DoctorReport {
    const missing = indexingChecks.filter((check) => !check.ok && check.required).map((check) => check.name);
    const remediation = [
        ...new Set(
            indexingChecks.filter((check) => !check.ok && check.required && check.remediation).map((check) => check.remediation as string),
        ),
    ];

    return {
        status: missing.length ? 'MISSING' : 'READY',
        mode,
        modeSource,
        checks: indexingChecks,
        missing,
        remediation,
    };
}

export interface SampleCommand {
    command: string;
    description: string;
}

export interface SampleCommandsContext {
    project?: string;
}

export function buildSampleCommands(status: ReadinessStatus, _config: SampleCommandsContext = {}): SampleCommand[] {
    if (status === 'NOT_INITIALIZED') {
        return [
            {
                command: 'only-one init',
                description: `Create ${localConfigDisplayPath()} for this project`,
            },
        ];
    }

    if (status === 'MISSING') {
        return [
            {
                command: 'only-one doctor --install-missing',
                description: 'Install missing dependencies',
            },
            {
                command: 'only-one doctor --print-install-script',
                description: 'Print manual install commands',
            },
        ];
    }

    return [
        {
            command: 'only-one structure-generate',
            description: 'Generate structural blueprint and supported agent workflow artifacts',
        },
        {
            command: 'only-one setting-vs --editors antigravity,cursor',
            description: 'Merge shared editor settings from assets/vs',
        },
        {
            command: 'only-one extensions-vs --editors antigravity,cursor',
            description: 'Install missing editor extensions from assets/vs',
        },
    ];
}

export async function checkSkillsFreshness(projectDir: string = process.cwd()): Promise<CheckResult> {
    try {
        const { checkAllSkillsFreshness } = await import('@/core/skill/remote/inspector.js');
        const reports = await checkAllSkillsFreshness(projectDir);
        const outdated = reports.filter((r) => r.state === 'update-available');

        if (outdated.length > 0) {
            return {
                name: 'skills-freshness',
                ok: true,
                detail: `${outdated.length} skill(s) have updates available (${outdated.map((s) => s.skillName).join(', ')})`,
                required: false,
                remediation: `Run 'only-one skill update' to update skills to latest upstream versions`,
            };
        }
        return {
            name: 'skills-freshness',
            ok: true,
            detail: 'All installed skills are up-to-date',
            required: false,
        };
    } catch {
        return {
            name: 'skills-freshness',
            ok: true,
            detail: 'Skipped skill freshness check (offline or no lockfile)',
            required: false,
        };
    }
}
