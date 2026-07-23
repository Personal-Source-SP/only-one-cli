export enum AllowedToolId {
    Antigravity = 'antigravity',
    Claude = 'claude',
    Cursor = 'cursor',
    Codex = 'codex',
}

export const ALLOWED_TOOL_IDS: readonly AllowedToolId[] = [
    AllowedToolId.Antigravity,
    AllowedToolId.Claude,
    AllowedToolId.Cursor,
    AllowedToolId.Codex,
];

export enum AllowedToolCapability {
    AgentArtifacts = 'agent-artifacts',
    Mcp = 'mcp',
    Rules = 'rules',
    VsExtensions = 'vs-extensions',
    VsSettings = 'vs-settings',
}

export type AllowedTargetDescriptor = {
    capabilities: readonly AllowedToolCapability[];
    id: AllowedToolId;
};
