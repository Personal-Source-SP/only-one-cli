import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import type { CheckResult } from '@/core/doctor/checks.js';

export const reportDoctorResultsStep = (deps: ProgramDeps, checks: CheckResult[]): void => {
    let hasFailure = false;

    // Group items by category
    const categorized = checks.reduce<Record<string, CheckResult[]>>((acc, item) => {
        const cat = item.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    for (const [category, items] of Object.entries(categorized)) {
        deps.stdout(`\n${COLORS.cli.header(`[ ${category} ]`)}`);

        // Sort items inside category: ok (true) first, missing (false) last
        const sortedItems = [...items].sort((a, b) => (a.ok === b.ok ? 0 : a.ok ? -1 : 1));

        for (const check of sortedItems) {
            if (check.ok) {
                deps.stdout(COLORS.success(`  ✓ ${check.name}: ${check.detail}`));
            } else {
                if (check.required) {
                    hasFailure = true;
                }
                deps.stdout(COLORS.error(`  ✗ ${check.name}: ${check.detail}`));
                if (check.remediation) {
                    deps.stdout(COLORS.warning(`      → Remediation: ${check.remediation}`));
                }
            }
        }
    }

    deps.stdout('');
    if (hasFailure) {
        process.exitCode = 1;
    }
};
