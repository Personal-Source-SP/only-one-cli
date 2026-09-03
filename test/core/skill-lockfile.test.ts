import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
    resolveSkillsLockfilePath,
    resolveSkillsLockfilePathForProject,
    readSkillsLockfile,
    saveSkillToLockfile,
    removeSkillFromLockfile,
    ONLY_ONE_DIR_NAME,
    SKILLS_LOCKFILE_NAME,
} from '@/core/skill/remote/lockfile.js';
import { readInstalledLockfile } from '@/core/assets/lockfile.js';

describe('skills lockfile resolution and management (Unified in installed.json)', () => {
    it('resolves default lockfile path to only-one/installed.json', () => {
        const projectDir = '/tmp/dummy-project';
        expect(resolveSkillsLockfilePath(projectDir)).toBe(join(projectDir, ONLY_ONE_DIR_NAME, SKILLS_LOCKFILE_NAME));
    });

    it('returns empty lockfile when no lockfile exists', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'lockfile-test-'));
        try {
            const lock = await readSkillsLockfile(cwd);
            expect(lock).toEqual({ version: 1, skills: {} });
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('saves remote skill into only-one/installed.json and preserves single file footprint', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'lockfile-test-'));
        try {
            await saveSkillToLockfile(cwd, 'test-skill', {
                name: 'test-skill',
                description: 'A test skill',
                source: 'owner/repo',
                sourceType: 'github',
                skillPath: 'skills/test-skill',
                computedHash: 'abc123hash',
            });

            const unifiedLockPath = join(cwd, 'only-one', 'installed.json');
            expect(existsSync(unifiedLockPath)).toBe(true);
            expect(existsSync(join(cwd, 'only-one', 'skills-lock.json'))).toBe(false);

            // Verify via unified installed lockfile
            const installedState = await readInstalledLockfile(cwd);
            expect(installedState.installed.skills?.['test-skill']).toBeDefined();
            expect(installedState.installed.skills?.['test-skill']?.remote?.computedHash).toBe('abc123hash');

            // Verify via adapter readSkillsLockfile
            const lock = await readSkillsLockfile(cwd);
            expect(lock.skills['test-skill']).toBeDefined();
            expect(lock.skills['test-skill'].name).toBe('test-skill');
            expect(lock.skills['test-skill'].computedHash).toBe('abc123hash');
            expect(lock.skills['test-skill'].installedAt).toBeDefined();
            expect(lock.skills['test-skill'].updatedAt).toBeDefined();
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('supports transparent fallback when only legacy skills-lock.json exists', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'lockfile-test-'));
        try {
            const preferredDir = join(cwd, 'only-one');
            await mkdir(preferredDir, { recursive: true });
            const legacyPath = join(preferredDir, 'skills-lock.json');
            await writeFile(
                legacyPath,
                JSON.stringify({
                    version: 1,
                    skills: {
                        'legacy-skill': {
                            name: 'legacy-skill',
                            source: 'owner/repo',
                            sourceType: 'github',
                            skillPath: 'skills/legacy-skill',
                            computedHash: 'legacy123',
                            installedAt: '2026-01-01T00:00:00.000Z',
                            updatedAt: '2026-01-01T00:00:00.000Z',
                        },
                    },
                }),
                'utf-8',
            );

            const lock = await readSkillsLockfile(cwd);
            expect(lock.skills['legacy-skill']).toBeDefined();
            expect(lock.skills['legacy-skill'].computedHash).toBe('legacy123');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('removes skill from lockfile in only-one/installed.json', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'lockfile-test-'));
        try {
            await saveSkillToLockfile(cwd, 'skill-1', {
                name: 'skill-1',
                source: 'owner/repo',
                sourceType: 'github',
                skillPath: 'skills/skill-1',
                computedHash: 'hash1',
            });
            await saveSkillToLockfile(cwd, 'skill-2', {
                name: 'skill-2',
                source: 'owner/repo',
                sourceType: 'github',
                skillPath: 'skills/skill-2',
                computedHash: 'hash2',
            });

            await removeSkillFromLockfile(cwd, 'skill-1');

            const lock = await readSkillsLockfile(cwd);
            expect(lock.skills['skill-1']).toBeUndefined();
            expect(lock.skills['skill-2']).toBeDefined();

            const installed = await readInstalledLockfile(cwd);
            expect(installed.installed.skills?.['skill-1']).toBeUndefined();
            expect(installed.installed.skills?.['skill-2']).toBeDefined();
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});
