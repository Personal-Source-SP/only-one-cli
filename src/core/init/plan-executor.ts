import type { ProgramDeps } from '@/cli/deps.js';
import type { ExecutedItemResult, InitPlan, InitResult } from './plan-types.js';
import { executePackageActions } from './package-installer.js';
import { PACKAGES } from '@assets/packages/index.js';
import { readMcpManifests, syncMcpGlobalConfig } from '../mcp/index.js';
import { installSkills } from '../skill/index.js';
import { installWorkflows } from '../workflow/index.js';
import { installRules } from '../rule/index.js';
import { updateGitignore } from './gitignore.js';
import { getAllowedAgentTargets } from '../target-selection/catalog.js';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

export interface ExecutePlanOptions {
    deps: ProgramDeps;
    plan: InitPlan;
    noIgnore?: boolean;
}

export async function executeInitPlan(options: ExecutePlanOptions): Promise<InitResult> {
    const { deps, plan, noIgnore = false } = options;
    const results: ExecutedItemResult[] = [];

    let installedCount = 0;
    let overwrittenCount = 0;
    let actionRequiredCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    // 1. Packages
    const pkgItems = plan.items.filter((i) => i.category === 'package');
    if (pkgItems.length > 0) {
        const selectedPackageIds = pkgItems.map((i) => i.name);
        const overwriteList = pkgItems.filter((i) => i.state === 'existing').map((i) => i.name);

        const pkgRes = await executePackageActions({
            deps,
            projectDir: plan.projectDir,
            packageManifests: PACKAGES,
            selectedPackageIds,
            overwriteList,
        });

        for (const item of pkgItems) {
            if (pkgRes.summary.installed.includes(item.name)) {
                results.push({ item, status: item.state === 'existing' ? 'overwritten' : 'installed' });
                if (item.state === 'existing') overwrittenCount++;
                else installedCount++;
            } else if (pkgRes.summary.skipped.includes(item.name)) {
                results.push({ item, status: 'skipped' });
                skippedCount++;
            } else {
                results.push({ item, status: 'failed', error: 'npm install failed' });
                failedCount++;
            }
        }
    }

    // 2. Configs
    const { mkdir, cp } = await import('node:fs/promises');
    const { resolvePackageRoot } = await import('@/core/runtime/package-root.js');
    const configItems = plan.items.filter((i) => i.category === 'config');
    for (const item of configItems) {
        try {
            const srcRel = item.meta?.src || 'templates/openspec/config.yaml';
            const destRel = item.meta?.dest || 'openspec/config.yaml';
            const packageRoot = resolvePackageRoot(import.meta.url);
            const absSrc = join(packageRoot, 'assets', srcRel);
            const absDest = join(plan.projectDir, destRel);
            await mkdir(dirname(absDest), { recursive: true });
            await cp(absSrc, absDest, { recursive: true, force: true });

            results.push({ item, status: item.state === 'existing' ? 'overwritten' : 'installed' });
            if (item.state === 'existing') overwrittenCount++;
            else installedCount++;
        } catch (err: any) {
            results.push({ item, status: 'failed', error: err?.message || String(err) });
            failedCount++;
        }
    }

    // 3. MCPs
    const mcpItems = plan.items.filter((i) => i.category === 'mcp');
    if (mcpItems.length > 0) {
        const ideIds = Array.from(new Set(mcpItems.map((i) => i.target!).filter(Boolean)));
        const mcpNames = Array.from(new Set(mcpItems.map((i) => i.name)));
        const overwriteList = mcpItems.filter((i) => i.state === 'existing').map((i) => `${i.target}:${i.name}`);
        const { manifests } = await readMcpManifests();
        const selectedManifests = manifests.filter((m) => mcpNames.includes(m.id));

        const syncRes = await syncMcpGlobalConfig({
            cwd: plan.projectDir,
            homeDir: homedir(),
            ideIds,
            manifests: selectedManifests,
            platform: process.platform,
            write: () => {},
            overwriteList,
        });

        for (const item of mcpItems) {
            const ideResult = syncRes.results.find((r) => r.ideId === item.target);
            const mcpEntry = ideResult?.results.find((m) => m.id === item.name);
            if (mcpEntry) {
                const status =
                    mcpEntry.status === 'added' || (mcpEntry.status as string) === 'reconfigured'
                        ? item.state === 'existing'
                            ? 'overwritten'
                            : 'installed'
                        : mcpEntry.status === 'skipped'
                          ? 'skipped'
                          : 'failed';
                results.push({ item, status });
                if (status === 'installed') installedCount++;
                else if (status === 'overwritten') overwrittenCount++;
                else if (status === 'skipped') skippedCount++;
                else failedCount++;
            } else {
                results.push({ item, status: 'skipped' });
                skippedCount++;
            }
        }
    }

    // 4. Skills
    const skillItems = plan.items.filter((i) => i.category === 'skill');
    if (skillItems.length > 0) {
        const allowedTargets = getAllowedAgentTargets();
        const toolsForSkills = allowedTargets
            .map((t) => t.agent)
            .filter((agent): agent is NonNullable<typeof agent> => agent !== undefined && plan.selectedTools.includes(agent.value));
        const skillNames = Array.from(new Set(skillItems.map((i) => i.name)));
        const overwriteList = skillItems.filter((i) => i.state === 'existing').map((i) => `${i.target}:${i.name}`);

        const installRes = await installSkills({
            deps,
            projectDir: plan.projectDir,
            selectedTools: toolsForSkills,
            skillNames,
            overwriteList,
            noIgnore,
        });

        for (const item of skillItems) {
            const res = installRes.find((r) => r.toolId === item.target && r.skillName === item.name);
            if (res) {
                const status =
                    res.status === 'success'
                        ? 'installed'
                        : res.status === 'overwritten'
                          ? 'overwritten'
                          : res.status === 'skipped'
                            ? 'skipped'
                            : 'failed';
                results.push({ item, status, error: res.error });
                if (status === 'installed') installedCount++;
                else if (status === 'overwritten') overwrittenCount++;
                else if (status === 'skipped') skippedCount++;
                else failedCount++;
            } else {
                results.push({ item, status: 'skipped' });
                skippedCount++;
            }
        }
    }

    // 5. Workflows
    const workflowItems = plan.items.filter((i) => i.category === 'workflow');
    if (workflowItems.length > 0) {
        const allowedTargets = getAllowedAgentTargets();
        const toolsForWorkflows = allowedTargets
            .map((t) => t.agent)
            .filter((agent): agent is NonNullable<typeof agent> => agent !== undefined && plan.selectedTools.includes(agent.value));
        const workflowNames = Array.from(new Set(workflowItems.map((i) => i.name)));
        const overwriteList = workflowItems.filter((i) => i.state === 'existing').map((i) => `${i.target}:${i.name}`);

        const installRes = await installWorkflows({
            deps,
            projectDir: plan.projectDir,
            selectedTools: toolsForWorkflows,
            workflowNames,
            overwriteList,
        });

        for (const item of workflowItems) {
            const res = installRes.find((r) => r.toolId === item.target && r.workflowName === item.name);
            if (res) {
                const status = res.status === 'success' ? 'installed' : res.status === 'skipped' ? 'skipped' : 'failed';
                results.push({ item, status, error: res.error });
                if (status === 'installed') installedCount++;
                else if (status === 'skipped') skippedCount++;
                else failedCount++;
            } else {
                results.push({ item, status: 'skipped' });
                skippedCount++;
            }
        }
    }

    // 6. Plugins
    const pluginItems = plan.items.filter((i) => i.category === 'plugin');
    for (const item of pluginItems) {
        results.push({ item, status: 'action-required', details: 'Manual command required' });
        actionRequiredCount++;
    }

    // 7. Rules
    const ruleItems = plan.items.filter((i) => i.category === 'rule');
    if (ruleItems.length > 0) {
        const allowedTargets = getAllowedAgentTargets();
        for (const item of ruleItems) {
            try {
                const targets = allowedTargets.filter((t) => t.id === item.target);
                await installRules({
                    deps,
                    projectDir: plan.projectDir,
                    selectedTargets: targets,
                    ruleIds: [item.name],
                });
                results.push({ item, status: 'installed' });
                installedCount++;
            } catch (err: any) {
                results.push({ item, status: 'failed', error: err?.message || String(err) });
                failedCount++;
            }
        }
    }

    // 8. .gitignore update
    if (!noIgnore && plan.selectedTools.length > 0) {
        await updateGitignore(plan.projectDir, plan.selectedTools);
    }

    return {
        plan,
        results,
        summary: {
            installedCount,
            overwrittenCount,
            actionRequiredCount,
            skippedCount,
            failedCount,
        },
    };
}
