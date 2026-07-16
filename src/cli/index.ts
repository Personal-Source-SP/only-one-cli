import { Command } from 'commander';
import {
    createDoctorCommand,
    createExtensionsVsCommand,
    createInitCommand,
    createStructureGenerateCommand,
    createUpdateCommand,
    createSettingVsCommand,
} from '@/commands/index.js';
import type { ProgramDeps } from './deps.js';

export function createProgram(deps: ProgramDeps) {
    const program = new Command('only-one');

    program
        .version('0.0.1', '-v, --version', 'output the current version')
        .helpOption('-h, --help', 'display help for command')
        .description('Only-one CLI - Developer environment setups, VS Code configuration syncing, and agent workspaces manager.')
        .addHelpText(
            'after',
            '\nExamples:\n' +
                '  $ only-one doctor\n' +
                '  $ only-one init --step skills --yes\n\n' +
                'Notes:\n' +
                '  - Run "only-one <command> --help" for detailed option descriptions on each command.',
        );

    /* ═══════════════════════════════════════════════════════════════════
     * SETUP & AGENTS — project config and Cursor workflow artifacts
     * ═══════════════════════════════════════════════════════════════════ */
    program.addCommand(createInitCommand(deps));
    program.addCommand(createStructureGenerateCommand(deps));

    program.addCommand(createUpdateCommand(deps));

    program.addCommand(createDoctorCommand(deps));
    program.addCommand(createSettingVsCommand(deps));
    program.addCommand(createExtensionsVsCommand(deps));

    return program;
}

export type { ProgramDeps, PromptDeps } from './deps.js';
