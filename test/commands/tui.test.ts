import { describe, expect, it } from 'vitest';
import { createProgram } from '@/index.js';

describe('tui command integration', () => {
    it('registers tui command in program', () => {
        const program = createProgram({
            cwd: process.cwd(),
            env: {},
            fetcher: fetch,
            stdout: () => undefined,
        });

        expect(program.commands.some((command) => command.name() === 'tui')).toBe(true);
    });
});
