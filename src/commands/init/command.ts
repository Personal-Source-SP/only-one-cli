import { homedir } from 'node:os';
import { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { mcpIdeAdapters } from '@/core/mcp/adapters.js';
import { readMcpManifests } from '@/core/mcp/registry.js';
import { syncMcpGlobalConfig } from '@/core/mcp/sync.js';
import { executeInitCommand, printInitResult } from '@/core/init/init-command.js';
import type { InitCommandOptions } from './types.js';
import { COLORS } from '@/constants/index.js';

const parseCsv = (value?: string): string[] =>
    value
        ?.split(',')
        .map((entry) => entry.trim())
        .filter(Boolean) ?? [];

const runInitMcp = async (deps: ProgramDeps, names?: string, options?: { ide?: string; yes?: boolean }): Promise<void> => {
    const { manifests, warnings } = await readMcpManifests();
    for (const warning of warnings) deps.stdout(COLORS.warning(`Warning: skipped ${warning.file}: ${warning.message}`));
    if (!manifests.length) throw new Error('No MCP manifests available');

    const requestedMcpIds = parseCsv(names);
    let selectedMcpIds = requestedMcpIds;
    if (!selectedMcpIds.length) {
        if (options?.yes || !deps.prompts?.checkbox) {
            selectedMcpIds = manifests.map((manifest) => manifest.id);
        } else {
            selectedMcpIds = await deps.prompts.checkbox({
                message: 'Select MCP servers to configure',
                choices: manifests.map((manifest) => ({ name: manifest.id, value: manifest.id })),
            });
        }
    }
    if (!selectedMcpIds.length) throw new Error('Select at least one MCP server');

    const selectedManifests = selectedMcpIds.map((id) => {
        const manifest = manifests.find((entry) => entry.id === id);
        if (!manifest) throw new Error(`Unknown MCP '${id}'`);
        return manifest;
    });

    let selectedIdeIds = parseCsv(options?.ide);
    if (!selectedIdeIds.length && deps.prompts?.checkbox) {
        selectedIdeIds = await deps.prompts.checkbox({
            message: 'Select IDEs for global MCP config',
            choices: mcpIdeAdapters.map((adapter) => ({ name: adapter.name, value: adapter.id })),
        });
    }
    if (!selectedIdeIds.length) selectedIdeIds = mcpIdeAdapters.map((adapter) => adapter.id);

    const response = await syncMcpGlobalConfig({
        cwd: deps.cwd,
        homeDir: deps.env.HOME || deps.env.USERPROFILE || homedir(),
        ideIds: selectedIdeIds,
        manifests: selectedManifests,
        platform: process.platform,
        write: deps.stdout,
    });

    for (const result of response.results) {
        deps.stdout(`${COLORS.primary(result.ideName)}: ${COLORS.dim(result.configPath)}`);
        for (const entry of result.results) {
            const keys = entry.credentialKeys.length ? `; fill manually: ${entry.credentialKeys.join(', ')}` : '';
            const statusColor = entry.status === 'added' || entry.status === 'unchanged' ? COLORS.success : COLORS.warning;
            deps.stdout(`  ${COLORS.secondary(entry.id)}: ${statusColor(entry.status)}${COLORS.warning(keys)}`);
        }
    }
};

export function createInitCommand(deps: ProgramDeps): Command {
    const cmd = new Command('init')
        .description('🚀 Initialize project with tools, packages, and configurations')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .option('--yes', 'Automatically confirm existence checks and overwrite prompts')
        .option('--no-ignore', 'Skip updating the project .gitignore file with only-one directories')
        .option('--step <name>', 'Run only a single specific initialization step (choices: tools, packages, skills, configs)')
        .option('--skip <names>', 'Comma-separated list of steps to skip (choices: tools, packages, skills, configs)')
        .option('--combo <names>', 'Comma-separated names of predefined packages and skills combinations to install')
        .addHelpText(
            'after',
            `\n${COLORS.cli.header('Examples:')}\n` +
                `  ${COLORS.cli.command('$ only-one init')}\n` +
                `  ${COLORS.cli.command('$ only-one init --step skills --yes')}\n` +
                `  ${COLORS.cli.command('$ only-one init --skip configs,packages /path/to/project')}\n\n` +
                `${COLORS.cli.header('Notes:')}\n` +
                `  - ${COLORS.dim('Modifies project configurations and installs custom agent skills.')}\n` +
                `  - ${COLORS.dim('Appends only-one patterns to your .gitignore unless --no-ignore is passed.')}`,
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
        .description('📦 Install dependency packages only')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[names]', 'Comma-separated list of package names to install')
        .option('--yes', 'Automatically confirm prompts')
        .option('--no-ignore', 'Skip updating the .gitignore file')
        .addHelpText(
            'after',
            `\n${COLORS.cli.header('Examples:')}\n` +
                `  ${COLORS.cli.command('$ only-one init package')}\n` +
                `  ${COLORS.cli.command('$ only-one init package /path/to/project lodash,typescript --yes')}\n\n` +
                `${COLORS.cli.header('Notes:')}\n` +
                `  - ${COLORS.dim('Only executes the "packages" step of the initialization process.')}`,
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
        .description('🤖 Synchronize or install custom agent skills only')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[names]', 'Comma-separated list of specific skill names to sync')
        .option('--yes', 'Automatically confirm prompts')
        .option('--no-ignore', 'Skip updating the .gitignore file')
        .addHelpText(
            'after',
            `\n${COLORS.cli.header('Examples:')}\n` +
                `  ${COLORS.cli.command('$ only-one init skill')}\n` +
                `  ${COLORS.cli.command('$ only-one init skill /path/to/project custom-prompt,git-helper')}\n\n` +
                `${COLORS.cli.header('Notes:')}\n` +
                `  - ${COLORS.dim('Merges skill definitions into the workspace without altering other configurations.')}`,
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
        .description('📁 Copy configuration templates only')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[names]', 'Comma-separated list of configuration template names to copy')
        .option('--yes', 'Automatically confirm prompts')
        .option('--no-ignore', 'Skip updating the .gitignore file')
        .addHelpText(
            'after',
            `\n${COLORS.cli.header('Examples:')}\n` +
                `  ${COLORS.cli.command('$ only-one init configs')}\n` +
                `  ${COLORS.cli.command('$ only-one init configs /path/to/project eslint,tsconfig')}\n\n` +
                `${COLORS.cli.header('Notes:')}\n` +
                `  - ${COLORS.dim('Useful when you want to reset or pull the latest config boilerplate.')}`,
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
        .description('✨ Initialize project using predefined combos')
        .helpOption('-h, --help', 'display help for command')
        .argument('[path]', 'Target project directory path (default: current directory)')
        .argument('[names]', 'Comma-separated list of combo names to apply')
        .option('--yes', 'Automatically confirm prompts')
        .option('--no-ignore', 'Skip updating the .gitignore file')
        .addHelpText(
            'after',
            `\n${COLORS.cli.header('Examples:')}\n` +
                `  ${COLORS.cli.command('$ only-one init combo')}\n` +
                `  ${COLORS.cli.command('$ only-one init combo /path/to/project web-starter,node-ts')}\n\n` +
                `${COLORS.cli.header('Notes:')}\n` +
                `  - ${COLORS.dim('A combo is a shorthand to install multiple skills and packages in one command.')}`,
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

    cmd.command('mcp')
        .description('🔌 Merge selected MCP servers into global Cursor or Antigravity config')
        .helpOption('-h, --help', 'display help for command')
        .argument('[names]', 'Comma-separated list of MCP server IDs to configure')
        .option('--ide <ids>', 'Comma-separated IDE IDs to configure (cursor, antigravity)')
        .option('--yes', 'Automatically use defaults when prompts are unavailable')
        .addHelpText(
            'after',
            `\n${COLORS.cli.header('Examples:')}\n` +
                `  ${COLORS.cli.command('$ only-one init mcp github,clockify --ide cursor,antigravity')}\n` +
                `  ${COLORS.cli.command('$ only-one init mcp')}\n\n` +
                `${COLORS.cli.header('Notes:')}\n` +
                `  - ${COLORS.dim('MCP config is global and currently supports Cursor and Antigravity.')}\n` +
                `  - ${COLORS.dim('Existing MCP server IDs are skipped, not overwritten.')}\n` +
                `  - ${COLORS.dim('Secret placeholders are left empty for manual editing.')}`,
        )
        .action(async (names: string | undefined, options: { ide?: string; yes?: boolean }) => {
            await runInitMcp(deps, names, options);
        });

    return cmd;
}
