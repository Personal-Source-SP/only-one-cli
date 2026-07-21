import type { AgentToolOption } from '@/core/agent/tools.js';

export interface PackageManifest {
    name: string;
    description?: string;
    scope?: 'global' | 'local';
}

export interface McpServerConfig {
    command: string;
    args?: string[];
    env?: Record<string, string>;
}

export interface McpManifest {
    id: string;
    server: McpServerConfig;
}

export interface VsLibraryManifest {
    extensions: string[];
    settings: Record<string, unknown>;
}

export interface SkillManifest {
    name: string; // exact skill folder name, e.g. "only-one-clockify-skill"
    description: string;
    associatedWorkflows?: string[]; // workflows that rely on this skill
}

export interface WorkflowManifest {
    name: string; // exact workflow file name (without .md), e.g. "only-one-clockify"
    description: string;
    requiredSkills: string[]; // skills required by this workflow
    requiredMcps?: string[]; // MCPs required by this workflow
}

export interface ConfigFileEntry {
    src: string;
    dest: string;
}

export interface ConfigManifest {
    name: string;
    description?: string;
    files: ConfigFileEntry[];
}

export interface ComboManifest {
    id: string;
    name: string;
    description?: string;
    packages?: string[];
    skills?: string[];
    configs?: string[];
}
