import { describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AI_TOOLS } from '@src/core/agent/tools.js';
import { getExternalSkillPath } from '@src/core/skill/remote/skills-sh-installer.js';

describe('global skill destination sync', () => {
    it('strictly checks resolved global destination without false-positive fallback', async () => {
        const tempDir = await mkdtemp(join(tmpdir(), 'global-skill-test-'));
        const antigravity = AI_TOOLS.find((t) => t.value === 'antigravity')!;

        try {
            // Only in .agents, not in .gemini/config
            await mkdir(join(tempDir, '.agents', 'skills', 'test-skill'), { recursive: true });
            await writeFile(join(tempDir, '.agents', 'skills', 'test-skill', 'SKILL.md'), '# Test Skill');

            // Must NOT return true/path for global if not in .gemini/config
            const path = getExternalSkillPath(tempDir, antigravity, 'test-skill', true);
            expect(existsSync(path!)).toBe(false);
        } finally {
            await rm(tempDir, { recursive: true, force: true });
        }
    });
});
