import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { readInstalledLockfile, resolveInstalledLockfilePath, removeInstalledAsset, ONLY_ONE_DIR_NAME } from '@/core/assets/lockfile.js';
import type { RemoteSkillMeta, SkillsLockfile } from './types.js';

export { ONLY_ONE_DIR_NAME };
export const SKILLS_LOCKFILE_NAME = 'installed.json';

export function resolveSkillsLockfilePath(projectDir: string): string {
    return resolveInstalledLockfilePath(projectDir);
}

export function resolveSkillsLockfilePathForProject(projectDir: string): string {
    return resolveInstalledLockfilePath(projectDir);
}

export async function readSkillsLockfile(projectDir: string): Promise<SkillsLockfile> {
    const installedLock = await readInstalledLockfile(projectDir);
    const result: SkillsLockfile = { version: 1, skills: {} };

    if (installedLock.installed.skills) {
        for (const [sName, rec] of Object.entries(installedLock.installed.skills)) {
            if (rec.remote) {
                result.skills[sName] = {
                    name: sName,
                    source: rec.remote.source,
                    sourceType: rec.remote.sourceType,
                    branch: rec.remote.branch,
                    skillPath: rec.remote.skillPath,
                    computedHash: rec.remote.computedHash,
                    installedAt: rec.installedAt,
                    updatedAt: rec.remote.updatedAt || rec.updatedAt,
                };
            }
        }
    }

    // Transparent fallback: if installed.json has no remote skills, check if legacy skills-lock.json exists
    if (Object.keys(result.skills).length === 0) {
        const legacyPath = join(projectDir, ONLY_ONE_DIR_NAME, 'skills-lock.json');
        if (existsSync(legacyPath)) {
            try {
                const content = await readFile(legacyPath, 'utf-8');
                const legacy = JSON.parse(content) as SkillsLockfile;
                if (legacy.skills) {
                    return legacy;
                }
            } catch {
                // ignore
            }
        }
    }

    return result;
}

export async function saveSkillToLockfile(projectDir: string, skillName: string, meta: RemoteSkillMeta): Promise<void> {
    const installedLock = await readInstalledLockfile(projectDir);
    const now = new Date().toISOString();
    if (!installedLock.installed.skills) {
        installedLock.installed.skills = {};
    }
    const existing = installedLock.installed.skills[skillName];
    installedLock.installed.skills[skillName] = {
        version: existing?.version || '0.0.1',
        installedAt: existing?.installedAt || meta.installedAt || now,
        updatedAt: now,
        remote: {
            source: meta.source,
            sourceType: meta.sourceType,
            branch: meta.branch,
            skillPath: meta.skillPath,
            computedHash: meta.computedHash,
            updatedAt: now,
        },
    };
    installedLock.updatedAt = now;

    const lockPath = resolveInstalledLockfilePath(projectDir);
    await mkdir(dirname(lockPath), { recursive: true });
    await writeFile(lockPath, JSON.stringify(installedLock, null, 2) + '\n', 'utf-8');
}

export async function removeSkillFromLockfile(projectDir: string, skillName: string): Promise<void> {
    await removeInstalledAsset(projectDir, 'skills', skillName);
}
