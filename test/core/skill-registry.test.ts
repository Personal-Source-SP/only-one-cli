import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SKILLS } from '@assets/skills/index.js';
import { resolvePackageRoot } from '@/core/runtime/package-root.js';

const packageRoot = resolvePackageRoot(import.meta.url);

const nextSkillNames = [
    'next-dev-loop',
    'next-cache-components-adoption',
    'next-cache-components-optimizer',
    'next-partial-prefetching-adoption',
];

describe('Next.js skill registry', () => {
    it('does not register or ship externally installed Next.js skills', () => {
        for (const skillName of nextSkillNames) {
            const skillPath = join(packageRoot, 'assets/skills', skillName);

            expect(SKILLS.some((skill) => skill.name === skillName)).toBe(false);
            expect(existsSync(skillPath)).toBe(false);
        }
    });
});

describe('obsolete skill removal', () => {
    it('does not register or ship subagent-driven-development', () => {
        const skillPath = join(packageRoot, 'assets/skills', 'subagent-driven-development');

        expect(SKILLS.some((skill) => skill.name === 'subagent-driven-development')).toBe(false);
        expect(existsSync(skillPath)).toBe(false);
    });
});

describe('shared OpenSpec lifecycle skills', () => {
    it.each([
        ['only-one-openspec-phase-planning', ['only-one-plan-be', 'only-one-plan-fe']],
        ['only-one-phase-implementation-loop', ['only-one-implement-be', 'only-one-implement-fe']],
    ])('registers and ships %s', (skillName, associatedWorkflows) => {
        const skillPath = join(packageRoot, 'assets/skills', skillName, 'SKILL.md');
        const manifest = SKILLS.find((skill) => skill.name === skillName);

        expect(existsSync(skillPath)).toBe(true);
        expect(manifest?.associatedWorkflows).toEqual(associatedWorkflows);
    });
});
