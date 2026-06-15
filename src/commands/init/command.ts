import { Command } from 'commander';
import type { ProgramDeps } from '../../cli/deps.js';
import { executeInitCommand, printInitResult } from '../../core/init/init-command.js';
import type { InitCommandOptions } from './types.js';

const DEPRECATED_FLAGS = {
    server: '--server is deprecated; use openspec init directly',
    projectName: '--project-name is deprecated; use openspec init directly',
    indexMode: '--index-mode is deprecated; use openspec init directly',
    sourceUri: '--source-uri is deprecated; use openspec init directly',
    defaultBranch: '--default-branch is deprecated; use openspec init directly',
    gitToken: '--git-token is deprecated; use openspec init directly',
} as const;

const warnDeprecated = (options: Record<string, unknown>, warn: (msg: string) => void): void => {
    for (const [key, message] of Object.entries(DEPRECATED_FLAGS)) {
        if (options[key] !== undefined) {
            warn(message);
        }
    }
};

export function createInitCommand(deps: ProgramDeps): Command {
    const cmd = new Command('init')
        .description('Initialize project with openspec CLI and custom agent skills')
        .option('--force', 'Pass --force to openspec init')
        .option('--no-install-skill', 'Skip openspec bootstrapping and custom skills sync')
        .option('--tools <tools>', 'Agent tools: all, none, or comma-separated ids (cursor, claude, opencode, …)')
        .argument('[path]', 'Project directory (default: current directory)');

    for (const [key, message] of Object.entries(DEPRECATED_FLAGS)) {
        const flag = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase() + ' <value>';
        cmd.option(flag, '[deprecated] ' + message);
    }

    cmd.action(async (path: string | undefined, options: InitCommandOptions, command) => {
        const installSkill = options.installSkill !== false;

        warnDeprecated(options as Record<string, unknown>, (msg) => deps.stdout(`[deprecated] ${msg}`));

        const result = await executeInitCommand(deps, {
            command,
            json: Boolean(command.parent?.opts()?.json),
            options: { force: options.force, installSkill, tools: options.tools },
            path,
        });

        if (!result) {
            return;
        }

        printInitResult(deps, Boolean(command.parent?.opts()?.json), result);
    });

    return cmd;
}
