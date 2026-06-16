import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { executeInitCommand, printInitResult } from '@/core/init/init-command.js';
import type { InitCommandOptions } from './types.js';

export function createInitCommand(deps: ProgramDeps): Command {
    const cmd = new Command('init')
        .description('Initialize project with openspec CLI and custom agent skills')
        .option('--force', 'Pass --force to openspec init')
        .option('--no-install-skill', 'Skip openspec bootstrapping and custom skills sync')
        .option('--tools <tools>', 'Agent tools: all, none, or comma-separated ids (cursor, claude, opencode, …)');

    cmd.action(async (options: InitCommandOptions, command) => {
        const installSkill = options.installSkill !== false;

        const result = await executeInitCommand(deps, {
            command,
            json: Boolean(command.parent?.opts()?.json),
            options: { force: options.force, installSkill, tools: options.tools },
        });

        if (!result) return;

        printInitResult(deps, Boolean(command.parent?.opts()?.json), result);
    });

    return cmd;
}
