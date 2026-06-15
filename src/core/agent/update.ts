import { loadConfig, persistConfigAgentTools } from '../config/index.js';
import { extractGeneratedByVersion } from '../structure/status.js';
import { readCliVersion } from '../runtime/read-cli-version.js';
import { installAgentArtifacts, type InstallAgentArtifactsResult } from './install.js';
import { resolveStructureSkillPath } from './skill-presence.js';
import { getAgentToolDisplayName } from './prompt-setup.js';

export type UpdateAgentArtifactsRequest = {
    force?: boolean;
    projectDir: string;
};

export type UpdateAgentArtifactsResponse = {
    agentTools: string[];
    cliVersion: string;
    message: string;
    structure: InstallAgentArtifactsResult;
    updated: boolean;
};

export const updateAgentArtifacts = async (request: UpdateAgentArtifactsRequest): Promise<UpdateAgentArtifactsResponse> => {
    const cliVersion = readCliVersion();
    const config = await loadConfig(request.projectDir);
    const agentTools = config.agent_tools ?? [];

    if (!agentTools.length) {
        return {
            agentTools: [],
            cliVersion,
            message: 'No agent_tools configured. Run only-one-cli init or structure to install skills.',
            structure: { tools: [] },
            updated: false,
        };
    }

    const force = Boolean(request.force);
    let needsUpdate = force;

    if (!needsUpdate) {
        for (const toolId of agentTools) {
            const skillPath = resolveStructureSkillPath(request.projectDir, toolId);
            const installedVersion = extractGeneratedByVersion(skillPath);
            if (!installedVersion || installedVersion !== cliVersion) {
                needsUpdate = true;
                break;
            }
        }
    }

    if (!needsUpdate) {
        const structure = await installAgentArtifacts(request.projectDir, { cliVersion, force: false, tools: agentTools });
        return {
            agentTools,
            cliVersion,
            message: 'Agent workflow artifacts are up to date.',
            structure,
            updated: false,
        };
    }

    const structure = await installAgentArtifacts(request.projectDir, { cliVersion, force: true, tools: agentTools });
    await persistConfigAgentTools(request.projectDir, agentTools);

    const anyUpdated = structure.tools.some((t) => t.skill.installed || t.command?.installed);

    return {
        agentTools,
        cliVersion,
        message: 'Updated structure agent workflow artifacts.',
        structure,
        updated: anyUpdated,
    };
};

export const formatUpdateHumanLines = (result: UpdateAgentArtifactsResponse): string[] => {
    const lines = [result.message, `  CLI version: ${result.cliVersion}`];
    if (!result.agentTools.length) {
        return lines;
    }
    if (result.updated) {
        for (const entry of result.structure.tools) {
            const label = getAgentToolDisplayName(entry.toolId);
            if (entry.skill.installed) {
                lines.push(`  ${label} skill: ${entry.skill.path}`);
            }
            if (entry.command?.installed) {
                lines.push(`  ${label} command: ${entry.command.path}`);
            }
        }
    }
    return lines;
};
