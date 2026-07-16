import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { executeInitCommand, printInitResult } from '@/core/init/init-command.js';
import type { InitCommandOptions } from './types.js';

export function createInitCommand(deps: ProgramDeps): Command {
    const cmd = new Command('init')
        .description('Initialize a project directory with development tools, dependency packages, custom skills, and configurations.')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .option('--yes', 'Automatically confirm existence checks and overwrite prompts')
        .option('--no-ignore', 'Skip updating the project .gitignore file with only-one directories')
        .option('--step <name>', 'Run only a single specific initialization step (choices: tools, packages, skills, configs)')
        .option('--skip <names>', 'Comma-separated list of steps to skip (choices: tools, packages, skills, configs)')
        .option('--combo <names>', 'Comma-separated names of predefined packages and skills combinations to install')
        .addHelpText(
            'after',
            '\nExamples:\n' +
                '  $ only-one init\n' +
                '  $ only-one init --step skills --yes\n' +
                '  $ only-one init --skip configs,packages /path/to/project\n\n' +
                'Notes:\n' +
                '  - Modifies project configurations and installs custom agent skills.\n' +
                '  - Appends only-one patterns to your .gitignore unless --no-ignore is passed.',
        );

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
        .description('Install dependency packages only (e.g., helpers, linters, or libraries).')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[names]', 'Comma-separated list of package names to install')
        .option('--yes', 'Automatically confirm prompts')
        .option('--no-ignore', 'Skip updating the .gitignore file')
        .addHelpText(
            'after',
            '\nExamples:\n' +
                '  $ only-one init package\n' +
                '  $ only-one init package /path/to/project lodash,typescript --yes\n\n' +
                'Notes:\n' +
                '  - Only executes the "packages" step of the initialization process.',
        )
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
        .description('Synchronize or install custom agent skills only.')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[names]', 'Comma-separated list of specific skill names to sync')
        .option('--yes', 'Automatically confirm prompts')
        .option('--no-ignore', 'Skip updating the .gitignore file')
        .addHelpText(
            'after',
            '\nExamples:\n' +
                '  $ only-one init skill\n' +
                '  $ only-one init skill /path/to/project custom-prompt,git-helper\n\n' +
                'Notes:\n' +
                '  - Merges skill definitions into the workspace without altering other configurations.',
        )
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
        .description('Copy configuration templates only to the project.')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[names]', 'Comma-separated list of configuration template names to copy')
        .option('--yes', 'Automatically confirm prompts')
        .option('--no-ignore', 'Skip updating the .gitignore file')
        .addHelpText(
            'after',
            '\nExamples:\n' +
                '  $ only-one init configs\n' +
                '  $ only-one init configs /path/to/project eslint,tsconfig\n\n' +
                'Notes:\n' +
                '  - Useful when you want to reset or pull the latest config boilerplate.',
        )
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
        .description('Initialize the project using predefined combos (bundled packages & skills).')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[names]', 'Comma-separated list of combo names to apply')
        .option('--yes', 'Automatically confirm prompts')
        .option('--no-ignore', 'Skip updating the .gitignore file')
        .addHelpText(
            'after',
            '\nExamples:\n' +
                '  $ only-one init combo\n' +
                '  $ only-one init combo /path/to/project web-starter,node-ts\n\n' +
                'Notes:\n' +
                '  - A combo is a shorthand to install multiple skills and packages in one command.',
        )
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
