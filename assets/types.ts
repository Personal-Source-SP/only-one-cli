import { AllowedToolId } from '../src/constants/allowed-tools.js';

export interface RuleManifest {
    id: string;
    version: string;
    description?: string;
    sourceFile: string;
    supportedTargets: AllowedToolId[];
    requiredPackages?: string[];
    requiredMcps?: string[];
    requiredSkills?: string[];
}

export type PackageInstaller =
    | {
          kind: 'npm';
          packageName: string;
          scope?: 'global' | 'local';
      }
    | {
          kind: 'skills';
          source: string;
          skillName: string;
          cliVersion: string;
      };

export interface PackageManifest {
    id: string;
    version: string;
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
    version: string;
    server: McpServerConfig;
}

export interface VsLibraryManifest {
    version: string;
    extensions: string[];
    settings: Record<string, unknown>;
}

export interface SkillManifest {
    name: string; // exact skill name, e.g. "only-one-clockify-skill"
    version: string;
    description: string;
    source?: string; // remote repository, e.g. "addyosmani/agent-skills"
    sourceType?: 'github' | 'local';
    skillPath?: string; // path in repo, e.g. "skills/performance-optimization/SKILL.md"
}

export interface WorkflowManifest {
    name: string; // exact workflow file name (without .md), e.g. "only-one-clockify"
    version: string;
    description: string;
    requiredSkills?: string[]; // skills required by this workflow
    requiredMcps?: string[]; // MCPs required by this workflow
}

export interface ConfigFileEntry {
    src: string;
    dest: string;
}

export interface ConfigManifest {
    name: string;
    version: string;
    description?: string;
    files: ConfigFileEntry[];
}

export interface ComboManifest {
    id: string;
    version: string;
    name: string;
    description?: string;
    packages?: string[];
    mcps?: string[];
    skills?: string[];
    rules?: string[];
    configs?: string[];
    workflows?: string[];
}

export interface GitAssetManifest {
    id: string;
    version: string;
    name: string;
    description: string;
    targetOs: ('win32' | 'darwin' | 'linux')[];
    files: { src: string; dest: string }[];
}


