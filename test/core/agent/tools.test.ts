import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { AI_TOOLS, getToolsWithSkillsDir, resolveToolDestinationPaths } from '@src/core/agent/tools.js';

describe('AI_TOOLS catalog', () => {
    it('matches OpenSpec installable tool count', () => {
        const withSkills = AI_TOOLS.filter((t) => t.skillsDir && t.available !== false);
        expect(getToolsWithSkillsDir().length).toBe(withSkills.length);
        expect(getToolsWithSkillsDir().length).toBe(30);
    });

    it('excludes agents pseudo-tool', () => {
        expect(getToolsWithSkillsDir()).not.toContain('agents');
    });

    it('resolves correct local and global destination paths for supported IDEs', () => {
        const antigravity = AI_TOOLS.find((t) => t.value === 'antigravity')!;
        const claude = AI_TOOLS.find((t) => t.value === 'claude')!;
        const cursor = AI_TOOLS.find((t) => t.value === 'cursor')!;
        const codex = AI_TOOLS.find((t) => t.value === 'codex')!;

        const dummyProject = join('/', 'workspace', 'app');
        const dummyHome = join('/', 'home', 'tester');

        // Local checks
        expect(resolveToolDestinationPaths(antigravity, 'skills', dummyProject, false)).toBe(join(dummyProject, '.agents', 'skills'));
        expect(resolveToolDestinationPaths(antigravity, 'workflows', dummyProject, false)).toBe(join(dummyProject, '.agents', 'workflows'));

        // Global checks
        expect(resolveToolDestinationPaths(antigravity, 'skills', dummyHome, true)).toBe(join(dummyHome, '.agents', 'skills'));
        expect(resolveToolDestinationPaths(antigravity, 'workflows', dummyHome, true)).toBe(join(dummyHome, '.agents', 'workflows'));
        expect(resolveToolDestinationPaths(claude, 'skills', dummyHome, true)).toBe(join(dummyHome, '.agents', 'skills'));
        expect(resolveToolDestinationPaths(cursor, 'rules', dummyHome, true)).toBe(join(dummyHome, '.agents', 'rules'));
        expect(resolveToolDestinationPaths(codex, 'workflows', dummyHome, true)).toBe(join(dummyHome, '.agents', 'workflows'));
    });
});
