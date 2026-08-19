import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, mkdir, writeFile, readFile } from 'node:fs/promises';
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

describe('skills lockfile resolution and management', () => {
    it('resolves default lockfile path to only-one/skills-lock.json', () => {
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

    it('saves skill to only-one/skills-lock.json and creates folder if missing', async () => {
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

            const lockPath = join(cwd, 'only-one', 'skills-lock.json');
            expect(existsSync(lockPath)).toBe(true);

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

    it('falls back to .only-one/skills-lock.json or legacy root if only-one/ does not exist', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'lockfile-test-'));
        try {
            // Case 1: legacy in root
            const legacyRootPath = join(cwd, 'skills-lock.json');
            await writeFile(
                legacyRootPath,
                JSON.stringify({
                    version: 1,
                    skills: {
                        'root-skill': {
                            name: 'root-skill',
                            source: 'owner/repo',
                            sourceType: 'github',
                            skillPath: 'skills/root-skill',
                            computedHash: 'root123',
                            installedAt: '2026-01-01T00:00:00.000Z',
                            updatedAt: '2026-01-01T00:00:00.000Z',
                        },
                    },
                }),
                'utf-8',
            );

            expect(resolveSkillsLockfilePathForProject(cwd)).toBe(legacyRootPath);
            let lock = await readSkillsLockfile(cwd);
            expect(lock.skills['root-skill']).toBeDefined();

            // Case 2: .only-one folder
            const dotOnlyOneDir = join(cwd, '.only-one');
            await mkdir(dotOnlyOneDir, { recursive: true });
            const dotOnlyOnePath = join(dotOnlyOneDir, 'skills-lock.json');
            await writeFile(
                dotOnlyOnePath,
                JSON.stringify({
                    version: 1,
                    skills: {
                        'dot-skill': {
                            name: 'dot-skill',
                            source: 'owner/repo',
                            sourceType: 'github',
                            skillPath: 'skills/dot-skill',
                            computedHash: 'dot123',
                            installedAt: '2026-01-01T00:00:00.000Z',
                            updatedAt: '2026-01-01T00:00:00.000Z',
                        },
                    },
                }),
                'utf-8',
            );

            expect(resolveSkillsLockfilePathForProject(cwd)).toBe(dotOnlyOnePath);
            lock = await readSkillsLockfile(cwd);
            expect(lock.skills['dot-skill']).toBeDefined();

            // Case 3: preferred only-one folder takes precedence
            const preferredDir = join(cwd, 'only-one');
            await mkdir(preferredDir, { recursive: true });
            const preferredPath = join(preferredDir, 'skills-lock.json');
            await writeFile(
                preferredPath,
                JSON.stringify({
                    version: 1,
                    skills: {
                        'preferred-skill': {
                            name: 'preferred-skill',
                            source: 'owner/repo',
                            sourceType: 'github',
                            skillPath: 'skills/preferred-skill',
                            computedHash: 'preferred123',
                            installedAt: '2026-01-01T00:00:00.000Z',
                            updatedAt: '2026-01-01T00:00:00.000Z',
                        },
                    },
                }),
                'utf-8',
            );

            expect(resolveSkillsLockfilePathForProject(cwd)).toBe(preferredPath);
            lock = await readSkillsLockfile(cwd);
            expect(lock.skills['preferred-skill']).toBeDefined();
            expect(lock.skills['dot-skill']).toBeUndefined();
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('removes skill from lockfile and saves to only-one/skills-lock.json', async () => {
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
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});
