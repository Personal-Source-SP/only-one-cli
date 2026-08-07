import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import type { CheckResult } from '@/core/doctor/checks.js';

export const reportDoctorResultsStep = (deps: ProgramDeps, checks: CheckResult[]): void => {
    let hasFailure = false;
    let currentCategory = '';

    for (const check of checks) {
        const category = check.category || 'General';
        if (category !== currentCategory) {
            currentCategory = category;
            deps.stdout(`\n${COLORS.cli.header(`[ ${currentCategory} ]`)}`);
        }

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

    deps.stdout('');
    if (hasFailure) {
        process.exitCode = 1;
    }
};
