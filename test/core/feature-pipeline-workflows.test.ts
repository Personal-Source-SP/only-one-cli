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

    it.each(['only-one-plan-fe', 'only-one-plan-be'])('delegates shared OpenSpec phase planning in %s', async (workflowName) => {
        const content = await readWorkflow(workflowName);

        expect(content).toContain('`only-one-openspec-phase-planning`');
        expect(content).toContain('Shared planning lifecycle');
        expect(content).toContain('planning profile');
        expect(content).toContain('approval gate');
        expect(content).not.toContain('docs/plans/<DD-MM-YYYY>/<feature-slug>.md');
    });

    it.each(['only-one-implement-fe', 'only-one-implement-be'])('delegates shared phase implementation in %s', async (workflowName) => {
        const content = await readWorkflow(workflowName);

        expect(content).toContain('`contextFiles`');
        expect(content).toContain('Implementation rules by file tag');
        expect(content).toContain('`only-one-phase-implementation-loop`');
        expect(content).toContain('execution profile');
        expect(content).toContain('Completion profile');
        expect(content).not.toContain('only-one-worktree-handoff');
    });

    it('keeps global architecture rule framework-neutral', async () => {
        const content = await readFile(join(process.cwd(), 'assets/rules/02-architecture-stack.md'), 'utf8');

        expect(content).toContain('strict TypeScript');
        expect(content).toContain('Validate untrusted input');
        expect(content).toContain('public contracts');
        expect(content).not.toMatch(/NestJS|Next\.js|React|@InjectRepository|class-validator|Server Components/);
    });
});
