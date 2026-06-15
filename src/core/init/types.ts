import type { AgentArtifactSummary } from '../agent/types.js';
import type { InstallAgentArtifactsResult } from '../agent/install.js';

export type { AgentArtifactSummary };

export interface InitCommandOptions {
    force?: boolean;
    indexMode?: string;
    installSkill?: boolean;
    projectName?: string;
    server?: string;
    tools?: string;
    sourceUri?: string;
    defaultBranch?: string;
    gitToken?: string;
}

export interface InitCommandRequest {
    command: import('commander').Command;
    json?: boolean;
    options: InitCommandOptions;
    path?: string;
}

export interface InitCommandResponse {
    agentArtifacts?: AgentArtifactSummary[];
    agentTools: string[];
    config: import('../config/index.js').HybridIndexConfig;
    configPath: string;
    installSkipped: boolean;
    relativeBlueprintPath: string;
    structural?: {
        blueprintPath: string;
        relativeBlueprintPath: string;
    };
    installResult?: InstallAgentArtifactsResult;
}
