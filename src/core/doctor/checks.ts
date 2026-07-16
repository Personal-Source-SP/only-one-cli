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
import type { DoctorMode } from '@/core/indexing/tools.js';
import { resolveCocoindexImage, resolveCocoindexScript, resolveGitnexusBin, resolveGitnexusImage } from '@/core/indexing/tools.js';
import {
    COCOINDEX_CONTAINER_NAME,
    ensureCocoindexContainerRunning,
    ensureGitnexusContainerRunning,
    getContainerState,
    getDockerServerVersion,
    GITNEXUS_CONTAINER_NAME,
    hasDockerImage,
    isDockerDaemonRunning,
    verifyCocoindexInContainer,
    verifyGitnexusInContainer,
} from '@/core/indexing/docker-runtime.js';

export interface RunIndexingChecksOptions {
    autoStartContainers?: boolean;
}

export type ReadinessStatus = 'READY' | 'MISSING' | 'NOT_INITIALIZED';

export interface CheckResult {
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

export async function checkGitnexus(mode: DoctorMode, options: RunIndexingChecksOptions = {}): Promise<CheckResult> {
    if (mode === 'docker') {
        return checkGitnexusDocker(options);
    }
    return checkGitnexusLocal();
}

async function checkGitnexusLocal(): Promise<CheckResult> {
    const bin = resolveGitnexusBin();
    const args = bin === 'npx' ? ['gitnexus', '--version'] : ['--version'];

    try {
        const version = execFileSync(bin, args, {
            encoding: 'utf-8',
            stdio: 'pipe',
        }).trim();
        return {
            name: 'gitnexus',
            ok: true,
            detail: version || 'available',
            required: true,
        };
    } catch {
        return {
            name: 'gitnexus',
            ok: false,
            detail: 'not found',
            required: true,
            remediation: 'Install GitNexus CLI: npm install -g gitnexus@1.6.4',
        };
    }
}

async function checkGitnexusDocker(options: RunIndexingChecksOptions): Promise<CheckResult> {
    const image = resolveGitnexusImage();
    if (!hasDockerImage(image)) {
        return {
            name: 'gitnexus',
            ok: false,
            detail: `image not found (${image})`,
            required: true,
            remediation: `Pull GitNexus image: docker pull ${image} (or only-one doctor --install-missing)`,
        };
    }

    const containerState = getContainerState(GITNEXUS_CONTAINER_NAME);
    if (containerState !== 'running') {
        if (options.autoStartContainers !== false) {
            try {
                ensureGitnexusContainerRunning(image);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'failed to start container';
                return {
                    name: 'gitnexus',
                    ok: false,
                    detail: `container ${GITNEXUS_CONTAINER_NAME} failed to start (${message})`,
                    required: true,
                    remediation: `Start GitNexus container: docker start ${GITNEXUS_CONTAINER_NAME}`,
                };
            }
        } else {
            return {
                name: 'gitnexus',
                ok: false,
                detail:
                    containerState === 'stopped'
                        ? `container ${GITNEXUS_CONTAINER_NAME} stopped`
                        : `container ${GITNEXUS_CONTAINER_NAME} missing`,
                required: true,
                remediation: `Run only-one doctor to start ${GITNEXUS_CONTAINER_NAME}`,
            };
        }
    }

    try {
        const version = verifyGitnexusInContainer();
        return {
            name: 'gitnexus',
            ok: true,
            detail: `${version} (${GITNEXUS_CONTAINER_NAME} running)`,
            required: true,
        };
    } catch {
        return {
            name: 'gitnexus',
            ok: false,
            detail: `container ${GITNEXUS_CONTAINER_NAME} unhealthy`,
            required: true,
            remediation: `Recreate container: docker rm -f ${GITNEXUS_CONTAINER_NAME} && only-one doctor --install-missing`,
        };
    }
}

export async function checkCocoindex(mode: DoctorMode, options: RunIndexingChecksOptions = {}): Promise<CheckResult> {
    if (mode === 'docker') {
        return checkCocoindexDocker(options);
    }
    return checkCocoindexLocal();
}

async function checkCocoindexLocal(): Promise<CheckResult> {
    const script = resolveCocoindexScript();

    try {
        const python = process.env.COCOINDEX_BINARY ?? 'python3';
        if (!(await fileExists(script))) {
            return {
                name: 'cocoindex',
                ok: false,
                detail: 'index script not found',
                required: true,
                remediation: 'Reinstall only-one (includes scripts/cocoindex_documents.py) or set COCOINDEX_SCRIPT to the script path',
            };
        }

        const version = execFileSync(python, ['--version'], {
            encoding: 'utf-8',
            stdio: 'pipe',
        }).trim();
        return {
            name: 'cocoindex',
            ok: true,
            detail: `${version}; script ready`,
            required: true,
        };
    } catch {
        return {
            name: 'cocoindex',
            ok: false,
            detail: 'python3 not found',
            required: true,
            remediation: 'Install Python 3.11+ and pip3 install cocoindex',
        };
    }
}

async function checkCocoindexDocker(options: RunIndexingChecksOptions): Promise<CheckResult> {
    const image = resolveCocoindexImage();
    if (!hasDockerImage(image)) {
        return {
            name: 'cocoindex',
            ok: false,
            detail: `image not found (${image})`,
            required: true,
            remediation: `Pull CocoIndex image: docker pull ${image} (or only-one doctor --install-missing)`,
        };
    }

    const containerState = getContainerState(COCOINDEX_CONTAINER_NAME);
    if (containerState !== 'running') {
        if (options.autoStartContainers !== false) {
            try {
                ensureCocoindexContainerRunning(image);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'failed to start container';
                return {
                    name: 'cocoindex',
                    ok: false,
                    detail: `container ${COCOINDEX_CONTAINER_NAME} failed to start (${message})`,
                    required: true,
                    remediation: `Start CocoIndex container: docker start ${COCOINDEX_CONTAINER_NAME}`,
                };
            }
        } else {
            return {
                name: 'cocoindex',
                ok: false,
                detail:
                    containerState === 'stopped'
                        ? `container ${COCOINDEX_CONTAINER_NAME} stopped`
                        : `container ${COCOINDEX_CONTAINER_NAME} missing`,
                required: true,
                remediation: `Run only-one doctor to start ${COCOINDEX_CONTAINER_NAME}`,
            };
        }
    }

    try {
        verifyCocoindexInContainer();
        return {
            name: 'cocoindex',
            ok: true,
            detail: `CLI ready (${COCOINDEX_CONTAINER_NAME} running)`,
            required: true,
        };
    } catch {
        return {
            name: 'cocoindex',
            ok: false,
            detail: `container ${COCOINDEX_CONTAINER_NAME} unhealthy`,
            required: true,
            remediation: `Recreate container: docker rm -f ${COCOINDEX_CONTAINER_NAME} && only-one doctor --install-missing`,
        };
    }
}

export async function runIndexingChecks(mode: DoctorMode, options: RunIndexingChecksOptions = {}): Promise<CheckResult[]> {
    const checksOptions = { autoStartContainers: options.autoStartContainers ?? true };
    return Promise.all([checkDocker(mode), checkGitnexus(mode, checksOptions), checkCocoindex(mode, checksOptions)]);
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
                command: 'only-one doctor --yes',
                description: 'Install missing GitNexus/CocoIndex dependencies',
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
            command: 'only-one setting-vs --editors vscode,cursor,antigravity',
            description: 'Merge shared editor settings from libraries/vs',
        },
        {
            command: 'only-one extensions-vs --editors vscode,cursor,antigravity',
            description: 'Install missing editor extensions from libraries/vs',
        },
    ];
}
