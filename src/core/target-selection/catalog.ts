import { ALLOWED_TOOL_IDS, AllowedToolCapability, AllowedToolId, type AllowedTargetDescriptor } from '@/constants/index.js';
import { AI_TOOLS, type AgentToolOption } from '../agent/tools.js';
import { findMcpIdeAdapter, type McpIdeAdapter } from '../mcp/index.js';
import { findVsEditor, VsEditorId, type VsEditorDescriptor } from '../vs/index.js';

export type AllowedTarget = AllowedTargetDescriptor & {
    agent?: AgentToolOption;
    mcp?: McpIdeAdapter;
    vs?: VsEditorDescriptor;
};

const capabilities = [AllowedToolCapability.AgentArtifacts, AllowedToolCapability.Mcp] as const;
const vsCapabilities = [...capabilities, AllowedToolCapability.VsExtensions, AllowedToolCapability.VsSettings] as const;

export const ALLOWED_TARGETS: readonly AllowedTarget[] = ALLOWED_TOOL_IDS.map((id) => ({
    id,
    capabilities: id === AllowedToolId.Antigravity || id === AllowedToolId.Cursor ? vsCapabilities : capabilities,
    agent: AI_TOOLS.find((tool) => tool.value === id),
    mcp: findMcpIdeAdapter(id),
    vs: findVsEditor(id as unknown as VsEditorId),
}));

export const getAllowedTargets = (capability: AllowedToolCapability): AllowedTarget[] =>
    ALLOWED_TARGETS.filter((target) => target.capabilities.includes(capability));

export const getAllowedAgentTargets = (): AllowedTarget[] => getAllowedTargets(AllowedToolCapability.AgentArtifacts);
export const getAllowedMcpTargets = (): AllowedTarget[] => getAllowedTargets(AllowedToolCapability.Mcp);
export const getAllowedVsSettingsTargets = (): AllowedTarget[] => getAllowedTargets(AllowedToolCapability.VsSettings);
export const getAllowedVsExtensionsTargets = (): AllowedTarget[] => getAllowedTargets(AllowedToolCapability.VsExtensions);

export const assertAllowedTargetBackings = (targets: readonly AllowedTarget[] = ALLOWED_TARGETS): void => {
    for (const target of targets) {
        if (target.capabilities.includes(AllowedToolCapability.AgentArtifacts) && !target.agent) {
            throw new Error(`Missing agent backing for allowed target '${target.id}'`);
        }
        if (target.capabilities.includes(AllowedToolCapability.Mcp) && !target.mcp) {
            throw new Error(`Missing MCP backing for allowed target '${target.id}'`);
        }
        if (target.capabilities.includes(AllowedToolCapability.VsSettings) && !target.vs) {
            throw new Error(`Missing VS settings backing for allowed target '${target.id}'`);
        }
        if (target.capabilities.includes(AllowedToolCapability.VsExtensions) && !target.vs) {
            throw new Error(`Missing VS extensions backing for allowed target '${target.id}'`);
        }
    }
};
