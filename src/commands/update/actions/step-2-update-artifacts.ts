import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { formatUpdateHumanLines, updateAgentArtifacts } from '@/core/agent/update.js';
import { printJson } from '@/core/output/index.js';
import { inspectAssetUpdates, applyAssetUpdates, pruneAssetUpdates } from '@/core/assets/sync.js';
import type { UpdateCommandOptions } from '../types.js';

export const updateArtifactsStep = async (
    deps: ProgramDeps,
    projectDir: string,
    options: UpdateCommandOptions,
    isJsonOutput: boolean,
): Promise<void> => {
    const result = await updateAgentArtifacts({ force: options.force, projectDir });
    const assetSync = await inspectAssetUpdates(projectDir);

    let assetUpdateResult = null;
    const itemsToUpdate = options.force
        ? assetSync.inspected.filter((i) => i.status !== 'removed')
        : [...assetSync.outdated, ...assetSync.missing];

    if (itemsToUpdate.length > 0) {
        assetUpdateResult = await applyAssetUpdates(projectDir, itemsToUpdate);
    }

    let assetPruneResult = null;
    if (options.prune && assetSync.removed.length > 0) {
        assetPruneResult = await pruneAssetUpdates(projectDir, assetSync.removed);
    }

    if (isJsonOutput) {
        printJson({ ...result, assets: { ...assetSync, applied: assetUpdateResult, pruned: assetPruneResult } }, deps.stdout);
        return;
    }

    const lines = formatUpdateHumanLines(result);
    if (lines?.length) {
        deps.stdout(COLORS.success(lines[0]));
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes('skill:') || line.includes('command:')) {
                deps.stdout(`  ${COLORS.primary(line.trim())}`);
            } else {
                deps.stdout(COLORS.dim(line));
            }
        }
    }

    if (assetSync.inspected.length > 0) {
        deps.stdout(`\n${COLORS.cli.header('Tracked Asset Status:')}`);
        for (const item of assetSync.inspected) {
            let statusBadge: string;
            if (item.status === 'outdated') {
                statusBadge = COLORS.warning(`▲ Outdated (${item.installedVersion} -> ${item.latestVersion})`);
            } else if (item.status === 'missing') {
                statusBadge = COLORS.warning(`▲ Missing (${item.installedVersion} -> Restoring...)`);
            } else if (item.status === 'removed') {
                statusBadge = COLORS.error(`✕ Removed upstream (Orphaned)`);
            } else {
                statusBadge = COLORS.success(`✓ Up to date (${item.latestVersion})`);
            }
            deps.stdout(`  [${item.type}] ${COLORS.secondary(item.name)}: ${statusBadge}`);
        }

        if (assetUpdateResult && assetUpdateResult.updated.length > 0) {
            deps.stdout(`\n${COLORS.success('✓ Updated Assets:')}`);
            for (const u of assetUpdateResult.updated) {
                deps.stdout(`  - [${u.type}] ${COLORS.secondary(u.id)}: ${u.fromVersion} -> ${COLORS.primary(u.toVersion)}`);
            }
        }

        if (assetUpdateResult && assetUpdateResult.restored.length > 0) {
            deps.stdout(`\n${COLORS.success('✓ Restored Missing Assets:')}`);
            for (const r of assetUpdateResult.restored) {
                deps.stdout(`  - [${r.type}] ${COLORS.secondary(r.id)}: Restored template (${COLORS.primary(r.version)})`);
            }
        }

        if (assetPruneResult && assetPruneResult.pruned.length > 0) {
            deps.stdout(`\n${COLORS.success('🗑️ Pruned Orphaned Assets:')}`);
            for (const p of assetPruneResult.pruned) {
                deps.stdout(`  - [${p.type}] ${COLORS.secondary(p.id)}: Removed from disk and lockfile`);
            }
        } else if (!options.prune && assetSync.removed.length > 0) {
            deps.stdout(`\n${COLORS.warning(`⚠️ Found ${assetSync.removed.length} orphaned asset(s) no longer provided upstream:`)}`);
            for (const r of assetSync.removed) {
                deps.stdout(`  - [${r.type}] ${COLORS.secondary(r.id)}`);
            }
            deps.stdout(COLORS.dim('  Run "only-one update --prune" to remove leftover files and clean lockfile.'));
        } else if (assetSync.outdated.length === 0 && assetSync.missing.length === 0 && assetSync.removed.length === 0) {
            deps.stdout(COLORS.dim('  All tracked assets are already up to date.'));
        }
    }
};
