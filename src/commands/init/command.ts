import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { executeInitCommand, printInitResult } from '@/core/init/init-command.js';
import type { InitCommandOptions } from './types.js';

export function createInitCommand(deps: ProgramDeps): Command {
    const cmd = new Command('init')
        .description('Initialize project with agent tools, packages, and custom skills')
        .argument('[path]', 'Project path')
        .option('--yes', 'Auto-confirm all existence checks')
        .option('--no-ignore', 'Do not update .gitignore with configured directories')
        .option('--step <name>', 'Run only a specific step (tools, packages, skills, configs)')
        .option('--skip <names>', 'Comma-separated steps to skip (tools, packages, skills, configs)')
        .option('--combo <names>', 'Comma-separated combos of packages and skills to install');

    cmd.action(async (path: string | undefined, options: InitCommandOptions, command) => {
        const result = await executeInitCommand(deps, {
            command,
            json: Boolean(command.parent?.opts()?.json),
            path,
            options: {
                yes: options.yes,
                step: options.step,
                skip: options.skip,
                combo: options.combo,
                noIgnore: options.ignore === false,
            },
        });

        if (!result) return;

        printInitResult(deps, Boolean(command.parent?.opts()?.json), result);
    });

    cmd.command('package')
        .description('Install packages only')
        .argument('[path]', 'Project path')
        .argument('[names]', 'Comma-separated package names to install')
        .option('--yes', 'Auto-confirm all existence checks')
        .option('--no-ignore', 'Do not update .gitignore')
        .action(async (path: string | undefined, names: string | undefined, options: { yes?: boolean; ignore?: boolean }, command) => {
            const noIgnore = options.ignore === false || command.parent?.opts()?.ignore === false;
            const result = await executeInitCommand(deps, {
                command,
                json: Boolean(command.parent?.parent?.opts()?.json),
                path,
                options: { yes: options.yes, noIgnore, step: 'packages', packages: names },
            });
            if (!result) return;
            printInitResult(deps, Boolean(command.parent?.parent?.opts()?.json), result);
        });

    cmd.command('skill')
        .description('Sync skills only')
        .argument('[path]', 'Project path')
        .argument('[names]', 'Comma-separated skill names to sync')
        .option('--yes', 'Auto-confirm all existence checks')
        .option('--no-ignore', 'Do not update .gitignore')
        .action(async (path: string | undefined, names: string | undefined, options: { yes?: boolean; ignore?: boolean }, command) => {
            const noIgnore = options.ignore === false || command.parent?.opts()?.ignore === false;
            const result = await executeInitCommand(deps, {
                command,
                json: Boolean(command.parent?.parent?.opts()?.json),
                path,
                options: { yes: options.yes, noIgnore, step: 'skills', skills: names },
            });
            if (!result) return;
            printInitResult(deps, Boolean(command.parent?.parent?.opts()?.json), result);
        });

    cmd.command('configs')
        .description('Copy configuration templates only')
        .argument('[path]', 'Project path')
        .argument('[names]', 'Comma-separated configuration template names')
        .option('--yes', 'Auto-confirm all existence checks')
        .option('--no-ignore', 'Do not update .gitignore')
        .action(async (path: string | undefined, names: string | undefined, options: { yes?: boolean; ignore?: boolean }, command) => {
            const noIgnore = options.ignore === false || command.parent?.opts()?.ignore === false;
            const result = await executeInitCommand(deps, {
                command,
                json: Boolean(command.parent?.parent?.opts()?.json),
                path,
                options: { yes: options.yes, noIgnore, step: 'configs', configs: names },
            });
            if (!result) return;
            printInitResult(deps, Boolean(command.parent?.parent?.opts()?.json), result);
        });

    cmd.command('combo')
        .description('Initialize project from predefined combos')
        .argument('[path]', 'Project path')
        .argument('[names]', 'Comma-separated combo names')
        .option('--yes', 'Auto-confirm all existence checks')
        .option('--no-ignore', 'Do not update .gitignore')
        .action(async (path: string | undefined, names: string | undefined, options: { yes?: boolean; ignore?: boolean }, command) => {
            const noIgnore = options.ignore === false || command.parent?.opts()?.ignore === false;
            const result = await executeInitCommand(deps, {
                command,
                json: Boolean(command.parent?.parent?.opts()?.json),
                path,
                options: { yes: options.yes, noIgnore, combo: names },
            });
            if (!result) return;
            printInitResult(deps, Boolean(command.parent?.parent?.opts()?.json), result);
        });

    return cmd;
}
