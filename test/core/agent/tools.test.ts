import { describe, expect, it } from 'vitest';
import { AI_TOOLS, getToolsWithSkillsDir } from '@src/core/agent/tools.js';

describe('AI_TOOLS catalog', () => {
    it('matches OpenSpec installable tool count', () => {
        const withSkills = AI_TOOLS.filter((t) => t.skillsDir && t.available !== false);
        expect(getToolsWithSkillsDir().length).toBe(withSkills.length);
        expect(getToolsWithSkillsDir().length).toBe(30);
    });

    it('excludes agents pseudo-tool', () => {
        expect(getToolsWithSkillsDir()).not.toContain('agents');
    });
});
