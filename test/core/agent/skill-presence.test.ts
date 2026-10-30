import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { getMissingStructureTools, hasStructureAgentSkills } from '@src/core/agent/skill-presence.js';
import { describe, expect, it } from 'vitest';

describe('skill-presence', () => {
    it('detects missing cursor skill', async () => {
        const projectDir = await mkdtemp(join(tmpdir(), 'hybrid-skill-presence-'));

        try {
            expect(hasStructureAgentSkills(projectDir, ['cursor'])).toBe(false);
            expect(getMissingStructureTools(projectDir, ['cursor'])).toEqual(['cursor']);
        } finally {
            await rm(projectDir, { recursive: true, force: true });
        }
    });

    it('detects present cursor skill and command', async () => {
        const projectDir = await mkdtemp(join(tmpdir(), 'hybrid-skill-presence-ok-'));

        try {
            await mkdir(join(projectDir, '.cursor', 'skills', 'only-one-structure-generate'), { recursive: true });
            await mkdir(join(projectDir, '.cursor', 'commands'), { recursive: true });
            await writeFile(join(projectDir, '.cursor', 'skills', 'only-one-structure-generate', 'SKILL.md'), '# skill');
            await writeFile(join(projectDir, '.cursor', 'commands', 'only-one-structure-generate.md'), '# cmd');

            expect(hasStructureAgentSkills(projectDir, ['cursor'])).toBe(true);
            expect(getMissingStructureTools(projectDir, ['cursor'])).toEqual([]);
        } finally {
            await rm(projectDir, { recursive: true, force: true });
        }
    });
});
