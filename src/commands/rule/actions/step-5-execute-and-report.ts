import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { installRules } from '@/core/rule/index.js';
import type { AllowedTarget } from '@/core/target-selection/catalog.js';

export const executeAndReportRulesStep = async (
    deps: ProgramDeps,
    projectDir: string,
    targetTools: AllowedTarget[],
    selectedRuleIds: string[],
    overwriteList: string[],
): Promise<void> => {
    deps.stdout('\nSyncing rules...');

    const { results } = await installRules({
        deps,
        projectDir,
        selectedTargets: targetTools,
        ruleIds: selectedRuleIds,
        overwriteList,
    });

    deps.stdout('\n==================================================');
    deps.stdout('                RULE SYNC REPORT');
    deps.stdout('==================================================');

    const successes = results.filter((r) => r.status === 'success');
    const notReady = results.filter((r) => r.status === 'installed_not_ready');
    const overwrites = results.filter((r) => r.status === 'overwritten');
    const skips = results.filter((r) => r.status === 'skipped');
    const failures = results.filter((r) => r.status === 'failed');

    if (successes.length > 0) {
        deps.stdout(COLORS.success('\n✓ Successfully Installed:'));
        for (const r of successes) {
            deps.stdout(`  - ${COLORS.secondary(r.ruleId)} -> ${COLORS.primary(r.toolName)}`);
        }
    }

    if (notReady.length > 0) {
        deps.stdout(COLORS.warning('\n! Installed (Action Required / Pending Dependencies):'));
        for (const r of notReady) {
            deps.stdout(`  - ${COLORS.secondary(r.ruleId)} -> ${COLORS.primary(r.toolName)}: ${r.details || 'Pending action'}`);
        }
    }

    if (overwrites.length > 0) {
        deps.stdout(COLORS.success('\n✓ Overwritten:'));
        for (const r of overwrites) {
            deps.stdout(`  - ${COLORS.secondary(r.ruleId)} -> ${COLORS.primary(r.toolName)} [Overwritten]`);
        }
    }

    if (skips.length > 0) {
        deps.stdout(COLORS.dim('\n- Skipped:'));
        for (const r of skips) {
            deps.stdout(`  - ${COLORS.secondary(r.ruleId)} in ${COLORS.primary(r.toolName)}`);
        }
    }

    if (failures.length > 0) {
        deps.stdout(COLORS.error('\n✗ Failed:'));
        for (const r of failures) {
            deps.stdout(`  - ${COLORS.secondary(r.ruleId)} in ${COLORS.primary(r.toolName)}: ${COLORS.error(r.error || '')}`);
        }
    }

    deps.stdout('\n==================================================\n');
};
