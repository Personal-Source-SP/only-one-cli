import { join } from 'node:path';
import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { WORKFLOWS } from '../../../assets/workflows/index.js';
import { SKILLS } from '../../../assets/skills/index.js';
import { RULES } from '../../../assets/rules/index.js';
import { resolvePackageRoot } from '@/core/runtime/package-root.js';
import { compareDecimalVersions } from './version.js';
import { readInstalledLockfile, recordInstalledAssetsBatch, removeInstalledAsset } from './lockfile.js';
import type { AssetInspectionItem, AssetType } from './types.js';

export interface AssetSyncResult {
    inspected: AssetInspectionItem[];
    outdated: AssetInspectionItem[];
    upToDate: AssetInspectionItem[];
    missing: AssetInspectionItem[];
    removed: AssetInspectionItem[];
}

export interface AppliedAssetUpdateResult {
    updated: Array<{ type: AssetType; id: string; fromVersion: string; toVersion: string }>;
    restored: Array<{ type: AssetType; id: string; version: string }>;
    failed: Array<{ type: AssetType; id: string; error: string }>;
}

export interface AppliedAssetPruneResult {
    pruned: Array<{ type: AssetType; id: string; paths: string[] }>;
    failed: Array<{ type: AssetType; id: string; error: string }>;
}

const packageRoot = resolvePackageRoot(import.meta.url);
const AGENT_DIRS = ['.agents', '.cursor', '.claude'];

function getTargetAgentDirs(projectDir: string): string[] {
    const existing = AGENT_DIRS.filter((ad) => existsSync(join(projectDir, ad)));
    return existing.length > 0 ? existing : ['.agents'];
}

function checkWorkflowExists(projectDir: string, id: string): boolean {
    const dirs = getTargetAgentDirs(projectDir);
    return dirs.some((ad) => existsSync(join(projectDir, ad, 'workflows', `${id}.md`)));
}

function checkSkillExists(projectDir: string, id: string): boolean {
    const dirs = getTargetAgentDirs(projectDir);
    return dirs.some((ad) => existsSync(join(projectDir, ad, 'skills', id, 'SKILL.md')));
}

function checkRuleExists(projectDir: string, sourceFile: string): boolean {
    const dirs = getTargetAgentDirs(projectDir);
    return dirs.some((ad) => existsSync(join(projectDir, ad, 'rules', sourceFile)));
}

/**
 * Inspects all installed assets in the target project and compares them with latest versions.
 */
export async function inspectAssetUpdates(projectDir: string): Promise<AssetSyncResult> {
    const lockfile = await readInstalledLockfile(projectDir);
    const inspected: AssetInspectionItem[] = [];

    // Inspect Workflows
    const installedWorkflows = lockfile.installed.workflows || {};
    for (const [wfName, record] of Object.entries(installedWorkflows)) {
        const manifest = WORKFLOWS.find((w) => w.name === wfName);
        if (!manifest) {
            inspected.push({
                type: 'workflows',
                id: wfName,
                name: wfName,
                installedVersion: record.version,
                latestVersion: 'deleted',
                status: 'removed',
            });
            continue;
        }

        const existsOnDisk = checkWorkflowExists(projectDir, wfName);
        const latestVersion = manifest.version;
        const cmp = compareDecimalVersions(record.version, latestVersion);
        inspected.push({
            type: 'workflows',
            id: wfName,
            name: manifest.name,
            installedVersion: record.version,
            latestVersion,
            status: !existsOnDisk ? 'missing' : cmp < 0 ? 'outdated' : 'up-to-date',
        });
    }

    // Inspect Skills
    const installedSkills = lockfile.installed.skills || {};
    for (const [skillName, record] of Object.entries(installedSkills)) {
        const manifest = SKILLS.find((s) => s.name === skillName);
        if (!manifest) {
            inspected.push({
                type: 'skills',
                id: skillName,
                name: skillName,
                installedVersion: record.version,
                latestVersion: 'deleted',
                status: 'removed',
            });
            continue;
        }

        const existsOnDisk = checkSkillExists(projectDir, skillName);
        const latestVersion = manifest.version;
        const cmp = compareDecimalVersions(record.version, latestVersion);
        inspected.push({
            type: 'skills',
            id: skillName,
            name: manifest.name,
            installedVersion: record.version,
            latestVersion,
            status: !existsOnDisk ? 'missing' : cmp < 0 ? 'outdated' : 'up-to-date',
        });
    }

    // Inspect Rules
    const installedRules = lockfile.installed.rules || {};
    for (const [ruleId, record] of Object.entries(installedRules)) {
        const manifest = RULES.find((r) => r.id === ruleId);
        if (!manifest) {
            inspected.push({
                type: 'rules',
                id: ruleId,
                name: ruleId,
                installedVersion: record.version,
                latestVersion: 'deleted',
                status: 'removed',
            });
            continue;
        }

        const existsOnDisk = checkRuleExists(projectDir, manifest.sourceFile);
        const latestVersion = manifest.version;
        const cmp = compareDecimalVersions(record.version, latestVersion);
        inspected.push({
            type: 'rules',
            id: ruleId,
            name: manifest.id,
            installedVersion: record.version,
            latestVersion,
            status: !existsOnDisk ? 'missing' : cmp < 0 ? 'outdated' : 'up-to-date',
        });
    }

    const outdated = inspected.filter((i) => i.status === 'outdated');
    const upToDate = inspected.filter((i) => i.status === 'up-to-date');
    const missing = inspected.filter((i) => i.status === 'missing');
    const removed = inspected.filter((i) => i.status === 'removed');

    return {
        inspected,
        outdated,
        upToDate,
        missing,
        removed,
    };
}

/**
 * Updates selected or all outdated assets in the target project.
 */
export async function applyAssetUpdates(projectDir: string, itemsToUpdate: AssetInspectionItem[]): Promise<AppliedAssetUpdateResult> {
    const updated: AppliedAssetUpdateResult['updated'] = [];
    const restored: AppliedAssetUpdateResult['restored'] = [];
    const failed: AppliedAssetUpdateResult['failed'] = [];
    const batchToRecord: Array<{ type: AssetType; id: string; version: string }> = [];
    const agentDirs = getTargetAgentDirs(projectDir);

    for (const item of itemsToUpdate) {
        try {
            if (item.type === 'workflows') {
                const srcPath = join(packageRoot, 'assets/workflows', `${item.id}.md`);
                if (existsSync(srcPath)) {
                    for (const ad of agentDirs) {
                        const targetDir = join(projectDir, ad, 'workflows');
                        await mkdir(targetDir, { recursive: true });
                        await cp(srcPath, join(targetDir, `${item.id}.md`), { force: true });
                    }
                }
            } else if (item.type === 'rules') {
                const manifest = RULES.find((r) => r.id === item.id);
                if (manifest) {
                    const srcPath = join(packageRoot, 'assets/rules', manifest.sourceFile);
                    if (existsSync(srcPath)) {
                        for (const ad of agentDirs) {
                            const targetDir = join(projectDir, ad, 'rules');
                            await mkdir(targetDir, { recursive: true });
                            await cp(srcPath, join(targetDir, manifest.sourceFile), { force: true });
                        }
                    }
                }
            } else if (item.type === 'skills') {
                const srcPath = join(packageRoot, 'assets/skills', item.id);
                if (existsSync(srcPath)) {
                    for (const ad of agentDirs) {
                        const targetDir = join(projectDir, ad, 'skills', item.id);
                        await mkdir(targetDir, { recursive: true });
                        await cp(srcPath, targetDir, { recursive: true, force: true });
                    }
                }
            }

            batchToRecord.push({
                type: item.type,
                id: item.id,
                version: item.latestVersion,
            });

            if (item.status === 'missing') {
                restored.push({
                    type: item.type,
                    id: item.id,
                    version: item.latestVersion,
                });
            } else {
                updated.push({
                    type: item.type,
                    id: item.id,
                    fromVersion: item.installedVersion || 'unknown',
                    toVersion: item.latestVersion,
                });
            }
        } catch (err: any) {
            failed.push({
                type: item.type,
                id: item.id,
                error: err.message || String(err),
            });
        }
    }

    if (batchToRecord.length > 0) {
        await recordInstalledAssetsBatch(projectDir, batchToRecord);
    }

    return { updated, restored, failed };
}

/**
 * Prunes orphaned assets (removed upstream) from project agent directories and lockfile.
 */
export async function pruneAssetUpdates(projectDir: string, itemsToPrune: AssetInspectionItem[]): Promise<AppliedAssetPruneResult> {
    const pruned: AppliedAssetPruneResult['pruned'] = [];
    const failed: AppliedAssetPruneResult['failed'] = [];
    const agentDirs = AGENT_DIRS;

    for (const item of itemsToPrune) {
        try {
            const deletedPaths: string[] = [];
            for (const ad of agentDirs) {
                if (item.type === 'workflows') {
                    const filePath = join(projectDir, ad, 'workflows', `${item.id}.md`);
                    if (existsSync(filePath)) {
                        await rm(filePath, { force: true });
                        deletedPaths.push(join(ad, 'workflows', `${item.id}.md`));
                    }
                } else if (item.type === 'skills') {
                    const dirPath = join(projectDir, ad, 'skills', item.id);
                    if (existsSync(dirPath)) {
                        await rm(dirPath, { recursive: true, force: true });
                        deletedPaths.push(join(ad, 'skills', item.id));
                    }
                } else if (item.type === 'rules') {
                    const filePath = join(projectDir, ad, 'rules', `${item.id}.md`);
                    if (existsSync(filePath)) {
                        await rm(filePath, { force: true });
                        deletedPaths.push(join(ad, 'rules', `${item.id}.md`));
                    }
                }
            }

            await removeInstalledAsset(projectDir, item.type, item.id);
            pruned.push({
                type: item.type,
                id: item.id,
                paths: deletedPaths,
            });
        } catch (err: any) {
            failed.push({
                type: item.type,
                id: item.id,
                error: err.message || String(err),
            });
        }
    }

    return { pruned, failed };
}
