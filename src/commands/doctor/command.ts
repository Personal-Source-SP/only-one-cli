import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { checkGit, checkNode } from '@/core/doctor/checks.js';
import { COLORS } from '@/constants/index.js';

export function createDoctorCommand(deps: ProgramDeps): Command {
    return new Command('doctor')
        .description('🩺 Check environment readiness (Git and Node.js)')
        .helpOption('-h, --help', 'display help for command')
        .addHelpText(
            'after',
            `\n${COLORS.cli.header('Examples:')}\n` +
                `  ${COLORS.cli.command('$ only-one doctor')}\n\n` +
                `${COLORS.cli.header('Notes:')}\n` +
                `  - ${COLORS.dim('Ensures that git and a compatible Node.js version (>= 18) are installed in the system PATH.')}`,
        )
        .action(async () => {
            const checks = await Promise.all([checkGit(), checkNode()]);

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
        });
}
