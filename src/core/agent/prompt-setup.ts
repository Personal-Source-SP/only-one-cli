import { confirm as confirmPrompt } from '@inquirer/prompts';
import type { ProgramDeps } from '@/cli/deps.js';
import { readCliVersion } from '@/core/runtime/read-cli-version.js';
import { searchableMultiSelect } from '@/prompts/searchable-multi-select.js';
import { detectActiveAgentToolId } from './detect-active-agent.js';
import { getAvailableTools } from './detect-tools.js';
import { installAgentArtifacts, type InstallAgentArtifactsResult } from './install.js';
import { isPromptInteractive } from './interactive.js';
import { ResolveToolsArgError, resolveToolsArg } from './resolve-tools.js';
import { getInstallableAgentTools } from './tools.js';

export type AgentSkillSetupRequest = {
    force?: boolean;
    noInstallSkill?: boolean;
    preSelectedTools?: string[];
    projectDir: string;
    skipOptInConfirm?: boolean;
    toolsArg?: string;
    skillName?: string;
    commandId?: string;
};

export type AgentSkillSetupResult = {
    artifacts?: InstallAgentArtifactsResult;
    installRan: boolean;
    tools: string[];
};

export class AgentSkillSetupError extends Error {}

const buildToolChoices = (projectDir: string, configuredToolIds: Set<string>, preSelectedTools: string[]) => {
    const detected = new Set(getAvailableTools(projectDir).map((t) => t.value));
    const activeAgentId = detectActiveAgentToolId();
    const firstTimeSelection = configuredToolIds.size === 0;
    const shouldPreselectActive = firstTimeSelection && Boolean(activeAgentId);
    const shouldPreselectDetected = firstTimeSelection && !activeAgentId;

    return getInstallableAgentTools()
        .map((tool) => {
            const configured = configuredToolIds.has(tool.value);
            const detectedOnly = detected.has(tool.value) && !configured;
            const activeSession = tool.value === activeAgentId;
            return {
                activeSession,
                configured,
                detected: detectedOnly,
                name: tool.name,
                preSelected:
                    preSelectedTools.includes(tool.value) ||
                    configured ||
                    (shouldPreselectActive && activeSession) ||
                    (shouldPreselectDetected && detectedOnly),
                value: tool.value,
            };
        })
        .sort((a, b) => {
            if (a.configured && !b.configured) {
                return -1;
            }
            if (!a.configured && b.configured) {
                return 1;
            }
            if (a.activeSession && !b.activeSession) {
                return -1;
            }
            if (!a.activeSession && b.activeSession) {
                return 1;
            }
            if (a.detected && !b.detected) {
                return -1;
            }
            if (!a.detected && b.detected) {
                return 1;
            }
            return 0;
        });
};

export const promptAgentSkillSetup = async (deps: ProgramDeps, request: AgentSkillSetupRequest): Promise<AgentSkillSetupResult> => {
    if (request.noInstallSkill) {
        return { installRan: false, tools: [] };
    }

    const resolved = resolveToolsArg(request.toolsArg);
    if (resolved.kind === 'none') {
        return { installRan: false, tools: [] };
    }

    if (resolved.kind === 'list') {
        const artifacts = await installAgentArtifacts(request.projectDir, {
            cliVersion: readCliVersion(),
            force: Boolean(request.force),
            tools: resolved.toolIds,
            skillName: request.skillName,
            commandId: request.commandId,
        });
        return { artifacts, installRan: true, tools: resolved.toolIds };
    }

    if (!isPromptInteractive(deps)) {
        throw new AgentSkillSetupError('Non-interactive mode requires --tools (e.g. --tools cursor,claude or --tools none).');
    }

    const prompts = deps.prompts ?? { confirm: confirmPrompt };
    const configuredToolIds = new Set(request.preSelectedTools ?? []);

    if (!request.skipOptInConfirm) {
        const install = await prompts.confirm({
            default: true,
            message: 'Install structure agent skills for your IDE/agent?',
        });
        if (!install) {
            return { installRan: false, tools: [] };
        }
    }

    const activeAgentId = detectActiveAgentToolId();
    if (activeAgentId && configuredToolIds.size === 0) {
        deps.stdout(`Active agent detected: ${getAgentToolDisplayName(activeAgentId)} (pre-selected).`);
    }

    const selectedTools = await searchableMultiSelect({
        choices: buildToolChoices(request.projectDir, configuredToolIds, request.preSelectedTools ?? []),
        message: `Select agents/IDEs to install structure skills (${getInstallableAgentTools().length} available)`,
        pageSize: 15,
        validate: (selected) => selected.length > 0 || 'Select at least one tool',
    });

    const artifacts = await installAgentArtifacts(request.projectDir, {
        cliVersion: readCliVersion(),
        force: Boolean(request.force),
        tools: selectedTools,
        skillName: request.skillName,
        commandId: request.commandId,
    });

    return { artifacts, installRan: true, tools: selectedTools };
};

export const formatAgentSkillSetupError = (error: unknown): string => {
    if (error instanceof ResolveToolsArgError) {
        return error.message;
    }
    if (error instanceof AgentSkillSetupError) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
};

export const getAgentToolDisplayName = (toolId: string): string =>
    getInstallableAgentTools().find((t) => t.value === toolId)?.name ?? toolId;
