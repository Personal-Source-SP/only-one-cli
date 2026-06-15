import { describe, expect, it } from 'vitest';
import { hasQueryBodyError, printSearchResults, printStructuralError } from '@src/core/output/index.js';

describe('query output formatters', () => {
    it('prints search results with project name and language', () => {
        const writes: string[] = [];
        printSearchResults(
            {
                results: [
                    {
                        filePath: 'src/auth.ts',
                        startLine: 12,
                        score: 0.912,
                        content: 'export function validateUser() {}',
                        projectName: 'demo-api',
                        language: 'typescript',
                    },
                ],
                total: 1,
            },
            (line) => writes.push(line),
        );

        const output = writes.join('\n');
        expect(output).toContain('src/auth.ts:12');
        expect(output).toContain('demo-api — typescript');
        expect(output).toContain('validateUser');
    });

    it('prints structural error blocks', () => {
        const writes: string[] = [];
        printStructuralError({ code: 'HYBRID_BAD_REQUEST', message: 'Structural unavailable' }, (line) => writes.push(line));

        expect(writes.join('\n')).toContain('Structural error: HYBRID_BAD_REQUEST');
        expect(writes.join('\n')).toContain('Structural unavailable');
    });

    it('detects body-level query errors', () => {
        expect(hasQueryBodyError({ error: { code: 'HYBRID_NOT_FOUND', message: 'missing' } })).toBe(true);
        expect(hasQueryBodyError({ risk: 'LOW' })).toBe(false);
    });
});
