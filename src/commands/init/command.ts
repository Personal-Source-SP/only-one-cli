import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { executeInitCommand, printInitResult } from '@/core/init/init-command.js';
import type { InitCommandOptions } from './types.js';

export function createInitCommand(deps: ProgramDeps): Command {
    const cmd = new Command('init')
        .description('Initialize project with agent tools, packages, and custom skills')
        .argument('[path]', 'Project path')
        .option('--yes', 'Auto-confirm all existence checks')
        .option('--step <name>', 'Run only a specific step (tools, packages, skills)')
        .option('--skip <names>', 'Comma-separated steps to skip (tools, packages, skills)')
        .option('--combo <names>', 'Comma-separated combos of packages and skills to install');

    cmd.action(async (path: string | undefined, options: InitCommandOptions, command) => {
        const result = await executeInitCommand(deps, {
            command,
            json: Boolean(command.parent?.opts()?.json),
            path,
            options: { yes: options.yes, step: options.step, skip: options.skip, combo: options.combo },
        });

        if (!result) return;

        printInitResult(deps, Boolean(command.parent?.opts()?.json), result);
    });

    return cmd;
}
