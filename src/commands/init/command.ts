import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import type { InitCommandOptions } from './types.js';
import { executeInitStep, executeInitSubcommandStep, runInitMcpStep } from './actions/index.js';

export function createInitCommand(deps: ProgramDeps): Command {
    const cmd = new Command('init')
        .description('🚀 Initialize project with tools, packages, and configurations')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .option('--tool <ids>', 'Comma-separated target agent IDs (antigravity, claude, cursor, codex)')
        .option('--ide <ids>', 'Comma-separated target IDE IDs (alias for --tool)')
        .option('--no-ignore', 'Skip updating the project .gitignore file with only-one directories')
        .option('--step <name>', 'Run only a single specific initialization step (choices: tools, packages, skills, configs)')
        .option('--skip <names>', 'Comma-separated list of steps to skip (choices: tools, packages, skills, configs)')
        .option('--combo <names>', 'Comma-separated names of predefined packages and skills combinations to install')
        .addHelpText(
            'after',
            `\n${COLORS.cli.header('Examples:')}\n` +
                `  ${COLORS.cli.command('$ only-one init')}\n` +
                `  ${COLORS.cli.command('$ only-one init --step skills --tool antigravity,claude')}\n` +
                `  ${COLORS.cli.command('$ only-one init --skip configs,packages /path/to/project')}\n\n` +
                `${COLORS.cli.header('Notes:')}\n` +
                `  - ${COLORS.dim('Modifies project configurations and installs custom agent skills.')}\n` +
                `  - ${COLORS.dim('Appends only-one patterns to your .gitignore unless --no-ignore is passed.')}`,
        )
        .action(async (path: string | undefined, options: InitCommandOptions, command) => {
            await executeInitStep(deps, path, options, command);
        });

    cmd.command('package')
        .description('📦 Install dependency packages only')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[names]', 'Comma-separated list of package names to install')
        .option('--target <ids>', 'Comma-separated target agent IDs for plugin packages (antigravity, claude, cursor, codex)')
        .option('--no-ignore', 'Skip updating the .gitignore file')
        .addHelpText(
            'after',
            `\n${COLORS.cli.header('Examples:')}\n` +
                `  ${COLORS.cli.command('$ only-one init package')}\n` +
                `  ${COLORS.cli.command('$ only-one init package /path/to/project superpowers --target antigravity,claude')}\n\n` +
                `${COLORS.cli.header('Notes:')}\n` +
                `  - ${COLORS.dim('Only executes the "packages" step of the initialization process.')}`,
        )
        .action(async (path: string | undefined, names: string | undefined, options: { target?: string; ignore?: boolean }, command) => {
            await executeInitSubcommandStep(
                deps,
                { path, step: 'packages', packages: names, target: options.target, ignore: options.ignore },
                command,
            );
        });

    cmd.command('skill')
        .description('🤖 Synchronize or install custom agent skills only')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[names]', 'Comma-separated list of specific skill names to sync')
        .option('--no-ignore', 'Skip updating the .gitignore file')
        .addHelpText(
            'after',
            `\n${COLORS.cli.header('Examples:')}\n` +
                `  ${COLORS.cli.command('$ only-one init skill')}\n` +
                `  ${COLORS.cli.command('$ only-one init skill /path/to/project custom-prompt,git-helper')}\n\n` +
                `${COLORS.cli.header('Notes:')}\n` +
                `  - ${COLORS.dim('Merges skill definitions into the workspace without altering other configurations.')}`,
        )
        .action(async (path: string | undefined, names: string | undefined, options: { ignore?: boolean }, command) => {
            await executeInitSubcommandStep(deps, { path, step: 'skills', skills: names, ignore: options.ignore }, command);
        });

    cmd.command('configs')
        .description('📁 Copy configuration templates only')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[names]', 'Comma-separated list of configuration template names to copy')
        .option('--no-ignore', 'Skip updating the .gitignore file')
        .addHelpText(
            'after',
            `\n${COLORS.cli.header('Examples:')}\n` +
                `  ${COLORS.cli.command('$ only-one init configs')}\n` +
                `  ${COLORS.cli.command('$ only-one init configs /path/to/project eslint,tsconfig')}\n\n` +
                `${COLORS.cli.header('Notes:')}\n` +
                `  - ${COLORS.dim('Useful when you want to reset or pull the latest config boilerplate.')}`,
        )
        .action(async (path: string | undefined, names: string | undefined, options: { ignore?: boolean }, command) => {
            await executeInitSubcommandStep(deps, { path, step: 'configs', configs: names, ignore: options.ignore }, command);
        });

    cmd.command('combo')
        .description('✨ Initialize project using predefined combos')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[names]', 'Comma-separated list of combo names to apply')
        .option('--no-ignore', 'Skip updating the .gitignore file')
        .addHelpText(
            'after',
            `\n${COLORS.cli.header('Examples:')}\n` +
                `  ${COLORS.cli.command('$ only-one init combo')}\n` +
                `  ${COLORS.cli.command('$ only-one init combo /path/to/project web-starter,node-ts')}\n\n` +
                `${COLORS.cli.header('Notes:')}\n` +
                `  - ${COLORS.dim('A combo is a shorthand to install multiple skills and packages in one command.')}`,
        )
        .action(async (path: string | undefined, names: string | undefined, options: { ignore?: boolean }, command) => {
            await executeInitSubcommandStep(deps, { path, combo: names, ignore: options.ignore }, command);
        });

    cmd.command('mcp')
        .description('🔌 Merge selected MCP servers into supported global configs')
        .helpOption('-h, --help', 'display help for command')
        .argument('[names]', 'Comma-separated list of MCP server IDs to configure')
        .option('--ide <ids>', 'Comma-separated IDE IDs to configure (antigravity, claude, cursor, codex)')
        .addHelpText(
            'after',
            `\n${COLORS.cli.header('Examples:')}\n` +
                `  ${COLORS.cli.command('$ only-one init mcp github,clockify --ide antigravity,claude,cursor,codex')}\n` +
                `  ${COLORS.cli.command('$ only-one init mcp')}\n\n` +
                `${COLORS.cli.header('Notes:')}\n` +
                `  - ${COLORS.dim('MCP config is global and supports Antigravity, Claude, Cursor, and Codex.')}\n` +
                `  - ${COLORS.dim('Existing MCP server IDs are skipped, not overwritten.')}\n` +
                `  - ${COLORS.dim('Secret placeholders are left empty for manual editing.')}`,
        )
        .action(async (names: string | undefined, options: { ide?: string }) => {
            await runInitMcpStep(deps, names, options);
        });

    return cmd;
}
