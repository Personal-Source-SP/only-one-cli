#!/usr/bin/env node
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { input, confirm, select, checkbox } from '@inquirer/prompts';
import { createProgram } from './cli/index.js';

export { createProgram } from './cli/index.js';
export type { ProgramDeps, PromptDeps } from './cli/deps.js';

export function isCliEntrypoint(moduleUrl: string, argvPath = process.argv[1]) {
    if (!argvPath) return false;

    try {
        return realpathSync(fileURLToPath(moduleUrl)) === realpathSync(argvPath);
    } catch {
        return false;
    }
}

if (isCliEntrypoint(import.meta.url) || process.env.ONLY_ONE_CLI_BYPASS_ENTRYPOINT_CHECK) {
    const program = createProgram({
        cwd: process.cwd(),
        env: process.env,
        fetcher: fetch,
        prompts: {
            input,
            confirm,
            select,
            checkbox,
        },
        stdout: (line) => console.log(line),
        stderr: (line) => console.error(line),
    });

    if (process.argv.length <= 2) {
        process.argv.push('tui');
    }

    try {
        await program.parseAsync(process.argv);
    } catch (error: any) {
        if (error && (error.name === 'ExitPromptError' || error.message?.includes('User force closed the prompt with SIGINT'))) {
            process.exit(0);
        }
        throw error;
    }
}
