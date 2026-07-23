import type { Command } from 'commander';
import type { ProgramDeps } from '@/cli/deps.js';
import { executeInitCommand, printInitResult } from '@/core/init/init-command.js';

export interface InitSubcommandPayload {
    path?: string;
    step?: string;
    packages?: string;
    skills?: string;
    configs?: string;
    combo?: string;
    target?: string;
    ignore?: boolean;
}

export const executeInitSubcommandStep = async (deps: ProgramDeps, payload: InitSubcommandPayload, command: Command): Promise<void> => {
    const isJson = Boolean(command.parent?.parent?.opts()?.json);
    const noIgnore = payload.ignore === false || command.parent?.opts()?.ignore === false;

    const result = await executeInitCommand(deps, {
        command,
        json: isJson,
        path: payload.path,
        options: {
            noIgnore,
            step: payload.step,
            packages: payload.packages,
            skills: payload.skills,
            configs: payload.configs,
            combo: payload.combo,
            target: payload.target,
        },
    });

    if (!result) return;
    printInitResult(deps, isJson, result);
};
