#!/usr/bin/env node
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
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

if (isCliEntrypoint(import.meta.url)) {
    const program = createProgram({
        cwd: process.cwd(),
        env: process.env,
        fetcher: fetch,
        stdout: (line) => console.log(line),
        stderr: (line) => console.error(line),
    });

    await program.parseAsync(process.argv);
}
