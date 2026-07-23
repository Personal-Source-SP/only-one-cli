import type { InitPlan, PlannedItem } from './plan-types.js';
import { deduplicatePlannedItems } from './plan-utils.js';
import { planPackages } from '../package/planner.js';
import { planConfigs } from '../config/planner.js';
import { planMcps, planSkills } from '../agent/service-planners.js';
import type { InitSelectionInputs } from './interactive-orchestrator.js';

export interface BuildInitPlanOptions {
    projectDir: string;
    selections: InitSelectionInputs;
}

export async function buildInitPlan(options: BuildInitPlanOptions): Promise<InitPlan> {
    const { projectDir, selections } = options;
    const allItems: PlannedItem[] = [];

    // Packages
    if (selections.packages.length > 0) {
        const pkgItems = await planPackages({
            projectDir,
            selectedPackageIds: selections.packages,
            origin: 'selected',
        });
        allItems.push(...pkgItems);
    }

    // Configs
    if (selections.configs.length > 0) {
        const configItems = await planConfigs({
            projectDir,
            selectedConfigNames: selections.configs,
            origin: 'selected',
        });
        allItems.push(...configItems);
    }

    // MCPs
    if (selections.mcps.length > 0) {
        const mcpItems = await planMcps({
            targetIdeIds: selections.selectedTools,
            selectedMcpNames: selections.mcps,
            origin: 'selected',
        });
        allItems.push(...mcpItems);
    }

    // Skills (+ associated workflows & required MCPs)
    if (selections.skills.length > 0) {
        const { skillItems, workflowItems, mcpItems } = await planSkills({
            projectDir,
            selectedTools: selections.selectedTools,
            selectedSkillNames: selections.skills,
            origin: 'selected',
        });
        allItems.push(...skillItems, ...workflowItems, ...mcpItems);
    }

    // Plugins per agent
    for (const [toolId, pluginIds] of Object.entries(selections.pluginsPerAgent)) {
        for (const pluginId of pluginIds) {
            allItems.push({
                key: `plugin:${toolId}:${pluginId}`,
                category: 'plugin',
                name: pluginId,
                target: toolId,
                origin: 'selected',
                state: 'action-only',
                reason: 'Plugin installation instructions / action required',
                meta: { toolId, pluginId },
            });
        }
    }

    // Rules per agent
    for (const [toolId, ruleIds] of Object.entries(selections.rulesPerAgent)) {
        for (const ruleId of ruleIds) {
            allItems.push({
                key: `rule:${toolId}:${ruleId}`,
                category: 'rule',
                name: ruleId,
                target: toolId,
                origin: 'selected',
                state: 'new',
                meta: { toolId, ruleId },
            });
        }
    }

    const items = deduplicatePlannedItems(allItems);

    return {
        projectDir,
        selectedTools: selections.selectedTools,
        items,
    };
}
