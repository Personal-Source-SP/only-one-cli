import { existsSync } from 'node:fs';
import { resolveStructureCommandPath, resolveStructureSkillPath } from './command-path.js';
import { CommandAdapterRegistry } from '../command-generation/registry.js';
import { getToolsWithSkillsDir } from './tools.js';
import { STRUCTURE_COMMAND_ID, STRUCTURE_SKILL_NAME } from '../templates/structure.js';

export { resolveStructureCommandPath, resolveStructureSkillPath } from './command-path.js';

export const hasStructureSkillForTool = (
    projectDir: string,
    toolId: string,
    skillName: string = STRUCTURE_SKILL_NAME,
    commandId: string = STRUCTURE_COMMAND_ID,
): boolean => {
    if (!existsSync(resolveStructureSkillPath(projectDir, toolId, skillName))) {
        return false;
    }
    if (!CommandAdapterRegistry.has(toolId)) {
        return true;
    }
    const commandPath = resolveStructureCommandPath(projectDir, toolId, commandId);
    if (commandPath && !existsSync(commandPath)) {
        return false;
    }
    return true;
};

export const getMissingStructureTools = (
    projectDir: string,
    toolIds: string[],
    skillName: string = STRUCTURE_SKILL_NAME,
    commandId: string = STRUCTURE_COMMAND_ID,
): string[] => {
    const targets = toolIds.length ? toolIds : getToolsWithSkillsDir();
    return targets.filter((toolId) => !hasStructureSkillForTool(projectDir, toolId, skillName, commandId));
};

export const hasStructureAgentSkills = (
    projectDir: string,
    toolIds: string[],
    skillName: string = STRUCTURE_SKILL_NAME,
    commandId: string = STRUCTURE_COMMAND_ID,
): boolean => !getMissingStructureTools(projectDir, toolIds, skillName, commandId).length;
