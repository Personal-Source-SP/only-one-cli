import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SKILLS } from '@assets/skills/index.js';
import { resolvePackageRoot } from '@/core/runtime/package-root.js';

const packageRoot = resolvePackageRoot(import.meta.url);
const skillsDir = join(packageRoot, 'assets/skills');
const shippedLocalSkillNames = readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

const readFrontmatterName = (skillName: string): string | undefined => {
    const content = readFileSync(join(skillsDir, skillName, 'SKILL.md'), 'utf8');
    const match = content.match(/^---\s*[\s\S]*?^name:\s*(.+?)\s*$[\s\S]*?^---$/m);
    return match?.[1];
};

describe('skill registry integrity', () => {
    it('keeps manifest names unique and distinguishes remote vs local skills', () => {
        const manifestNames = SKILLS.map(({ name }) => name);
        expect(new Set(manifestNames).size).toBe(manifestNames.length);

        const localSkills = SKILLS.filter((s) => s.sourceType !== 'github').map((s) => s.name);
        expect([...localSkills].sort()).toEqual(shippedLocalSkillNames);
    });

    it('requires local SKILL.md with frontmatter name matching each local manifest', () => {
        for (const skill of SKILLS) {
            if (skill.sourceType === 'github') {
                expect(skill.source).toBeDefined();
                expect(skill.skillPath).toBeDefined();
            } else {
                const skillPath = join(skillsDir, skill.name, 'SKILL.md');
                expect(existsSync(skillPath), `${skill.name} must ship local SKILL.md`).toBe(true);
                expect(readFrontmatterName(skill.name)).toBe(skill.name);
            }
        }
    });

    it('registers coordinator skills and removes generic duplicates', () => {
        const manifestNames = SKILLS.map(({ name }) => name);

        expect(manifestNames).toEqual(expect.arrayContaining(['only-one-nextjs-development', 'only-one-nestjs-development']));
        expect(manifestNames).not.toEqual(expect.arrayContaining(['nextjs-development', 'nestjs-development']));
        expect(existsSync(join(skillsDir, 'nextjs-development'))).toBe(false);
        expect(existsSync(join(skillsDir, 'nestjs-development'))).toBe(false);
    });

    it('registers the 8 curated mattpocock/skills (7 new + grill-me) with valid paths', () => {
        const mattSkills = SKILLS.filter((s) => s.source === 'mattpocock/skills');
        expect(mattSkills).toHaveLength(8);

        const expectedNames = [
            'grill-me',
            'grill-with-docs',
            'domain-modeling',
            'wait-what',
            'to-tickets',
            'codebase-design',
            'diagnosing-bugs',
            'handoff',
        ];

        const mattSkillNames = mattSkills.map((s) => s.name);
        expect(mattSkillNames.sort()).toEqual(expectedNames.sort());

        for (const skill of mattSkills) {
            expect(skill.sourceType).toBe('github');
            expect(skill.skillPath).toMatch(/^skills\/(engineering|productivity)\/[a-z-]+\/SKILL\.md$/);
        }
    });

    it('does not ship obsolete subagent-driven-development', () => {
        expect(SKILLS.some(({ name }) => name === 'subagent-driven-development')).toBe(false);
        expect(existsSync(join(skillsDir, 'subagent-driven-development'))).toBe(false);
    });
});
