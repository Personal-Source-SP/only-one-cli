import type { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { executeInitCommand, printInitResult } from '@/core/init/init-command.js';
import type { InitCommandOptions } from '../types.js';

export const executeInitStep = async (
    deps: ProgramDeps,
    path: string | undefined,
    options: InitCommandOptions,
    command: Command,
): Promise<void> => {
    const isJson = Boolean(command.parent?.opts()?.json);
    const result = await executeInitCommand(deps, {
        command,
        json: isJson,
        path,
        options: {
            tool: options.tool,
            ide: options.ide,
            step: options.step,
            skip: options.skip,
            combo: options.combo,
            noIgnore: options.ignore === false,
        },
    });

    if (!result) return;
    printInitResult(deps, isJson, result);
};
