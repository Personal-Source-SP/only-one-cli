import type { AgentToolOption } from '@/core/agent/tools.js';

export interface InitCommandOptions {
    yes?: boolean;
    step?: string;
    skip?: string;
    combo?: string;
    noIgnore?: boolean;
    tools?: string;
    packages?: string;
    skills?: string;
    configs?: string;
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

export interface ConfigsStepResult {
    selectedConfigs: string[];
}

export interface InitCommandRequest {
    command: import('commander').Command;
    json?: boolean;
    path?: string;
    options: InitCommandOptions;
}

export interface McpStepResult {
    selectedMcps: string[];
}

export interface InitCommandResponse {
    toolsStep?: ToolsStepResult;
    packagesStep?: PackagesStepResult;
    skillsStep?: SkillsStepResult;
    configsStep?: ConfigsStepResult;
    mcpStep?: McpStepResult;
    projectDir?: string;
}

export interface ComboManifest {
    name: string;
    description?: string;
    packages?: string[];
    skills?: string[];
    configs?: string[];
}
