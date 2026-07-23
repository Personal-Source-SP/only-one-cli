import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import type { DoctorCheckResult } from '@/core/doctor/checks.js';

export const reportDoctorResultsStep = (deps: ProgramDeps, checks: DoctorCheckResult[]): void => {
    let hasFailure = false;
    for (const check of checks) {
        if (check.ok) {
            deps.stdout(COLORS.success(`✓ ${check.name}: ${check.detail}`));
        } else {
            hasFailure = true;
            deps.stdout(COLORS.error(`✗ ${check.name}: ${check.detail}`));
            if (check.remediation) {
                deps.stdout(COLORS.warning(`    → Remediation: ${check.remediation}`));
            }
        }
    }

    if (hasFailure) {
        process.exitCode = 1;
    }
};
