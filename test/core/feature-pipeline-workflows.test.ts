import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { WORKFLOWS } from '@assets/workflows/index.js';

const workflowsDir = join(process.cwd(), 'assets/workflows');

const readWorkflow = async (name: string): Promise<string> => readFile(join(workflowsDir, `${name}.md`), 'utf8');

describe('feature pipeline workflows', () => {
    it('registers planning and implementation workflows with GitNexus', () => {
        const plan = WORKFLOWS.find((workflow) => workflow.name === 'only-one-plan');
        const implement = WORKFLOWS.find((workflow) => workflow.name === 'only-one-implement');

        expect(plan).toMatchObject({ requiredMcps: ['gitnexus'], requiredSkills: [] });
        expect(implement).toMatchObject({ requiredMcps: ['gitnexus'], requiredSkills: [] });
    });

    it('bounds planning discovery and gates implementation approval', async () => {
        const content = await readWorkflow('only-one-plan');

        expect(content).toContain('Do not recursively list, grep, read, or scan the entire repository');
        expect(content).toContain('Target a working set of 2–5% of the codebase');
        expect(content).toContain('ux-ui-max');
        expect(content).toContain('`docs/plans/<DD-MM-YYYY>/<feature-slug>.md`');
        expect(content).toContain('Wait for explicit user approval');
    });

    it('requires isolated subagents, TDD evidence, and integration review', async () => {
        const content = await readWorkflow('only-one-implement');

        expect(content).toContain('Assign every micro-task to a fresh subagent');
        expect(content).toContain('The coordinating agent must not implement a micro-task');
        expect(content).toContain('**RED**');
        expect(content).toContain('**GREEN**');
        expect(content).toContain('**REFACTOR**');
        expect(content).toContain('superpowers:requesting-code-review');
        expect(content).toContain('superpowers:verification-before-completion');
    });
});
