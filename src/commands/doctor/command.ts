import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { reportDoctorResultsStep, runDoctorChecksStep } from './actions/index.js';

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
            const checks = await runDoctorChecksStep();
            reportDoctorResultsStep(deps, checks);
        });
}
