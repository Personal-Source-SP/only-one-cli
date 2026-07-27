import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { WORKFLOWS } from '@assets/workflows/index.js';

const workflowsDir = join(process.cwd(), 'assets/workflows');

const readWorkflow = async (name: string): Promise<string> => readFile(join(workflowsDir, `${name}.md`), 'utf8');

describe('feature pipeline workflows', () => {
    it('registers FE and BE planning and implementation workflows with GitNexus', () => {
        const names = ['only-one-plan-fe', 'only-one-plan-be', 'only-one-implement-fe', 'only-one-implement-be'];

        for (const name of names) {
            expect(WORKFLOWS.find((workflow) => workflow.name === name)).toMatchObject({ requiredMcps: ['gitnexus'] });
        }
    });

    it.each(['only-one-plan-fe', 'only-one-plan-be'])('bounds %s discovery and gates implementation approval', async (name) => {
        const content = await readWorkflow(name);

        expect(content).toContain('Do not recursively list, grep, read, or scan the entire repository');
        expect(content).toContain('docs/plans/<DD-MM-YYYY>/<feature-slug>.md');
        expect(content).toContain('explicit user approval');
    });

    it.each(['only-one-implement-fe', 'only-one-implement-be'])(
        'requires direct %s task tracking, TDD, and integration review',
        async (name) => {
            const content = await readWorkflow(name);

            expect(content).toContain('<plan-dir>/tasks.md');
            expect(content).toContain('Implement one unchecked task directly');
            expect(content).toContain('RED, GREEN, REFACTOR');
            expect(content).toContain('requesting-code-review');
            expect(content).toContain('verification-before-completion');
            expect(content).not.toContain('subagent-driven-development');
        },
    );
});
