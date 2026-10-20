import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SKILLS } from '@assets/skills/index.js';

const SDLC_SKILLS = [
    'only-one-idea',
    'only-one-plan',
    'only-one-apply',
    'only-one-debug',
    'only-one-review',
    'only-one-conflict',
    'only-one-pr-git',
    'only-one-clean',
    'only-one-evolve',
    'only-one-flash',
];
import { resolvePackageRoot } from '@/core/runtime/package-root.js';

const packageRoot = resolvePackageRoot(import.meta.url);
const skillsDir = join(packageRoot, 'assets/skills');
const shippedLocalSkillNames = readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(skillsDir, entry.name, 'SKILL.md')))
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

        const localSkills = SKILLS.filter((s) => s.sourceType === 'local').map((s) => s.name);
        expect([...localSkills].sort()).toEqual(shippedLocalSkillNames);
    });

    it('registers i-have-adhd from latest GitHub main without a local copy', () => {
        const skill = SKILLS.find(({ name }) => name === 'i-have-adhd');

        expect(skill).toMatchObject({
            version: '0.0.1',
            source: 'ayghri/i-have-adhd',
            sourceType: 'skills.sh',
        });
        expect(existsSync(join(skillsDir, 'i-have-adhd'))).toBe(false);
    });

    it('requires local SKILL.md with frontmatter name matching each local manifest', () => {
        for (const skill of SKILLS) {
            if (skill.sourceType === 'skills.sh' || skill.sourceType === 'github') {
                expect(skill.source).toBeDefined();
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

    it('registers the 9 curated mattpocock/skills with valid paths', () => {
        const mattSkills = SKILLS.filter((s) => s.source === 'mattpocock/skills');
        expect(mattSkills).toHaveLength(9);

        const expectedNames = [
            'grill-me',
            'grill-with-docs',
            'domain-modeling',
            'wait-what',
            'to-tickets',
            'codebase-design',
            'diagnosing-bugs',
            'prototype',
            'wizard',
        ];

        const mattSkillNames = mattSkills.map((s) => s.name);
        expect(mattSkillNames.sort()).toEqual(expectedNames.sort());

        for (const skill of mattSkills) {
            expect(skill.sourceType).toBe('skills.sh');
        }

        const conflictSkill = SKILLS.find((s) => s.name === 'resolving-merge-conflicts');
        expect(conflictSkill).toBeDefined();
        expect(conflictSkill?.source).toBe('warpdotdev/common-skills');
        expect(conflictSkill?.sourceType).toBe('skills.sh');
    });

    it('does not ship obsolete subagent-driven-development', () => {
        expect(SKILLS.some(({ name }) => name === 'subagent-driven-development')).toBe(false);
        expect(existsSync(join(skillsDir, 'subagent-driven-development'))).toBe(false);
    });

    it('registers all 10 core SDLC skills with valid local assets', () => {
        for (const skillName of SDLC_SKILLS) {
            const skill = SKILLS.find((s) => s.name === skillName);
            expect(skill, `SDLC skill '${skillName}' must be registered`).toBeDefined();
            expect(existsSync(join(skillsDir, skillName, 'SKILL.md'))).toBe(true);
        }
    });

    it('enforces Agent Skills specification format on all local skills', () => {
        const localSkills = SKILLS.filter((s) => s.sourceType === 'local');
        for (const skill of localSkills) {
            const skillPath = join(skillsDir, skill.name, 'SKILL.md');
            expect(existsSync(skillPath), `Skill '${skill.name}' must have SKILL.md`).toBe(true);
            const content = readFileSync(skillPath, 'utf8');
            expect(content).toMatch(/^---[\s\S]*?^name:\s*.+$[\s\S]*?^description:\s*.+$[\s\S]*?^---$/m);
            expect(content).toMatch(/^#\s+.+$/m);
            expect(content).toMatch(/^##\s+(Overview|Core Purpose)/m);
        }
    });
});
