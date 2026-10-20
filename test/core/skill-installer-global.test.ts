import { describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AI_TOOLS } from '@src/core/agent/tools.js';
import { getExternalSkillPath } from '@src/core/skill/remote/skills-sh-installer.js';

describe('global skill destination sync', () => {
    it('strictly resolves global destination to canonical .agents/skills', async () => {
        const tempDir = await mkdtemp(join(tmpdir(), 'global-skill-test-'));
        const antigravity = AI_TOOLS.find((t) => t.value === 'antigravity')!;

        try {
            await mkdir(join(tempDir, '.agents', 'skills', 'test-skill'), { recursive: true });
            await writeFile(join(tempDir, '.agents', 'skills', 'test-skill', 'SKILL.md'), '# Test Skill');

            const path = getExternalSkillPath(tempDir, antigravity, 'test-skill', true);
            expect(path).toBe(join(tempDir, '.agents', 'skills', 'test-skill', 'SKILL.md'));
            expect(existsSync(path!)).toBe(true);
        } finally {
            await rm(tempDir, { recursive: true, force: true });
        }
    });
});
