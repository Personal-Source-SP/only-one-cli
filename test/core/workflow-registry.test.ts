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

    it('registers only-one-ag-plan', () => {
        expect(WORKFLOWS.filter(({ name }) => name === 'only-one-ag-plan')).toHaveLength(1);
    });
});
