import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { AI_TOOLS } from '@src/core/agent/tools.js';
import { getExternalSkillPath } from '@src/core/skill/remote/skills-sh-installer.js';
import { describe, expect, it } from 'vitest';

describe('global skill destination sync', () => {
    it('resolves global destination to .gemini/config/skills for Antigravity', async () => {
        const tempDir = await mkdtemp(join(tmpdir(), 'global-skill-test-'));
        const antigravity = AI_TOOLS.find((t) => t.value === 'antigravity')!;

        try {
            await mkdir(join(tempDir, '.gemini', 'config', 'skills', 'test-skill'), { recursive: true });
            await writeFile(join(tempDir, '.gemini', 'config', 'skills', 'test-skill', 'SKILL.md'), '# Test Skill');

            const path = getExternalSkillPath(tempDir, antigravity, 'test-skill', true);
            expect(path).toBe(join(tempDir, '.gemini', 'config', 'skills', 'test-skill', 'SKILL.md'));
            expect(existsSync(path!)).toBe(true);
        } finally {
            await rm(tempDir, { recursive: true, force: true });
        }
    });
});
