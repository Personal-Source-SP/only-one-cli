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

    it('builds frontend planning artifacts through OpenSpec and UI protocols', async () => {
        const content = await readWorkflow('only-one-plan-fe');

        expect(content).toContain('Do not recursively list, grep, read, or scan the entire repository');
        expect(content).toContain('`openspec-propose`');
        expect(content).toContain('`openspec status --change "<name>" --json`');
        expect(content).toContain('`openspec instructions <artifact-id> --change "<name>" --json`');
        expect(content).toContain('`applyRequires`');
        expect(content).toContain('`only-one-ui`');
        expect(content).toContain('Server Component');
        expect(content).toContain('generated OpenAPI or Zod');
        expect(content).toContain('explicit user approval');
        expect(content).not.toContain('docs/plans/<DD-MM-YYYY>/<feature-slug>.md');
    });

    it('builds backend planning artifacts through the OpenSpec graph', async () => {
        const content = await readWorkflow('only-one-plan-be');

        expect(content).toContain('Do not recursively list, grep, read, or scan the entire repository');
        expect(content).toContain('`openspec-propose`');
        expect(content).toContain('`openspec status --change "<name>" --json`');
        expect(content).toContain('`openspec instructions <artifact-id> --change "<name>" --json`');
        expect(content).toContain('`applyRequires`');
        expect(content).toContain('macro-brainstorming');
        expect(content).toContain('explicit user approval');
        expect(content).not.toContain('docs/plans/<DD-MM-YYYY>/<feature-slug>.md');
    });

    it('applies frontend OpenSpec tasks through isolated TDD, UI evidence, and local handoff', async () => {
        const content = await readWorkflow('only-one-implement-fe');

        expect(content).toContain('`openspec-apply-change`');
        expect(content).toContain('`openspec instructions apply --change "<name>" --json`');
        expect(content).toContain('`contextFiles`');
        expect(content).toContain('micro-brainstorming');
        expect(content).toContain('RED, GREEN, REFACTOR');
        expect(content).toContain('browser console and network');
        expect(content).toContain('viewport evidence');
        expect(content).toContain('requesting-code-review');
        expect(content).toContain('verification-before-completion');
        expect(content).toContain('`git merge --squash ai/<feature-slug>`');
        expect(content).toContain('unstaged changes');
        expect(content).not.toContain('<plan-dir>/tasks.md');
    });

    it('applies backend OpenSpec tasks through isolated TDD and local handoff', async () => {
        const content = await readWorkflow('only-one-implement-be');

        expect(content).toContain('`openspec-apply-change`');
        expect(content).toContain('`openspec instructions apply --change "<name>" --json`');
        expect(content).toContain('`contextFiles`');
        expect(content).toContain('micro-brainstorming');
        expect(content).toContain('RED, GREEN, REFACTOR');
        expect(content).toContain('requesting-code-review');
        expect(content).toContain('verification-before-completion');
        expect(content).toContain('full test suite');
        expect(content).toContain('`git merge --squash ai/<feature-slug>`');
        expect(content).toContain('unstaged changes');
        expect(content).not.toContain('<plan-dir>/tasks.md');
    });

    it('keeps global architecture rule framework-neutral', async () => {
        const content = await readFile(join(process.cwd(), 'assets/rules/02-architecture-stack.md'), 'utf8');

        expect(content).toContain('strict TypeScript');
        expect(content).toContain('Validate untrusted input');
        expect(content).toContain('public contracts');
        expect(content).not.toMatch(/NestJS|Next\.js|React|@InjectRepository|class-validator|Server Components/);
    });
});
