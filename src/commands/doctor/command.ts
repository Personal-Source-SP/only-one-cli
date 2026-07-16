import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { checkGit, checkNode } from '@/core/doctor/checks.js';

export function createDoctorCommand(deps: ProgramDeps): Command {
    return new Command('doctor')
        .description('🩺 Check environment readiness (Git and Node.js)')
        .helpOption('-h, --help', 'display help for command')
        .addHelpText(
            'after',
            '\nExamples:\n' +
                '  $ only-one doctor\n\n' +
                'Notes:\n' +
                '  - Ensures that git and a compatible Node.js version (>= 18) are installed in the system PATH.',
        )
        .action(async () => {
            const checks = await Promise.all([checkGit(), checkNode()]);

            let hasFailure = false;
            for (const check of checks) {
                if (check.ok) {
                    deps.stdout(`✓ ${check.name}: ${check.detail}`);
                } else {
                    hasFailure = true;
                    deps.stdout(`✗ ${check.name}: ${check.detail}`);
                    if (check.remediation) {
                        deps.stdout(`    → Remediation: ${check.remediation}`);
                    }
                }
            }

            if (hasFailure) {
                process.exitCode = 1;
            }
        });
}
