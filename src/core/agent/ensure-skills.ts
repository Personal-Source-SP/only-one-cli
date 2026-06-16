import type { ProgramDeps } from '@/cli/deps.js';
import { loadConfig } from '@/core/config/index.js';
import { getMissingStructureTools, hasStructureAgentSkills, hasStructureSkillForTool } from './skill-presence.js';
import { AgentSkillSetupError, formatAgentSkillSetupError, getAgentToolDisplayName, promptAgentSkillSetup } from './prompt-setup.js';
import { isPromptInteractive } from './interactive.js';
import { resolveToolsArg, ResolveToolsArgError } from './resolve-tools.js';
import { getToolsWithSkillsDir } from './tools.js';
import { STRUCTURE_COMMAND_ID, STRUCTURE_SKILL_NAME } from '@/core/templates/structure.js';
import { STRUCTURE_APPLY_COMMAND_ID, STRUCTURE_APPLY_SKILL_NAME } from '@/core/templates/structure-apply.js';

export type EnsureStructureAgentSkillsRequest = {
    force?: boolean;
    noInstallSkill?: boolean;
    projectDir: string;
    toolsArg?: string;
    skillName?: string;
    commandId?: string;
};

export type EnsureStructureAgentSkillsResult =
    | { ok: true; agentTools: string[]; setupRan: boolean }
    | { ok: false; exitCode: number; message: string };

export const ensureStructureAgentSkills = async (
    deps: ProgramDeps,
    request: EnsureStructureAgentSkillsRequest,
): Promise<EnsureStructureAgentSkillsResult> => {
    const skillName = request.skillName ?? STRUCTURE_SKILL_NAME;
    const commandId = request.commandId ?? STRUCTURE_COMMAND_ID;

    if (request.noInstallSkill) {
        return { agentTools: [], ok: true, setupRan: false };
    }

    const checkHasSkills = (tools: string[]): boolean => {
        if (skillName === STRUCTURE_SKILL_NAME) {
            return (
                hasStructureAgentSkills(request.projectDir, tools, STRUCTURE_SKILL_NAME, STRUCTURE_COMMAND_ID) &&
                hasStructureAgentSkills(request.projectDir, tools, STRUCTURE_APPLY_SKILL_NAME, STRUCTURE_APPLY_COMMAND_ID)
            );
        }
        return hasStructureAgentSkills(request.projectDir, tools, skillName, commandId);
    };

    const getMissingTools = (tools: string[]): string[] => {
        if (skillName === STRUCTURE_SKILL_NAME) {
            const missingGenerate = getMissingStructureTools(request.projectDir, tools, STRUCTURE_SKILL_NAME, STRUCTURE_COMMAND_ID);
            const missingApply = getMissingStructureTools(
                request.projectDir,
                tools,
                STRUCTURE_APPLY_SKILL_NAME,
                STRUCTURE_APPLY_COMMAND_ID,
            );
            return Array.from(new Set([...missingGenerate, ...missingApply]));
        }
        return getMissingStructureTools(request.projectDir, tools, skillName, commandId);
    };

    if (request.toolsArg !== undefined) {
        try {
            const setup = await promptAgentSkillSetup(deps, {
                force: request.force,
                projectDir: request.projectDir,
                skipOptInConfirm: true,
                toolsArg: request.toolsArg,
                skillName,
                commandId,
            });
            return { agentTools: setup.tools, ok: true, setupRan: setup.installRan };
        } catch (error) {
            return { exitCode: 1, message: formatAgentSkillSetupError(error), ok: false };
        }
    }

    const config = await loadConfig(request.projectDir);
    const configured = config.agent_tools ?? [];
    const checkTools = configured.length ? configured : getToolsWithSkillsDir();

    if (configured.length && checkHasSkills(configured)) {
        return { agentTools: configured, ok: true, setupRan: false };
    }

    const missing = getMissingTools(checkTools);
    if (!missing.length) {
        const activeTools = configured.length
            ? configured
            : checkTools.filter((toolId) => {
                  if (skillName === STRUCTURE_SKILL_NAME) {
                      return (
                          hasStructureSkillForTool(request.projectDir, toolId, STRUCTURE_SKILL_NAME, STRUCTURE_COMMAND_ID) &&
                          hasStructureSkillForTool(request.projectDir, toolId, STRUCTURE_APPLY_SKILL_NAME, STRUCTURE_APPLY_COMMAND_ID)
                      );
                  }
                  return hasStructureSkillForTool(request.projectDir, toolId, skillName, commandId);
              });
        return { agentTools: activeTools, ok: true, setupRan: false };
    }

    if (!isPromptInteractive(deps)) {
        const names = (missing.length ? missing : checkTools).map(getAgentToolDisplayName).join(', ');
        return {
            exitCode: 1,
            message: `Structure agent skills missing for: ${names}. Run interactively or pass --tools to install.`,
            ok: false,
        };
    }

    const missingNames = (missing.length ? missing : checkTools).map(getAgentToolDisplayName).join(', ');
    deps.stdout(`Structure skills not found for: ${missingNames}`);

    try {
        const setup = await promptAgentSkillSetup(deps, {
            force: request.force,
            preSelectedTools: missing.length ? missing : checkTools,
            projectDir: request.projectDir,
            skillName,
            commandId,
        });

        if (!setup.installRan || !setup.tools.length) {
            return {
                exitCode: 1,
                message:
                    'Structure skills not installed. Re-run with --no-install-skill to scaffold only, or accept install when prompted.',
                ok: false,
            };
        }

        const stillMissing = getMissingTools(setup.tools);
        if (stillMissing.length) {
            return {
                exitCode: 1,
                message: `Install incomplete; still missing skills for: ${stillMissing.join(', ')}`,
                ok: false,
            };
        }

        return { agentTools: setup.tools, ok: true, setupRan: true };
    } catch (error) {
        if (error instanceof AgentSkillSetupError || error instanceof ResolveToolsArgError) {
            return { exitCode: 1, message: formatAgentSkillSetupError(error), ok: false };
        }
        throw error;
    }
};
