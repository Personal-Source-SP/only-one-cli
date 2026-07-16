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
        .version('0.0.1')
        .option('--server <url>', 'Backend server URL')
        .option('--project <id>', 'Project or GitNexus repo id')
        .option('--json', 'Print JSON output');

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
