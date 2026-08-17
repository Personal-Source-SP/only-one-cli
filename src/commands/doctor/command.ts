import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { reportDoctorResultsStep, runDoctorChecksStep } from './actions/index.js';
import type { DoctorCommandOptions } from '@/core/doctor/types.js';
import { selectSingleAllowedVsSettingsTarget, getAllowedVsSettingsTargets } from '@/core/target-selection/index.js';

export function createDoctorCommand(deps: ProgramDeps): Command {
    return new Command('doctor')
        .description('🩺 Check environment readiness, tools, IDE settings, and agent assets')
        .option('-e, --editor <editor>', 'Target IDE editor (vscode, cursor, antigravity, all)')
        .helpOption('-h, --help', 'display help for command')
        .addHelpText(
            'after',
            `\n${COLORS.cli.header('Examples:')}\n` +
                `  ${COLORS.cli.command('$ only-one doctor')}\n` +
                `  ${COLORS.cli.command('$ only-one doctor --editor cursor')}\n\n` +
                `${COLORS.cli.header('Notes:')}\n` +
                `  - ${COLORS.dim('Checks Node.js, npm, nvm, GitNexus, target IDE settings, MCP, skills, rules, ignore files, and extensions.')}`,
        )
        .action(async (options: DoctorCommandOptions) => {
            let targetEditorId = options.editor;

            if (!targetEditorId && deps.prompts?.select) {
                const choices = [
                    ...getAllowedVsSettingsTargets().map((t) => ({ name: t.vs?.name || t.id, value: t.id })),
                    { name: 'Check All Supported IDEs', value: 'all' },
                ];
                targetEditorId = await deps.prompts.select({
                    message: 'Select target IDE for doctor checks:',
                    choices,
                });
            }

            const checks = await runDoctorChecksStep({ targetEditorId: targetEditorId || 'vscode' });
            reportDoctorResultsStep(deps, checks);
        });
}
