import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { formatUpdateHumanLines, updateAgentArtifacts } from '@/core/agent/update.js';
import { printJson } from '@/core/output/index.js';
import { inspectAssetUpdates, applyAssetUpdates } from '@/core/assets/sync.js';
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
    const itemsToUpdate = options.force ? assetSync.inspected : assetSync.outdated;
    if (itemsToUpdate.length > 0) {
        assetUpdateResult = await applyAssetUpdates(projectDir, itemsToUpdate);
    }

    if (isJsonOutput) {
        printJson({ ...result, assets: { ...assetSync, applied: assetUpdateResult } }, deps.stdout);
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
            const statusBadge =
                item.status === 'outdated'
                    ? COLORS.warning(`▲ Outdated (${item.installedVersion} -> ${item.latestVersion})`)
                    : COLORS.success(`✓ Up to date (${item.latestVersion})`);
            deps.stdout(`  [${item.type}] ${COLORS.secondary(item.name)}: ${statusBadge}`);
        }

        if (assetUpdateResult && assetUpdateResult.updated.length > 0) {
            deps.stdout(`\n${COLORS.success('✓ Updated Assets:')}`);
            for (const u of assetUpdateResult.updated) {
                deps.stdout(`  - [${u.type}] ${COLORS.secondary(u.id)}: ${u.fromVersion} -> ${COLORS.primary(u.toVersion)}`);
            }
        } else if (assetSync.outdated.length === 0) {
            deps.stdout(COLORS.dim('  All tracked assets are already up to date.'));
        }
    }
};
