import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { aggregateImprovements } from '../../assets/agents/skills/only-one-evolve/scripts/aggregate.js';
import { getGlobalImprovementsDir, isOnlyOneTargetSkill, resolveRepoIdentifierSync } from '../../src/utils/global-improvements.js';

describe('global-improvements utility', () => {
    describe('getGlobalImprovementsDir', () => {
        it('returns base global directory when no repo name given', () => {
            expect(getGlobalImprovementsDir()).toBe(join(homedir(), '.only-one', 'improvements'));
        });

        it('returns namespaced directory when repo name provided', () => {
            expect(getGlobalImprovementsDir('my-project')).toBe(join(homedir(), '.only-one', 'improvements', 'my-project'));
        });
    });

    describe('isOnlyOneTargetSkill', () => {
        it('returns true when target_skills contains only-one prefix', () => {
            expect(isOnlyOneTargetSkill(['only-one-plan', 'typescript'])).toBe(true);
            expect(isOnlyOneTargetSkill(['only-one-evolve'])).toBe(true);
        });

        it('returns false when target_skills has no only-one skill', () => {
            expect(isOnlyOneTargetSkill(['react', 'nestjs', 'custom-domain'])).toBe(false);
            expect(isOnlyOneTargetSkill([])).toBe(false);
        });
    });

    describe('resolveRepoIdentifierSync', () => {
        it('falls back to directory basename for arbitrary path without git', () => {
            const sampleDir = join(homedir(), 'some-arbitrary-workspace-xyz');
            expect(resolveRepoIdentifierSync(sampleDir)).toBe('some-arbitrary-workspace-xyz');
        });

        it('resolves active repository name correctly', () => {
            const current = resolveRepoIdentifierSync(process.cwd());
            expect(current).toBe('only-one-cli');
        });
    });

    describe('aggregateImprovements multi-repo scanning', () => {
        it('scans recursively across repo subfolders', () => {
            const tempDir = mkdtempSync(join(tmpdir(), 'agg-test-'));

            try {
                const repoA = join(tempDir, 'repo-a');
                const repoB = join(tempDir, 'repo-b');
                mkdirSync(repoA, { recursive: true });
                mkdirSync(repoB, { recursive: true });

                writeFileSync(
                    join(repoA, 'task-1.md'),
                    `---
status: pending
task_slug: task-1
target_skills:
  - only-one-plan
---
## 1. Observed Deficiencies
- Issue in plan
## 2. Context & Root Cause
Context info
## 3. Desired Skill Guardrail
- Suggestion 1
`,
                );

                writeFileSync(
                    join(repoB, 'task-2.md'),
                    `---
status: pending
task_slug: task-2
target_skills:
  - only-one-apply
---
## 1. Observed Deficiencies
- Issue in apply
## 2. Context & Root Cause
Context info
## 3. Desired Skill Guardrail
- Suggestion 2
`,
                );

                const res = aggregateImprovements(tempDir);
                expect(res.totalPending).toBe(2);
                expect(res.bySkill['only-one-plan']).toHaveLength(1);
                expect(res.bySkill['only-one-apply']).toHaveLength(1);
            } finally {
                rmSync(tempDir, { recursive: true, force: true });
            }
        });

        it('skips corrupted or invalid YAML files gracefully', () => {
            const tempDir = mkdtempSync(join(tmpdir(), 'agg-corrupt-'));

            try {
                const repo = join(tempDir, 'repo-corrupt');
                mkdirSync(repo, { recursive: true });

                writeFileSync(join(repo, 'broken.md'), '---\n: invalid [yaml\n---');
                writeFileSync(join(repo, 'empty.md'), '');

                const res = aggregateImprovements(tempDir);
                expect(res.totalPending).toBe(0);
            } finally {
                rmSync(tempDir, { recursive: true, force: true });
            }
        });
    });
});
