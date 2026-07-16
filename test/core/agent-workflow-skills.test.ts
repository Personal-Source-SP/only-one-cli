import { existsSync } from 'node:fs';
import { cp, mkdtemp, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const skillsDir = join(repoRoot, 'libraries', 'skills');

describe('agent workflow skills', () => {
    it('ships ak-pr-git with referenced PR template', async () => {
        const skillDir = join(skillsDir, 'ak-pr-git');
        const skill = await readFile(join(skillDir, 'SKILL.md'), 'utf-8');
        const template = await readFile(join(skillDir, 'references', 'pr-template.md'), 'utf-8');

        expect(skill).toContain('name: ak-pr-git');
        expect(skill).toContain('GitHub MCP');
        expect(skill).toContain('references/pr-template.md');
        expect(template).toContain('## 🎯 Objective');
        expect(template).toContain('Vietnamese Summary Rule');
    });

    it('ships ak-clockify with task format and validation references', async () => {
        const skillDir = join(skillsDir, 'ak-clockify');
        const skill = await readFile(join(skillDir, 'SKILL.md'), 'utf-8');
        const format = await readFile(join(skillDir, 'references', 'task-format.md'), 'utf-8');
        const rules = await readFile(join(skillDir, 'references', 'validation-rules.md'), 'utf-8');

        expect(skill).toContain('name: ak-clockify');
        expect(skill).toContain('Clockify MCP');
        expect(skill).toContain('references/task-format.md');
        expect(skill).toContain('references/validation-rules.md');
        expect(format).toContain('[Label] Description | start-endh');
        expect(rules).toContain('DD/MM/YYYY');
    });

    it('can be copied recursively with references intact', async () => {
        const target = await mkdtemp(join(tmpdir(), 'only-one-skills-'));
        const source = join(skillsDir, 'ak-clockify');
        const destination = join(target, 'ak-clockify');

        await cp(source, destination, { recursive: true, force: true });

        expect(existsSync(join(destination, 'SKILL.md'))).toBe(true);
        expect(existsSync(join(destination, 'references', 'task-format.md'))).toBe(true);
        expect(existsSync(join(destination, 'references', 'validation-rules.md'))).toBe(true);
    });
});
