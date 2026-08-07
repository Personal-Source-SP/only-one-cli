import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import type { GitCommandOptions } from './types.js';
import { executeGitCommandStep } from './actions/execute.js';

export function createGitCommand(deps: ProgramDeps): Command {
    return new Command('git')
        .description('⚡  Setup and sync Git Bash & shell profiles (.bashrc, .zshrc) for Win & Mac')
        .argument('[target]', 'Target profile to sync (e.g. bash, zsh, all)')
        .option('--profile <type>', 'Profile type (choices: bash, zsh, all)')
        .option('--snippets <ids>', 'Comma-separated list of snippet IDs to include (e.g. nvm,git-alias)')
        .option('--all', 'Include all available snippet modules')
        .option('--force', 'Bypass prompt confirmation', false)
        .addHelpText(
            'after',
            `\n${COLORS.cli.header('Examples:')}\n` +
                `  ${COLORS.cli.command('$ only-one git')}\n` +
                `  ${COLORS.cli.command('$ only-one git --snippets nvm,git-alias')}\n` +
                `  ${COLORS.cli.command('$ only-one git bash --all')}\n`,
        )
        .action(async (targetArg?: string, options?: GitCommandOptions) => {
            await executeGitCommandStep(deps, targetArg, options ?? {});
        });
}
