import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RemoteSkillMeta, SkillsLockfile } from './types.js';

const LOCKFILE_NAME = 'skills-lock.json';

export async function readSkillsLockfile(projectDir: string): Promise<SkillsLockfile> {
    const lockPath = join(projectDir, LOCKFILE_NAME);
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
    const lockPath = join(projectDir, LOCKFILE_NAME);
    await writeFile(lockPath, JSON.stringify(lock, null, 2) + '\n', 'utf-8');
}

export async function removeSkillFromLockfile(projectDir: string, skillName: string): Promise<void> {
    const lock = await readSkillsLockfile(projectDir);
    if (lock.skills[skillName]) {
        delete lock.skills[skillName];
        const lockPath = join(projectDir, LOCKFILE_NAME);
        await writeFile(lockPath, JSON.stringify(lock, null, 2) + '\n', 'utf-8');
    }
}
