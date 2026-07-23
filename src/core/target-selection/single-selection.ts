import type { PromptDeps } from '@/cli/deps.js';
import type { TargetChoice } from './selection.js';
import {
    getAllowedAgentTargets,
    getAllowedMcpTargets,
    getAllowedRuleTargets,
    getAllowedVsExtensionsTargets,
    getAllowedVsSettingsTargets,
    type AllowedTarget,
} from './catalog.js';
import type { AgentToolOption } from '@/core/agent/tools.js';
import type { McpIdeAdapter } from '@/core/mcp/types.js';
import type { VsEditorDescriptor } from '@/core/vs/types.js';

export type SingleTargetSelectionRequest = {
    automatic: boolean;
    explicit?: string;
    message: string;
    prompts?: Pick<PromptDeps, 'select' | 'checkbox'>;
};

const parseCsv = (value: string): string[] => [
    ...new Set(
        value
            .split(',')
            .map((entry) => entry.trim().toLowerCase())
            .filter(Boolean),
    ),
];

const getValidIds = <T extends string>(choices: readonly TargetChoice<T>[]): string => choices.map((choice) => choice.value).join(', ');

export const selectSingleTarget = async <T extends string>(
    choices: readonly TargetChoice<T>[],
    request: SingleTargetSelectionRequest,
): Promise<T> => {
    if (!choices.length) throw new Error('No supported targets are available');

    const { explicit, automatic, prompts, message } = request;

    if (explicit?.trim()) {
        const values = parseCsv(explicit);
        const targetId = values.includes('all') ? choices[0].value : values[0];
        const validChoice = choices.find((c) => c.value === targetId);
        if (!validChoice) {
            throw new Error(`Unsupported target '${targetId}'. Valid targets: ${getValidIds(choices)}`);
        }
        return validChoice.value;
    }

    if (automatic) {
        return choices[0].value;
    }

    if (prompts?.select) {
        return await prompts.select({
            message,
            choices: choices.map((c) => ({ name: c.name, value: c.value })),
        });
    }

    if (prompts?.checkbox) {
        const selected = await prompts.checkbox({
            message,
            choices: choices.map((c) => ({ name: c.name, value: c.value })),
        });
        if (!selected || !selected.length) {
            throw new Error('Select at least one target');
        }
        return selected[0];
    }

    throw new Error(
        `Target selection is required in non-interactive mode. Specify target using options. Valid targets: ${getValidIds(choices)}`,
    );
};

const toChoices = (targets: readonly AllowedTarget[]): TargetChoice<string>[] =>
    targets.map((target) => ({ name: target.agent?.name ?? target.mcp?.name ?? target.vs?.name ?? target.id, value: target.id }));

export const selectSingleAllowedTarget = async (
    targets: readonly AllowedTarget[],
    request: SingleTargetSelectionRequest,
): Promise<AllowedTarget> => {
    const id = await selectSingleTarget(toChoices(targets), request);
    const target = targets.find((entry) => entry.id === id);
    if (!target) throw new Error(`Unsupported target '${id}'`);
    return target;
};

export const selectSingleAllowedAgentTarget = async (request: SingleTargetSelectionRequest): Promise<AgentToolOption> => {
    const target = await selectSingleAllowedTarget(getAllowedAgentTargets(), request);
    if (!target.agent) throw new Error(`Missing agent backing for allowed target '${target.id}'`);
    return target.agent;
};

export const selectSingleAllowedMcpTarget = async (request: SingleTargetSelectionRequest): Promise<McpIdeAdapter> => {
    const target = await selectSingleAllowedTarget(getAllowedMcpTargets(), request);
    if (!target.mcp) throw new Error(`Missing MCP backing for allowed target '${target.id}'`);
    return target.mcp;
};

export const selectSingleAllowedRuleTarget = async (request: SingleTargetSelectionRequest): Promise<AllowedTarget> => {
    return selectSingleAllowedTarget(getAllowedRuleTargets(), request);
};

export const selectSingleAllowedVsExtensionsTarget = async (request: SingleTargetSelectionRequest): Promise<VsEditorDescriptor> => {
    const target = await selectSingleAllowedTarget(getAllowedVsExtensionsTargets(), request);
    if (!target.vs) throw new Error(`Missing VS backing for allowed target '${target.id}'`);
    return target.vs;
};

export const selectSingleAllowedVsSettingsTarget = async (request: SingleTargetSelectionRequest): Promise<VsEditorDescriptor> => {
    const target = await selectSingleAllowedTarget(getAllowedVsSettingsTargets(), request);
    if (!target.vs) throw new Error(`Missing VS backing for allowed target '${target.id}'`);
    return target.vs;
};
