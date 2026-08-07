import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SKILLS } from '@assets/skills/index.js';
import { resolvePackageRoot } from '@/core/runtime/package-root.js';

const packageRoot = resolvePackageRoot(import.meta.url);
const skillsDir = join(packageRoot, 'assets/skills');
const shippedSkillNames = readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

const readFrontmatterName = (skillName: string): string | undefined => {
    const content = readFileSync(join(skillsDir, skillName, 'SKILL.md'), 'utf8');
    const match = content.match(/^---\s*[\s\S]*?^name:\s*(.+?)\s*$[\s\S]*?^---$/m);
    return match?.[1];
};

describe('skill registry integrity', () => {
    it('keeps manifest names unique and aligned with shipped directories', () => {
        const manifestNames = SKILLS.map(({ name }) => name);

        expect(new Set(manifestNames).size).toBe(manifestNames.length);
        expect([...manifestNames].sort()).toEqual(shippedSkillNames);
    });

    it('requires SKILL.md with frontmatter name matching each manifest', () => {
        for (const { name } of SKILLS) {
            const skillPath = join(skillsDir, name, 'SKILL.md');
            expect(existsSync(skillPath), `${name} must ship SKILL.md`).toBe(true);
            expect(readFrontmatterName(name)).toBe(name);
        }
    });

    it('registers coordinator skills and removes generic duplicates', () => {
        const manifestNames = SKILLS.map(({ name }) => name);

        expect(manifestNames).toEqual(expect.arrayContaining(['only-one-nextjs-development', 'only-one-nestjs-development']));
        expect(manifestNames).not.toEqual(expect.arrayContaining(['nextjs-development', 'nestjs-development']));
        expect(existsSync(join(skillsDir, 'nextjs-development'))).toBe(false);
        expect(existsSync(join(skillsDir, 'nestjs-development'))).toBe(false);
    });

    it('does not ship obsolete subagent-driven-development', () => {
        expect(SKILLS.some(({ name }) => name === 'subagent-driven-development')).toBe(false);
        expect(existsSync(join(skillsDir, 'subagent-driven-development'))).toBe(false);
    });
});
