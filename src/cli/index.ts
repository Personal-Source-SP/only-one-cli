import { Command, Help } from 'commander';
import pc from 'picocolors';
import {
    createDoctorCommand,
    createExtensionsVsCommand,
    createInitCommand,
    createStructureGenerateCommand,
    createUpdateCommand,
    createSettingVsCommand,
    createSkillCommand,
    createPluginCommand,
    createRuleCommand,
    createMcpCommand,
    createComboCommand,
} from '@/commands/index.js';
import { COLORS, VERSION } from '@/constants/index.js';
import type { ProgramDeps } from './deps.js';

export function createProgram(deps: ProgramDeps) {
    const program = new Command('only-one');

    function configureCommandHelp(cmd: Command) {
        cmd.configureHelp({
            commandUsage: (c) => COLORS.cli.command(c.name() + (c.usage() ? ' ' + c.usage() : '')),
            subcommandTerm: (c) => COLORS.cli.command(c.name() + (c.usage() ? ' ' + c.usage() : '')),
            optionTerm: (opt) => COLORS.cli.option(opt.flags),
            argumentTerm: (arg) => COLORS.cli.option(arg.name()),
            commandDescription: (c) => COLORS.cli.description(c.description()),
            subcommandDescription: (c) => COLORS.cli.description(c.description()),
            optionDescription: (opt) => COLORS.cli.description(opt.description),
            argumentDescription: (arg) => COLORS.cli.description(arg.description),
            formatHelp: (c, helper) => {
                const rawHelp = Help.prototype.formatHelp.call(helper, c, helper);
                return rawHelp
                    .replace(/^Usage:/m, COLORS.cli.header('Usage:'))
                    .replace(/^Options:/m, COLORS.cli.header('Options:'))
                    .replace(/^Global Options:/m, COLORS.cli.header('Global Options:'))
                    .replace(/^Commands:/m, COLORS.cli.header('Commands:'))
                    .replace(/^Arguments:/m, COLORS.cli.header('Arguments:'))
                    .replace(/^Examples:/m, COLORS.cli.header('Examples:'))
                    .replace(/^Notes:/m, COLORS.cli.header('Notes:'));
            },
        });
        for (const sub of cmd.commands) {
            configureCommandHelp(sub);
        }
    }

    program
        .version(VERSION, '-v, --version', 'output the current version')
        .helpOption('-h, --help', 'display help for command')
        .description(
            '🚀 Only-one CLI - Developer environment setups, supported VS editor configuration syncing, and agent workspaces manager.',
        )
        .addHelpText(
            'after',
            `\n${COLORS.cli.header('Examples:')}\n` +
                `  ${COLORS.cli.command('$ only-one init')}                             # Initialize project workspace configs & templates\n` +
                `  ${COLORS.cli.command('$ only-one init --step skills --yes')}          # Initialize skills step non-interactively\n` +
                `  ${COLORS.cli.command('$ only-one combo idsd-flow')}                   # Install pre-defined tool, package, & skill combos\n` +
                `  ${COLORS.cli.command('$ only-one skill --tool cursor')}               # Manage/sync custom agent skills for Cursor\n` +
                `  ${COLORS.cli.command('$ only-one mcp github,clockify')}               # Configure global Model Context Protocol servers\n` +
                `  ${COLORS.cli.command('$ only-one structure-generate')}                # Scaffold structural blueprint files for agents\n` +
                `  ${COLORS.cli.command('$ only-one setting-vs --editors cursor')}       # Sync and merge supported editor settings\n` +
                `  ${COLORS.cli.command('$ only-one extensions-vs')}                     # Sync and merge supported editor extensions\n` +
                `  ${COLORS.cli.command('$ only-one doctor')}                            # Verify git and Node.js environment readiness\n` +
                `  ${COLORS.cli.command('$ only-one update')}                            # Refresh installed agent skills/templates\n\n` +
                `${COLORS.cli.header('Notes:')}\n` +
                `  - Run ${COLORS.cli.command('only-one <command> --help')} for detailed option descriptions on each command.`,
        );

    /* ═══════════════════════════════════════════════════════════════════
     * SETUP & AGENTS — project config and Cursor workflow artifacts
     * ═══════════════════════════════════════════════════════════════════ */
    program.addCommand(createInitCommand(deps));
    program.addCommand(createSkillCommand(deps));
    program.addCommand(createPluginCommand(deps));
    program.addCommand(createRuleCommand(deps));
    program.addCommand(createMcpCommand(deps));
    program.addCommand(createComboCommand(deps));
    program.addCommand(createStructureGenerateCommand(deps));

    program.addCommand(createUpdateCommand(deps));

    program.addCommand(createDoctorCommand(deps));
    program.addCommand(createSettingVsCommand(deps));
    program.addCommand(createExtensionsVsCommand(deps));

    configureCommandHelp(program);

    return program;
}

export type { ProgramDeps, PromptDeps } from './deps.js';
