import { describe, expect, it } from 'vitest';
import { createProgram } from '@src/index.js';

describe('VS sync commands', () => {
    it('registers setting-vs and extensions-vs commands', () => {
        const program = createProgram({
            cwd: process.cwd(),
            env: {},
            fetcher: (() => Promise.resolve({})) as typeof fetch,
            stdout: () => undefined,
        });
        expect(program.commands.map((command) => command.name())).toContain('setting-vs');
        expect(program.commands.map((command) => command.name())).toContain('extensions-vs');
    });
});
