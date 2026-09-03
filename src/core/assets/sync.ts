import { join } from 'node:path';
import { cp, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { WORKFLOWS } from '../../../assets/workflows/index.js';
import { SKILLS } from '../../../assets/skills/index.js';
import { RULES } from '../../../assets/rules/index.js';
import { resolvePackageRoot } from '@/core/runtime/package-root.js';
import { compareDecimalVersions } from './version.js';
import { readInstalledLockfile, recordInstalledAssetsBatch } from './lockfile.js';
import type { AssetInspectionItem, AssetType } from './types.js';

export interface AssetSyncResult {
    inspected: AssetInspectionItem[];
    outdated: AssetInspectionItem[];
    upToDate: AssetInspectionItem[];
}

export interface AppliedAssetUpdateResult {
    updated: Array<{ type: AssetType; id: string; fromVersion: string; toVersion: string }>;
    failed: Array<{ type: AssetType; id: string; error: string }>;
}

const packageRoot = resolvePackageRoot(import.meta.url);

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
        if (!manifest) continue;

        const latestVersion = manifest.version;
        const cmp = compareDecimalVersions(record.version, latestVersion);
        inspected.push({
            type: 'workflows',
            id: wfName,
            name: manifest.name,
            installedVersion: record.version,
            latestVersion,
            status: cmp < 0 ? 'outdated' : 'up-to-date',
        });
    }

    // Inspect Skills
    const installedSkills = lockfile.installed.skills || {};
    for (const [skillName, record] of Object.entries(installedSkills)) {
        const manifest = SKILLS.find((s) => s.name === skillName);
        if (!manifest) continue;

        const latestVersion = manifest.version;
        const cmp = compareDecimalVersions(record.version, latestVersion);
        inspected.push({
            type: 'skills',
            id: skillName,
            name: manifest.name,
            installedVersion: record.version,
            latestVersion,
            status: cmp < 0 ? 'outdated' : 'up-to-date',
        });
    }

    // Inspect Rules
    const installedRules = lockfile.installed.rules || {};
    for (const [ruleId, record] of Object.entries(installedRules)) {
        const manifest = RULES.find((r) => r.id === ruleId);
        if (!manifest) continue;

        const latestVersion = manifest.version;
        const cmp = compareDecimalVersions(record.version, latestVersion);
        inspected.push({
            type: 'rules',
            id: ruleId,
            name: manifest.id,
            installedVersion: record.version,
            latestVersion,
            status: cmp < 0 ? 'outdated' : 'up-to-date',
        });
    }

    const outdated = inspected.filter((i) => i.status === 'outdated');
    const upToDate = inspected.filter((i) => i.status === 'up-to-date');

    return {
        inspected,
        outdated,
        upToDate,
    };
}

/**
 * Updates selected or all outdated assets in the target project.
 */
export async function applyAssetUpdates(projectDir: string, itemsToUpdate: AssetInspectionItem[]): Promise<AppliedAssetUpdateResult> {
    const updated: AppliedAssetUpdateResult['updated'] = [];
    const failed: AppliedAssetUpdateResult['failed'] = [];
    const batchToRecord: Array<{ type: AssetType; id: string; version: string }> = [];

    for (const item of itemsToUpdate) {
        try {
            if (item.type === 'workflows') {
                const srcPath = join(packageRoot, 'assets/workflows', `${item.id}.md`);
                if (existsSync(srcPath)) {
                    // Find existing paths in common agent tool directories
                    const agentDirs = ['.agents', '.cursor', '.claude'];
                    for (const ad of agentDirs) {
                        const targetDir = join(projectDir, ad, 'workflows');
                        if (existsSync(targetDir)) {
                            await cp(srcPath, join(targetDir, `${item.id}.md`), { force: true });
                        }
                    }
                }
            } else if (item.type === 'rules') {
                const manifest = RULES.find((r) => r.id === item.id);
                if (manifest) {
                    const srcPath = join(packageRoot, 'assets/rules', manifest.sourceFile);
                    if (existsSync(srcPath)) {
                        const agentDirs = ['.agents', '.cursor', '.claude'];
                        for (const ad of agentDirs) {
                            const targetDir = join(projectDir, ad, 'rules');
                            if (existsSync(targetDir)) {
                                await cp(srcPath, join(targetDir, manifest.sourceFile), { force: true });
                            }
                        }
                    }
                }
            } else if (item.type === 'skills') {
                const srcPath = join(packageRoot, 'assets/skills', item.id);
                if (existsSync(srcPath)) {
                    const agentDirs = ['.agents', '.cursor', '.claude'];
                    for (const ad of agentDirs) {
                        const targetDir = join(projectDir, ad, 'skills', item.id);
                        if (existsSync(targetDir)) {
                            await cp(srcPath, targetDir, { recursive: true, force: true });
                        }
                    }
                }
            }

            batchToRecord.push({
                type: item.type,
                id: item.id,
                version: item.latestVersion,
            });

            updated.push({
                type: item.type,
                id: item.id,
                fromVersion: item.installedVersion || 'unknown',
                toVersion: item.latestVersion,
            });
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

    return { updated, failed };
}
