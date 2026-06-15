export type AgentArtifactSummary = {
    commandInstalled: boolean;
    commandOverwritten: boolean;
    commandPath: string | null;
    commandSkipped?: boolean;
    invokeLabel: string;
    skillInstalled: boolean;
    skillOverwritten: boolean;
    skillPath: string;
    toolId: string;
};
