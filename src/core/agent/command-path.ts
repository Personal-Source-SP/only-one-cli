import { isAbsolute, join } from 'node:path';
import { CommandAdapterRegistry } from '@/core/command-generation/registry.js';
import type { ToolCommandAdapter } from '@/core/command-generation/types.js';
import { STRUCTURE_COMMAND_ID, STRUCTURE_SKILL_NAME } from '@/core/templates/structure.js';
import { getAgentToolById } from './tools.js';

/** Map OpenSpec opsx-oriented paths to only-one structure-generate and structure-apply command paths. */
export const normalizeStructureCommandPath = (filePath: string, commandId: string): string =>
    filePath.replace(/\/opsx\//g, '/').replace(new RegExp(`opsx-${commandId}`, 'g'), commandId);

export const resolveStructureSkillRelativePath = (toolName: string = STRUCTURE_SKILL_NAME, toolId?: string): string => {
    const tool = toolId ? getAgentToolById(toolId) : undefined;
    if (toolId && !tool?.skillsDir) {
        throw new Error(`Tool '${toolId}' has no skillsDir in catalog`);
    }
    const skillsDir = tool?.skillsDir ?? '.cursor';
    return join(skillsDir, 'skills', toolName, 'SKILL.md');
};

export const resolveStructureSkillPath = (projectDir: string, toolId: string, skillName: string = STRUCTURE_SKILL_NAME): string => {
    const tool = getAgentToolById(toolId);
    if (!tool?.skillsDir) {
        throw new Error(`Tool '${toolId}' has no skillsDir in catalog`);
    }
    return join(projectDir, tool.skillsDir, 'skills', skillName, 'SKILL.md');
};

export const resolveStructureCommandFilePath = (adapter: ToolCommandAdapter, commandId: string): string =>
    normalizeStructureCommandPath(adapter.getFilePath(commandId), commandId);

export const resolveStructureCommandPath = (
    projectDir: string,
    toolId: string,
    commandId: string = STRUCTURE_COMMAND_ID,
): string | null => {
    const adapter = CommandAdapterRegistry.get(toolId);
    if (!adapter) {
        return null;
    }
    const relative = resolveStructureCommandFilePath(adapter, commandId);
    if (isAbsolute(relative)) {
        return relative;
    }
    return join(projectDir, relative);
};
