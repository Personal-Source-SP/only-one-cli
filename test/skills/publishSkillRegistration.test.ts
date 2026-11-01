import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { SKILLS } from '../../assets/agents/skills/index';

describe('skill registration: only-one-publish', () => {
    it('tồn tại entry only-one-publish trong SKILLS', () => {
        const skill = SKILLS.find((s) => s.name === 'only-one-publish');

        expect(skill).toBeDefined();
        expect(skill?.sourceType).toBe('local');
        expect(skill?.description).toBeTruthy();
        expect(skill?.requiredSkills).toContain('i-have-adhd');
    });

    it('tệp tài liệu SKILL.md của only-one-publish tồn tại trên đĩa', () => {
        const skillPath = resolve(process.cwd(), 'assets', 'agents', 'skills', 'only-one-publish', 'SKILL.md');

        expect(existsSync(skillPath)).toBe(true);
    });
});
