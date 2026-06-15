import { existsSync } from 'node:fs';
import { basename } from 'node:path';
import { CommandAdapterRegistry } from '../command-generation/registry.js';
import { STRUCTURE_COMMAND_ID, STRUCTURE_SKILL_NAME } from '../templates/structure.js';
import { resolveStructureCommandPath, resolveStructureSkillPath } from './command-path.js';
import type { AgentArtifactSummary } from './types.js';

export const buildAgentArtifactSummaries = (
    projectDir: string,
    toolIds: string[],
    skillName: string = STRUCTURE_SKILL_NAME,
    commandId: string = STRUCTURE_COMMAND_ID,
): AgentArtifactSummary[] =>
    toolIds.map((toolId) => {
        const skillPath = resolveStructureSkillPath(projectDir, toolId, skillName);
        const commandPath = resolveStructureCommandPath(projectDir, toolId, commandId);
        const commandAdapter = CommandAdapterRegistry.get(toolId);
        const invokeLabel = commandAdapter?.getInvokeLabel(commandId) ?? `${toolId} skill:${skillName}`;

        return {
            commandInstalled: commandPath ? existsSync(commandPath) : false,
            commandOverwritten: false,
            commandPath,
            commandSkipped: !commandAdapter,
            invokeLabel,
            skillInstalled: existsSync(skillPath),
            skillOverwritten: false,
            skillPath,
            toolId,
        };
    });

export const formatAgentToolInstruction = (toolId: string, invokeLabel: string): string[] => {
    const lines: string[] = [];
    if (toolId === 'cursor' || toolId === 'windsurf') {
        lines.push('    Type the slash command in your chat window:');
        lines.push(`      ${invokeLabel}`);
    } else if (toolId === 'claude') {
        lines.push('    Run the command in Claude Code chat:');
        lines.push(`      /${basename(invokeLabel, '.md')}`);
    } else if (toolId === 'cline' || toolId === 'roocode') {
        lines.push('    Tag the command/instruction file in your chat:');
        lines.push(`      @${invokeLabel}`);
    } else {
        lines.push('    Ask the agent to use the installed skill/instruction at:');
        lines.push(`      ${invokeLabel}`);
    }
    return lines;
};
