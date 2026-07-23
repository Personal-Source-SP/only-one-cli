import type { ProgramDeps } from '@/cli/deps.js';
import { writeIgnoreTemplates } from '@/core/ignore/index.js';
import type { AllowedToolId } from '@/constants/allowed-tools.js';
import { COLORS } from '@/constants/index.js';
import { executePluginActions } from '@/core/plugin/index.js';
import { PLUGINS } from '@assets/plugins/index.js';

export const executeAndReportPluginsStep = async (
    deps: ProgramDeps,
    projectDir: string,
    selectedPluginIds: string[],
    targetIds: AllowedToolId[],
    targetId: AllowedToolId,
    ignoreTargets: import('@/core/ignore/index.js').IgnoreTarget[] = [],
): Promise<void> => {
    const perTargetPluginIds: Record<AllowedToolId, string[]> = {
        [targetId]: selectedPluginIds,
    } as Record<AllowedToolId, string[]>;

    deps.stdout('\nInstalling plugins...');

    const result = await executePluginActions({
        deps,
        projectDir,
        pluginManifests: PLUGINS,
        selectedPluginIds,
        targetIds,
        perTargetPluginIds,
    });

    deps.stdout('\n==================================================');
    deps.stdout('                PLUGIN INSTALL REPORT');
    deps.stdout('==================================================');

    if (result.summary.installed?.length) {
        deps.stdout(COLORS.success('\n✓ Successfully Installed:'));
        for (const item of result.summary.installed) {
            deps.stdout(`  - ${COLORS.primary(item)}`);
        }
    }

    if (result.summary.actionRequired?.length) {
        deps.stdout(COLORS.warning('\n[Action Required]:'));
        for (const item of result.summary.actionRequired) {
            deps.stdout(`  - ${COLORS.secondary(item)}`);
        }
    }

    if (result.summary.skipped?.length) {
        deps.stdout(COLORS.dim('\n- Skipped:'));
        for (const item of result.summary.skipped) {
            deps.stdout(`  - ${COLORS.dim(item)}`);
        }
    }

    if (result.summary.failed?.length) {
        deps.stdout(COLORS.error('\n✗ Failed:'));
        for (const item of result.summary.failed) {
            deps.stdout(`  - ${COLORS.error(item)}`);
        }
    }

    deps.stdout('\n==================================================\n');

    await writeIgnoreTemplates(projectDir, ignoreTargets);
};
