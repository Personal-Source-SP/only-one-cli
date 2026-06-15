import type { AgentArtifactSummary } from '../../core/agent/types.js';

export type { AgentArtifactSummary };

export type StructureApplyCommandOptions = {
    yes?: boolean;
    force?: boolean;
    tools?: string;
    output?: string;
    remote?: boolean;
    status?: boolean;
    project?: string;
    installSkill?: boolean;
};

export type StructureApplyCommandJson = {
    steps: Array<{ id: string; summary: string }>;
    outputDir: string;
    cliVersion: string;
    projectDir: string;
    outputPath: string;
    blueprintFile: string;
    folderCreated: boolean;
    agentArtifacts: AgentArtifactSummary[];
    relativeOutputDir: string;
    relativeBlueprintPath: string;
    source?: string;
    blueprint?: {
        exists: boolean;
        legacyExists?: boolean;
        legacyPath?: string;
        missingSections: string[];
        path: string;
    };
    pulledFrom?: string;
};
