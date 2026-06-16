import type { AgentToolOption } from '@/core/agent/tools.js';

export interface InitCommandOptions {
    yes?: boolean;
    step?: string;
    skip?: string;
}

export interface ToolsStepResult {
    selectedTools: AgentToolOption[];
}

export interface PackageManifest {
    name: string;
    description?: string;
    scope?: 'global' | 'local';
}

export interface PackagesStepResult {
    installedPackages: string[];
}

export interface SkillsStepResult {
    installedSkills: string[];
}

export interface InitCommandRequest {
    command: import('commander').Command;
    json?: boolean;
    options: InitCommandOptions;
}

export interface InitCommandResponse {
    toolsStep?: ToolsStepResult;
    packagesStep?: PackagesStepResult;
    skillsStep?: SkillsStepResult;
}
