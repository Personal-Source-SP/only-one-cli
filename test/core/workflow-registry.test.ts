import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { WORKFLOWS } from '@assets/workflows/index.js';
import { resolvePackageRoot } from '@/core/runtime/package-root.js';

const workflowsDir = join(resolvePackageRoot(import.meta.url), 'assets/workflows');

describe('workflow registry integrity', () => {
    it('registers each workflow once with a shipped markdown asset', () => {
        const names = WORKFLOWS.map(({ name }) => name);
        expect(new Set(names).size).toBe(names.length);

        for (const { name, description } of WORKFLOWS) {
            const workflowPath = join(workflowsDir, `${name}.md`);
            expect(existsSync(workflowPath), `${name} must ship a workflow asset`).toBe(true);
            expect(description.length).toBeGreaterThan(0);
            expect(readFileSync(workflowPath, 'utf8')).toMatch(/^---[\s\S]*?^description:\s*.+$[\s\S]*?^---$/m);
        }
    });

    it('registers only-one-plan', () => {
        expect(WORKFLOWS.filter(({ name }) => name === 'only-one-plan')).toHaveLength(1);
    });

    it('registers only-one-flash', () => {
        expect(WORKFLOWS.filter(({ name }) => name === 'only-one-flash')).toHaveLength(1);
    });

    it('requires and activates i-have-adhd in the five core workflows', () => {
        const expected = ['only-one-idea', 'only-one-plan', 'only-one-apply', 'only-one-flash', 'only-one-debug'];

        for (const name of expected) {
            const workflow = WORKFLOWS.find((item) => item.name === name);
            const content = readFileSync(join(workflowsDir, `${name}.md`), 'utf8');

            expect(workflow?.requiredSkills).toContain('i-have-adhd');
            expect(content).toContain('i-have-adhd');
            expect(content).toContain('presentation adapter, not an execution policy');
            expect(content).toContain('domain-skill completeness');
            expect(content).toMatch(/Mandatory Output Skill|Every user-visible turn/);
        }
    });

    it('requires ponytail in each Skills Catalog with stage-specific wording', () => {
        const contracts = {
            'only-one-idea': ['| **`ponytail`** | After Phase 1 problem clarity |', 'without shortening discovery'],
            'only-one-plan': ['| **`ponytail`** | Before each file-level design or unified diff |', 'first sufficient solution rung'],
            'only-one-debug': ['| **`ponytail`** | After root cause is proven |', 'smallest root-cause fix'],
            'only-one-apply': ['| **`ponytail`** | Preflight and before each edit |', 'material plan conflict'],
            'only-one-flash': ['| **`ponytail`** | Step 1 research and before approved edits |', 'concise per-file'],
        };

        for (const [name, terms] of Object.entries(contracts)) {
            const workflow = WORKFLOWS.find((item) => item.name === name);
            const content = readFileSync(join(workflowsDir, `${name}.md`), 'utf8');

            expect(workflow?.requiredSkills).toContain('ponytail');
            expect(content).toContain('## 1. Skills Catalog');
            for (const term of terms) expect(content).toContain(term);
        }
    });

    it('preserves workflow-specific domain invariants over output formatting', () => {
        const contracts = {
            'only-one-idea': ['one question', 'discovery'],
            'only-one-plan': ['Task Matrix', 'Unified Diff'],
            'only-one-apply': ['Depends On', 'Fast Test'],
            'only-one-flash': ['Review Gate', 'Zero Disk'],
            'only-one-debug': ['evidence', 'three failed patch attempts'],
        };

        for (const [name, requiredTerms] of Object.entries(contracts)) {
            const content = readFileSync(join(workflowsDir, `${name}.md`), 'utf8');
            for (const term of requiredTerms) expect(content.toLowerCase()).toContain(term.toLowerCase());
        }
    });
});
