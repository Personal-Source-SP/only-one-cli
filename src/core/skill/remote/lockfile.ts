import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { RemoteSkillMeta, SkillsLockfile } from './types.js';

export const ONLY_ONE_DIR_NAME = 'only-one';
export const SKILLS_LOCKFILE_NAME = 'skills-lock.json';

export function resolveSkillsLockfilePath(projectDir: string): string {
    return join(projectDir, ONLY_ONE_DIR_NAME, SKILLS_LOCKFILE_NAME);
}

export function resolveSkillsLockfilePathForProject(projectDir: string): string {
    const preferred = resolveSkillsLockfilePath(projectDir);
    if (existsSync(preferred)) {
        return preferred;
    }
    const dotOnlyOne = join(projectDir, '.only-one', SKILLS_LOCKFILE_NAME);
    if (existsSync(dotOnlyOne)) {
        return dotOnlyOne;
    }
    const legacy = join(projectDir, SKILLS_LOCKFILE_NAME);
    if (existsSync(legacy)) {
        return legacy;
    }
    return preferred;
}

export async function readSkillsLockfile(projectDir: string): Promise<SkillsLockfile> {
    const lockPath = resolveSkillsLockfilePathForProject(projectDir);
    if (!existsSync(lockPath)) {
        return { version: 1, skills: {} };
    }
    try {
        const content = await readFile(lockPath, 'utf-8');
        return JSON.parse(content) as SkillsLockfile;
    } catch {
        return { version: 1, skills: {} };
    }
}

export async function saveSkillToLockfile(projectDir: string, skillName: string, meta: RemoteSkillMeta): Promise<void> {
    const lock = await readSkillsLockfile(projectDir);
    const now = new Date().toISOString();
    lock.skills[skillName] = {
        ...meta,
        installedAt: lock.skills[skillName]?.installedAt || meta.installedAt || now,
        updatedAt: now,
    };
    const lockPath = resolveSkillsLockfilePath(projectDir);
    await mkdir(dirname(lockPath), { recursive: true });
    await writeFile(lockPath, JSON.stringify(lock, null, 2) + '\n', 'utf-8');
}

export async function removeSkillFromLockfile(projectDir: string, skillName: string): Promise<void> {
    const lock = await readSkillsLockfile(projectDir);
    if (lock.skills[skillName]) {
        delete lock.skills[skillName];
        const lockPath = resolveSkillsLockfilePath(projectDir);
        await mkdir(dirname(lockPath), { recursive: true });
        await writeFile(lockPath, JSON.stringify(lock, null, 2) + '\n', 'utf-8');
    }
}
