import type { AgentArtifactSummary } from '@/core/agent/types.js';

export type { AgentArtifactSummary };

export type StructureGenerateCommandOptions = {
    force?: boolean;
    installSkill?: boolean;
    output?: string;
    status?: boolean;
    tools?: string;
};

export type StructureGenerateCommandJson = {
    agentArtifacts: AgentArtifactSummary[];
    blueprint?: {
        exists: boolean;
        legacyExists?: boolean;
        legacyPath?: string;
        missingSections: string[];
        path: string;
    };
    blueprintFile: string;
    cliVersion: string;
    folderCreated: boolean;
    outputDir: string;
    outputPath: string;
    projectDir: string;
    relativeBlueprintPath: string;
    relativeOutputDir: string;
    steps: Array<{ id: string; summary: string }>;
};
