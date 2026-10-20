import { homedir } from 'node:os';
import type { ItemOrigin, PlannedItem } from '@/core/init/plan-types.js';
import { checkExistingMcps } from '@/core/mcp/index.js';
import { checkExistingSkills } from '@/core/skill/index.js';
import { getAllowedAgentTargets } from '@/core/target-selection/catalog.js';

export interface PlanMcpOptions {
    targetIdeIds: string[];
    selectedMcpNames: string[];
    origin?: ItemOrigin;
    reason?: string;
    homeDir?: string;
    platform?: NodeJS.Platform;
}

export async function planMcps(options: PlanMcpOptions): Promise<PlannedItem[]> {
    const { targetIdeIds, selectedMcpNames, origin = 'selected', reason, homeDir = homedir(), platform = process.platform } = options;
    const items: PlannedItem[] = [];

    const existingMcps = await checkExistingMcps(homeDir, platform, targetIdeIds, selectedMcpNames);

    for (const ideId of targetIdeIds) {
        for (const mcpId of selectedMcpNames) {
            const existing = existingMcps.find((m) => m.ideId === ideId && m.mcpId === mcpId);
            const isExisting = existing ? existing.exists : false;

            items.push({
                key: `mcp:${ideId}:${mcpId}`,
                category: 'mcp',
                name: mcpId,
                target: ideId,
                origin,
                state: isExisting ? 'existing' : 'new',
                reason,
                meta: { ideId, mcpId },
            });
        }
    }

    return items;
}

export interface PlanSkillOptions {
    projectDir: string;
    selectedTools: string[];
    selectedSkillNames: string[];
    origin?: ItemOrigin;
    reason?: string;
}

export async function planSkills(
    options: PlanSkillOptions,
): Promise<{ skillItems: PlannedItem[]; workflowItems: PlannedItem[]; mcpItems: PlannedItem[] }> {
    const { projectDir, selectedTools, selectedSkillNames, origin = 'selected', reason } = options;

    const skillItems: PlannedItem[] = [];
    const workflowItems: PlannedItem[] = [];
    const mcpItems: PlannedItem[] = [];

    const allowedTargets = getAllowedAgentTargets();
    const activeTools = allowedTargets
        .map((t) => t.agent)
        .filter((agent): agent is NonNullable<typeof agent> => agent !== undefined && selectedTools.includes(agent.value));

    const existingSkills = await checkExistingSkills(projectDir, activeTools, selectedSkillNames);

    for (const tool of activeTools) {
        for (const skillName of selectedSkillNames) {
            const existing = existingSkills.find((s) => s.toolId === tool.value && s.skillName === skillName);
            const isExisting = existing ? existing.exists : false;

            skillItems.push({
                key: `skill:${tool.value}:${skillName}`,
                category: 'skill',
                name: skillName,
                target: tool.value,
                origin,
                state: isExisting ? 'existing' : 'new',
                reason,
                meta: { toolId: tool.value, skillName },
            });
        }
    }

    return { skillItems, workflowItems, mcpItems };
}
