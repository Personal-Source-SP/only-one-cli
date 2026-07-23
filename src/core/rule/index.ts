import { existsSync } from 'node:fs';
import { mkdir, cp, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ProgramDeps } from '@/cli/deps.js';
import { AllowedToolId } from '@/constants/allowed-tools.js';
import { getAllowedRuleTargets, type AllowedTarget } from '@/core/target-selection/catalog.js';
import { executePackageActions } from '@/core/init/package-installer.js';
import { executePluginActions } from '@/core/plugin/index.js';
import { resolvePackageRoot } from '@/core/runtime/package-root.js';
import { RULES } from '@assets/rules/index.js';
import type { RuleManifest } from '@assets/types.js';
import { validateRuleDependenciesPreflight, buildDeduplicatedDependencyPlan } from './dependencies.js';

const rulesAssetsDir = join(resolvePackageRoot(import.meta.url), 'assets/rules');

export interface ExistingRule {
    toolId: string;
    toolName: string;
    ruleId: string;
    destPath: string;
    exists: boolean;
}

export interface RuleInstallResult {
    toolId: string;
    toolName: string;
    ruleId: string;
    status: 'success' | 'installed_not_ready' | 'overwritten' | 'skipped' | 'failed';
    error?: string;
    details?: string;
}

export const checkExistingRules = async (
    projectDir: string,
    selectedTargets: AllowedTarget[],
    ruleIds: string[],
    ruleManifests: RuleManifest[] = RULES,
): Promise<ExistingRule[]> => {
    const results: ExistingRule[] = [];
    for (const target of selectedTargets) {
        if (!target.agent?.rulesDir) continue;
        for (const ruleId of ruleIds) {
            const manifest = ruleManifests.find((r) => r.id === ruleId);
            if (!manifest) continue;
            const filename = manifest.sourceFile;
            const destPath = join(target.agent.rulesDir, filename);
            const absoluteDestPath = join(projectDir, destPath);
            const exists = existsSync(absoluteDestPath);
            results.push({
                toolId: target.id,
                toolName: target.agent.name,
                ruleId,
                destPath,
                exists,
            });
        }
    }
    return results;
};

export interface InstallRulesRequest {
    deps: ProgramDeps;
    projectDir: string;
    selectedTargets: AllowedTarget[];
    ruleIds: string[];
    ruleManifests?: RuleManifest[];
    overwriteList?: string[]; // array of "toolId:ruleId"
    execFileAsync?: (file: string, args: string[], options: any) => Promise<{ stdout: string; stderr: string }>;
}

export const installRules = async (
    request: InstallRulesRequest,
): Promise<{
    results: RuleInstallResult[];
    dependencySummary: {
        packages: string[];
        plugins: { installed: string[]; actionRequired: string[]; failed: string[] };
    };
}> => {
    const { deps, projectDir, selectedTargets, ruleIds, ruleManifests = RULES, overwriteList = [] } = request;
    const targetIds = selectedTargets.map((t) => t.id as AllowedToolId);

    // 1. Preflight validation
    const validation = validateRuleDependenciesPreflight(ruleIds, targetIds, ruleManifests);
    if (!validation.valid) {
        throw new Error(`Rule preflight validation failed:\n${validation.errors.join('\n')}`);
    }

    // 2. Build dependency plan
    const plan = buildDeduplicatedDependencyPlan(ruleIds, ruleManifests);

    // 3. Execute package dependencies
    let installedPackages: string[] = [];
    if (plan.packages.length > 0) {
        deps.stdout('\nInstalling rule package dependencies...');
        const pkgResult = await executePackageActions({
            deps,
            projectDir,
            packageManifests: (await import('@assets/packages/index.js')).PACKAGES,
            selectedPackageIds: plan.packages,
            execFileAsync: request.execFileAsync,
        });
        installedPackages = pkgResult.installedPackages;
    }

    // 4. Execute plugin dependencies
    let pluginSummary = { installed: [] as string[], actionRequired: [] as string[], failed: [] as string[] };
    if (plan.plugins.length > 0) {
        deps.stdout('\nInstalling rule plugin dependencies...');
        const pluginResult = await executePluginActions({
            deps,
            projectDir,
            selectedPluginIds: plan.plugins,
            targetIds,
            execFileAsync: request.execFileAsync,
        });
        pluginSummary = {
            installed: pluginResult.summary.installed,
            actionRequired: pluginResult.summary.actionRequired,
            failed: pluginResult.summary.failed,
        };
    }

    // 5. Pre-check existing rules
    const existingChecks = await checkExistingRules(projectDir, selectedTargets, ruleIds, ruleManifests);

    // 6. Install rule files per target
    const results: RuleInstallResult[] = [];

    for (const target of selectedTargets) {
        if (!target.agent?.rulesDir) continue;

        for (const ruleId of ruleIds) {
            const manifest = ruleManifests.find((r) => r.id === ruleId);
            if (!manifest) continue;

            const check = existingChecks.find((c) => c.toolId === target.id && c.ruleId === ruleId);
            const exists = check ? check.exists : false;

            if (exists) {
                const identifier = `${target.id}:${ruleId}`;
                if (!overwriteList.includes(identifier)) {
                    results.push({
                        toolId: target.id,
                        toolName: target.agent.name,
                        ruleId,
                        status: 'skipped',
                    });
                    continue;
                }
            }

            // Check if any plugin dependency failed for this target
            const pluginFailedForTarget = (manifest.requiredPlugins || []).some((p) => pluginSummary.failed.includes(`${p}:${target.id}`));

            if (pluginFailedForTarget) {
                results.push({
                    toolId: target.id,
                    toolName: target.agent.name,
                    ruleId,
                    status: 'failed',
                    error: `Dependency plugin failed for target ${target.id}`,
                });
                continue;
            }

            const targetRulesDir = join(projectDir, target.agent.rulesDir);
            const destPath = join(targetRulesDir, manifest.sourceFile);
            const srcPath = join(rulesAssetsDir, manifest.sourceFile);

            try {
                await mkdir(targetRulesDir, { recursive: true });
                await cp(srcPath, destPath, { force: true });

                const hasManualPluginPending = (manifest.requiredPlugins || []).some((p) =>
                    pluginSummary.actionRequired.includes(`${p} (${target.id})`),
                );

                const status = hasManualPluginPending ? 'installed_not_ready' : exists ? 'overwritten' : 'success';

                results.push({
                    toolId: target.id,
                    toolName: target.agent.name,
                    ruleId,
                    status,
                    details: hasManualPluginPending ? `Action required for plugin dependency on ${target.id}` : undefined,
                });
            } catch (error: any) {
                results.push({
                    toolId: target.id,
                    toolName: target.agent.name,
                    ruleId,
                    status: 'failed',
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }
    }

    return {
        results,
        dependencySummary: {
            packages: installedPackages,
            plugins: pluginSummary,
        },
    };
};
