import { homedir } from 'node:os';
import type { ItemOrigin, PlannedItem } from '@/core/init/plan-types.js';
import { checkExistingMcps } from '@/core/mcp/index.js';
import { checkExistingSkills } from '@/core/skill/index.js';
import { checkExistingWorkflows } from '@/core/workflow/index.js';
import { getAllowedAgentTargets } from '@/core/target-selection/catalog.js';
import { SKILLS } from '@assets/skills/index.js';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

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

    // Filter tools to those that have skills directory in project
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

    // Expand associated workflows & required MCPs
    const associatedWorkflows = new Set<string>();
    const requiredMcps = new Set<string>();

    for (const skillName of selectedSkillNames) {
        const skillMeta = SKILLS.find((s) => s.name === skillName);
        if (skillMeta?.associatedWorkflows) {
            for (const wf of skillMeta.associatedWorkflows) associatedWorkflows.add(wf);
        }
    }

    if (associatedWorkflows.size > 0) {
        const wfList = Array.from(associatedWorkflows);
        const existingWfs = await checkExistingWorkflows(projectDir, activeTools, wfList);

        for (const tool of activeTools) {
            for (const wfName of wfList) {
                const existing = existingWfs.find((w) => w.toolId === tool.value && w.workflowName === wfName);
                const isExisting = existing ? existing.exists : false;

                workflowItems.push({
                    key: `workflow:${tool.value}:${wfName}`,
                    category: 'workflow',
                    name: wfName,
                    target: tool.value,
                    origin: 'auto-required',
                    state: isExisting ? 'existing' : 'new',
                    reason: `Associated with skill(s)`,
                    meta: { toolId: tool.value, workflowName: wfName },
                });
            }
        }
    }

    if (requiredMcps.size > 0) {
        const expandedMcps = await planMcps({
            targetIdeIds: selectedTools,
            selectedMcpNames: Array.from(requiredMcps),
            origin: 'auto-required',
            reason: 'Required by skill(s)',
        });
        mcpItems.push(...expandedMcps);
    }

    return { skillItems, workflowItems, mcpItems };
}
