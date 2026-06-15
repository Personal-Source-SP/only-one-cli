import { confirm as confirmPrompt, input as inputPrompt, select as selectPrompt } from '@inquirer/prompts';
import type { Command } from 'commander';
import type { ProgramDeps } from '../../cli/deps.js';
import { formatAgentSkillSetupError, getAgentToolDisplayName, promptAgentSkillSetup } from '../agent/prompt-setup.js';
import type { PerToolInstallResult } from '../agent/install.js';
import {
    hasLocalConfig,
    localConfigDisplayPath,
    parseIndexMode,
    persistConfigAgentTools,
    writeConfig,
    type HybridIndexConfig,
    type IndexMode,
} from '../config/index.js';
import { printJson } from '../output/index.js';
import { readCliVersion } from '../runtime/read-cli-version.js';
import { assertProjectDirectory, clientFor, globalsFor, inferName, resolveProjectDir } from '../runtime/globals.js';
import { scaffoldStructureOutput } from '../structure/scaffold.js';
import { ignoreInGitignore, HYBRID_INDEX_DIR } from '../prebuilt/index-output.js';
import { resolveGitProjectName } from '../../utils/git-project-name.js';
import { syncBackendProjectOnInit } from '../runtime/project-identity.js';
import type { AgentArtifactSummary } from '../agent/types.js';
import type { InitCommandRequest, InitCommandResponse } from './types.js';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const getGitRemoteUrl = async (cwd: string): Promise<string | null> => {
    try {
        const { stdout } = await execFileAsync('git', ['config', '--get', 'remote.origin.url'], {
            cwd,
            timeout: 5000,
        });
        return stdout.trim() || null;
    } catch {
        return null;
    }
};

const convertToHttpsUrl = (url: string): string => {
    const trimmed = url.trim();
    const scpMatch = trimmed.match(/^[^@]+@[^:]+:(.+)$/);
    if (scpMatch?.[1]) {
        const cleanPath = scpMatch[1]
            .replace(/\.git$/i, '')
            .replace(/^\/+/, '')
            .trim();
        return `https://github.com/${cleanPath}`;
    }
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed.replace(/\.git$/i, '');
    }
    return trimmed;
};

const INDEX_MODE_CHOICES: Array<{ name: string; value: IndexMode }> = [
    { value: 'local', name: 'Local — GitNexus + Python on this machine' },
    { value: 'docker', name: 'Docker — run tools inside backend container image' },
];

const resolveDefaultProjectName = async (projectDir: string): Promise<string> =>
    (await resolveGitProjectName(projectDir)) ?? inferName(projectDir);

const summarizeArtifacts = (tools: PerToolInstallResult[]): AgentArtifactSummary[] =>
    tools.map((entry) => ({
        commandInstalled: entry.command?.installed ?? false,
        commandOverwritten: entry.command?.overwritten ?? false,
        commandPath: entry.command?.path ?? null,
        commandSkipped: entry.commandSkipped,
        invokeLabel: entry.invokeLabel,
        skillInstalled: entry.skill.installed,
        skillOverwritten: entry.skill.overwritten,
        skillPath: entry.skill.path,
        toolId: entry.toolId,
    }));

export const executeInitCommand = async (deps: ProgramDeps, request: InitCommandRequest): Promise<InitCommandResponse | null> => {
    const projectDir = resolveProjectDir(deps, request.path);
    assertProjectDirectory(projectDir);

    const parent = request.command.parent?.opts() ?? {};
    const options = request.options;
    const prompts = deps.prompts ?? {
        input: inputPrompt,
        confirm: confirmPrompt,
        select: selectPrompt,
    };
    const defaultProjectName = await resolveDefaultProjectName(projectDir);

    let force = Boolean(options.force);
    if (!force && (await hasLocalConfig(projectDir))) {
        const overwrite = await prompts.confirm({
            default: false,
            message: `${localConfigDisplayPath()} already exists. Overwrite?`,
        });

        if (!overwrite) {
            deps.stdout('Init cancelled.');
            return null;
        }

        force = true;
    }

    const shouldPrompt = !(parent.server ?? options.server ?? options.projectName ?? options.indexMode);

    let config: HybridIndexConfig;
    let sourceUri = options.sourceUri;
    let defaultBranch = options.defaultBranch;
    let gitToken = options.gitToken;

    if (shouldPrompt) {
        config = {
            server: await prompts.input({
                message: 'Backend server URL',
                default: 'http://localhost:3000',
            }),
            project_name: await prompts.input({
                default: defaultProjectName,
                message: 'Project name (organization/repository)',
            }),
            index_mode: await (prompts.select ?? selectPrompt<IndexMode>)({
                default: 'local',
                choices: INDEX_MODE_CHOICES,
                message: 'How should indexes be built on this machine?',
            }),
            incremental: await prompts.confirm({
                default: true,
                message: 'Enable incremental indexing by default',
            }),
        };

        const remoteUrl = await getGitRemoteUrl(projectDir);
        const defaultSourceUri = remoteUrl ? convertToHttpsUrl(remoteUrl) : '';
        sourceUri = await prompts.input({
            message: 'GitHub repository URL (HTTPS format)',
            default: defaultSourceUri,
        });

        defaultBranch = await prompts.input({
            message: 'Default branch',
            default: 'main',
        });

        const isPrivate = await prompts.confirm({
            message: 'Is this repository private?',
            default: false,
        });

        if (isPrivate) {
            gitToken = await prompts.input({
                message: 'GitHub access token',
            });
        }
    } else {
        config = {
            index_mode: parseIndexMode(options.indexMode),
            project_name: options.projectName ?? defaultProjectName,
            server: parent.server ?? options.server ?? 'http://localhost:3000',
        };
    }

    const parts = (config.project_name || defaultProjectName).split('/');
    if (parts.length === 1) {
        config.organization = 'default';
        config.project = parts[0];
    } else {
        config.organization = parts[0];
        config.project = parts[1];
    }
    if (!request.json) {
        deps.stdout(`Project name: ${config.organization}/${config.project}`);
    }

    if (gitToken) {
        config.git_access_token = gitToken;
        if (shouldPrompt && !request.json) {
            deps.stdout('Token saved locally (plain text). For better security, use env var HYBRID_INDEX_GIT_TOKEN instead.');
        }
    }

    await writeConfig(config, projectDir, { force });
    const configPath = localConfigDisplayPath();

    const log = request.json ? () => undefined : deps.stdout;

    await ignoreInGitignore(projectDir, HYBRID_INDEX_DIR);

    const globals = await globalsFor(request.command, deps, projectDir);
    await syncBackendProjectOnInit({
        client: clientFor(globals, deps),
        cwd: projectDir,
        hasApiKey: Boolean(globals.key?.trim()),
        organization: config.organization!,
        project: config.project!,
        projectName: config.project_name ?? `${config.organization}/${config.project}`,
        sourceUri: sourceUri || undefined,
        defaultBranch: defaultBranch || undefined,
        stdout: log,
    });

    const scaffold = await scaffoldStructureOutput(projectDir);
    const installSkill = options.installSkill !== false;

    let agentTools: string[] = [];
    let agentArtifacts: AgentArtifactSummary[] | undefined;
    let installResult;

    if (installSkill) {
        try {
            const setup = await promptAgentSkillSetup(deps, {
                force: Boolean(options.force),
                projectDir,
                skipOptInConfirm: options.tools !== undefined,
                toolsArg: options.tools,
            });
            agentTools = setup.tools;
            if (setup.artifacts) {
                installResult = setup.artifacts;
                agentArtifacts = summarizeArtifacts(setup.artifacts.tools);
            }
            await persistConfigAgentTools(projectDir, agentTools);
            config.agent_tools = agentTools;
        } catch (error) {
            throw new Error(formatAgentSkillSetupError(error));
        }
    }

    return {
        agentArtifacts,
        agentTools,
        config,
        configPath,
        installResult,
        installSkipped: !installSkill,
        relativeBlueprintPath: scaffold.relativeBlueprintPath,
        structural: {
            blueprintPath: scaffold.blueprintPath,
            relativeBlueprintPath: scaffold.relativeBlueprintPath,
        },
    };
};

export const printInitResult = (deps: ProgramDeps, parentJson: boolean, result: InitCommandResponse): void => {
    if (parentJson) {
        printJson(
            {
                agentArtifacts: result.agentArtifacts,
                agentTools: result.agentTools,
                config: result.config,
                path: result.configPath,
                structural: {
                    blueprintPath: result.structural?.blueprintPath,
                    installSkipped: result.installSkipped,
                    relativeBlueprintPath: result.relativeBlueprintPath,
                },
            },
            deps.stdout,
        );
        return;
    }

    deps.stdout(`Created ${result.configPath}`);
    deps.stdout(`  Structural folder: ${HYBRID_INDEX_DIR}/`);
    deps.stdout(`  Blueprint target:  ${result.relativeBlueprintPath}`);

    if (result.installSkipped) {
        deps.stdout('  Agent skills:    skipped (--no-install-skill)');
        return;
    }

    if (!result.agentTools.length) {
        deps.stdout('  Agent skills:    not installed');
        return;
    }

    for (const artifact of result.agentArtifacts ?? []) {
        const status = artifact.skillInstalled || artifact.commandInstalled ? 'installed' : 'unchanged (use init --force to refresh)';
        const skipped = artifact.commandSkipped ? ' (skill only)' : '';
        deps.stdout(`  ${getAgentToolDisplayName(artifact.toolId)}: ${status}${skipped} — ${artifact.invokeLabel}`);
    }
};
