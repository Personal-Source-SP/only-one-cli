import type { PromptDeps } from '@/cli/deps.js';
import type { AgentToolOption } from '@/core/agent/tools.js';
import type { McpIdeAdapter } from '@/core/mcp/types.js';
import type { VsEditorDescriptor } from '@/core/vs/types.js';
import {
    getAllowedAgentTargets,
    getAllowedMcpTargets,
    getAllowedRuleTargets,
    getAllowedVsExtensionsTargets,
    getAllowedVsSettingsTargets,
    type AllowedTarget,
} from './catalog.js';
import { selectTargets, type TargetChoice } from './selection.js';

export type AllowedTargetSelectionRequest = {
    automatic: boolean;
    emptyMessage?: string;
    explicit?: string;
    message: string;
    preselected?: readonly string[];
    prompts?: Pick<PromptDeps, 'checkbox'>;
};

const toChoices = (targets: readonly AllowedTarget[]): TargetChoice<string>[] =>
    targets.map((target) => ({ name: target.agent?.name ?? target.mcp?.name ?? target.vs?.name ?? target.id, value: target.id }));

const selectAllowed = async (targets: readonly AllowedTarget[], request: AllowedTargetSelectionRequest): Promise<AllowedTarget[]> => {
    const ids = await selectTargets({ ...request, choices: toChoices(targets) });
    return ids.map((id) => {
        const target = targets.find((entry) => entry.id === id);
        if (!target) throw new Error(`Unsupported target '${id}'`);
        return target;
    });
};

export const selectAllowedAgentTargets = async (request: AllowedTargetSelectionRequest): Promise<AgentToolOption[]> => {
    const targets = await selectAllowed(getAllowedAgentTargets(), request);
    return targets.map((target) => {
        if (!target.agent) throw new Error(`Missing agent backing for allowed target '${target.id}'`);
        return target.agent;
    });
};

export const selectAllowedMcpTargets = async (request: AllowedTargetSelectionRequest): Promise<McpIdeAdapter[]> => {
    const targets = await selectAllowed(getAllowedMcpTargets(), request);
    return targets.map((target) => {
        if (!target.mcp) throw new Error(`Missing MCP backing for allowed target '${target.id}'`);
        return target.mcp;
    });
};

export const selectAllowedRuleTargets = async (request: AllowedTargetSelectionRequest): Promise<AllowedTarget[]> => {
    return selectAllowed(getAllowedRuleTargets(), request);
};

const selectAllowedVsTargets = async (
    targets: readonly AllowedTarget[],
    request: AllowedTargetSelectionRequest,
): Promise<VsEditorDescriptor[]> => {
    const selected = await selectAllowed(targets, request);
    return selected.map((target) => {
        if (!target.vs) throw new Error(`Missing VS backing for allowed target '${target.id}'`);
        return target.vs;
    });
};

export const selectAllowedVsExtensionsTargets = async (request: AllowedTargetSelectionRequest): Promise<VsEditorDescriptor[]> =>
    selectAllowedVsTargets(getAllowedVsExtensionsTargets(), request);

export const selectAllowedVsSettingsTargets = async (request: AllowedTargetSelectionRequest): Promise<VsEditorDescriptor[]> =>
    selectAllowedVsTargets(getAllowedVsSettingsTargets(), request);
