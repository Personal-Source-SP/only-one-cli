import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { CommandAdapterRegistry } from '../command-generation/registry.js';
import { generateCommand, resolveCommandWritePath } from '../command-generation/generator.js';
import {
    buildStructureCommandContent,
    buildStructureSkillMarkdown,
    STRUCTURE_COMMAND_ID,
    STRUCTURE_SKILL_NAME,
} from '../templates/structure.js';
import {
    buildStructureApplyCommandContent,
    buildStructureApplySkillMarkdown,
    STRUCTURE_APPLY_COMMAND_ID,
    STRUCTURE_APPLY_SKILL_NAME,
} from '../templates/structure-apply.js';
import { getAgentToolById } from './tools.js';
import { normalizeStructureCommandPath, resolveStructureSkillPath } from './command-path.js';

export type InstallFileResult = {
    installed: boolean;
    overwritten: boolean;
    path: string;
};

export type PerToolInstallResult = {
    command: InstallFileResult | null;
    commandSkipped: boolean;
    invokeLabel: string;
    skill: InstallFileResult;
    toolId: string;
};

export type InstallAgentArtifactsResult = {
    tools: PerToolInstallResult[];
};

export type InstallAgentArtifactsOptions = {
    cliVersion: string;
    force?: boolean;
    tools: string[];
    skillName?: string;
    commandId?: string;
};

const writeTextFile = async (filePath: string, content: string, force: boolean): Promise<InstallFileResult> => {
    const existed = existsSync(filePath);

    if (existed && !force) {
        return { installed: false, overwritten: false, path: filePath };
    }

    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, content, 'utf-8');

    return { installed: true, overwritten: existed, path: filePath };
};

const installForTool = async (
    projectDir: string,
    toolId: string,
    cliVersion: string,
    force: boolean,
    skillName: string = STRUCTURE_SKILL_NAME,
    commandId: string = STRUCTURE_COMMAND_ID,
): Promise<PerToolInstallResult> => {
    const tool = getAgentToolById(toolId);
    if (!tool?.skillsDir) {
        throw new Error(`Unknown or non-installable tool '${toolId}'`);
    }

    let skillContent = '';
    let commandContent: import('../command-generation/types.js').CommandContent | null = null;

    if (skillName === STRUCTURE_APPLY_SKILL_NAME) {
        skillContent = buildStructureApplySkillMarkdown(cliVersion);
        commandContent = buildStructureApplyCommandContent();
    } else {
        skillContent = buildStructureSkillMarkdown(cliVersion);
        commandContent = buildStructureCommandContent();
    }

    const skillPath = resolveStructureSkillPath(projectDir, toolId, skillName);
    const skill = await writeTextFile(skillPath, skillContent, force);

    const commandAdapter = CommandAdapterRegistry.get(toolId);
    let command: InstallFileResult | null = null;
    let commandSkipped = false;

    if (commandAdapter && commandContent) {
        const generated = generateCommand(commandContent, commandAdapter);
        const relativePath = normalizeStructureCommandPath(generated.path, commandId);
        const commandPath = resolveCommandWritePath(projectDir, relativePath);
        command = await writeTextFile(commandPath, generated.content, force);
    } else {
        commandSkipped = true;
    }

    const invokeLabel = commandAdapter ? commandAdapter.getInvokeLabel(commandId) : `${tool.skillsDir}/skills/${skillName}`;

    return { command, commandSkipped, invokeLabel, skill, toolId };
};

export const installAgentArtifacts = async (
    projectDir: string,
    options: InstallAgentArtifactsOptions,
): Promise<InstallAgentArtifactsResult> => {
    const force = Boolean(options.force);
    const tools: PerToolInstallResult[] = [];
    const skillName = options.skillName ?? STRUCTURE_SKILL_NAME;
    const commandId = options.commandId ?? STRUCTURE_COMMAND_ID;

    for (const toolId of options.tools) {
        tools.push(await installForTool(projectDir, toolId, options.cliVersion, force, skillName, commandId));
        if (skillName === STRUCTURE_SKILL_NAME) {
            tools.push(
                await installForTool(projectDir, toolId, options.cliVersion, force, STRUCTURE_APPLY_SKILL_NAME, STRUCTURE_APPLY_COMMAND_ID),
            );
        }
    }

    return { tools };
};

export { STRUCTURE_SLASH } from '../templates/structure.js';
