import { AllowedToolId } from '../src/constants/allowed-tools.js';

export type TargetAction =
    | {
          type: 'command';
          executable: string;
          args?: string[];
      }
    | {
          type: 'manual';
          instruction: string;
          docUrl?: string;
      };

export interface PluginManifest {
    id: string;
    description?: string;
    supportedTargets: AllowedToolId[];
    actions: Record<AllowedToolId, TargetAction>;
}

export interface RuleManifest {
    id: string;
    description?: string;
    sourceFile: string;
    supportedTargets: AllowedToolId[];
    requiredPackages?: string[];
    requiredPlugins?: string[];
    requiredMcps?: string[];
    requiredSkills?: string[];
}

export type PackageInstaller = {
    kind: 'npm';
    packageName: string;
    scope?: 'global' | 'local';
};

export interface PackageManifest {
    id: string;
    description?: string;
    installer: PackageInstaller;
    requirements?: string[];
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
