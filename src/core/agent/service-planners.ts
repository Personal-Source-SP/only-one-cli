import { homedir } from 'node:os';
import type { ItemOrigin, PlannedItem } from '@/core/init/plan-types.js';
import { checkExistingMcps } from '@/core/mcp/index.js';
import { checkExistingSkills } from '@/core/skill/index.js';
import { checkExistingWorkflows } from '@/core/workflow/index.js';
import { getAllowedAgentTargets } from '@/core/target-selection/catalog.js';
import { WORKFLOWS } from '@assets/workflows/index.js';

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

export interface PlanWorkflowOptions {
    projectDir: string;
    selectedTools: string[];
    selectedWorkflowNames: string[];
    origin?: ItemOrigin;
    reason?: string;
}

export async function planWorkflows(
    options: PlanWorkflowOptions,
): Promise<{ workflowItems: PlannedItem[]; skillItems: PlannedItem[]; mcpItems: PlannedItem[] }> {
    const { projectDir, selectedTools, selectedWorkflowNames, origin = 'selected', reason } = options;

    const workflowItems: PlannedItem[] = [];
    const allowedTargets = getAllowedAgentTargets();
    const activeTools = allowedTargets
        .map((t) => t.agent)
        .filter((agent): agent is NonNullable<typeof agent> => agent !== undefined && selectedTools.includes(agent.value));

    const existingWfs = await checkExistingWorkflows(projectDir, activeTools, selectedWorkflowNames);

    for (const tool of activeTools) {
        for (const wfName of selectedWorkflowNames) {
            const existing = existingWfs.find((w) => w.toolId === tool.value && w.workflowName === wfName);
            const isExisting = existing ? existing.exists : false;

            workflowItems.push({
                key: `workflow:${tool.value}:${wfName}`,
                category: 'workflow',
                name: wfName,
                target: tool.value,
                origin,
                state: isExisting ? 'existing' : 'new',
                reason,
                meta: { toolId: tool.value, workflowName: wfName },
            });
        }
    }

    // Expand required skills & required MCPs from workflows
    const requiredSkills = new Set<string>();
    const requiredMcps = new Set<string>();

    for (const wfName of selectedWorkflowNames) {
        const wfMeta = WORKFLOWS.find((w) => w.name === wfName);
        if (wfMeta?.requiredSkills) {
            for (const s of wfMeta.requiredSkills) requiredSkills.add(s);
        }
        if (wfMeta?.requiredMcps) {
            for (const m of wfMeta.requiredMcps) requiredMcps.add(m);
        }
    }

    let skillItems: PlannedItem[] = [];
    if (requiredSkills.size > 0) {
        const planned = await planSkills({
            projectDir,
            selectedTools,
            selectedSkillNames: Array.from(requiredSkills),
            origin: 'auto-required',
            reason: 'Required by workflow(s)',
        });
        skillItems = planned.skillItems;
    }

    let mcpItems: PlannedItem[] = [];
    if (requiredMcps.size > 0) {
        mcpItems = await planMcps({
            targetIdeIds: selectedTools,
            selectedMcpNames: Array.from(requiredMcps),
            origin: 'auto-required',
            reason: 'Required by workflow(s)',
        });
    }

    return { workflowItems, skillItems, mcpItems };
}
