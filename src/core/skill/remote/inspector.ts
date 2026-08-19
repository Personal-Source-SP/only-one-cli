import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SKILLS } from '@assets/skills/index.js';
import { readSkillsLockfile } from './lockfile.js';
import { fetchSkillContentFromGitHub, computeSha256 } from './github-fetcher.js';
import type { SkillStatusReport } from './types.js';

export async function checkSkillFreshness(projectDir: string, skillName: string): Promise<SkillStatusReport> {
    const lock = await readSkillsLockfile(projectDir);
    const lockMeta = lock.skills[skillName];
    const manifest = SKILLS.find((s) => s.name === skillName);

    const source = lockMeta?.source || manifest?.source || 'unknown';
    const skillPath = lockMeta?.skillPath || manifest?.skillPath || '';
    const branch = lockMeta?.branch || 'main';
    const currentHash = lockMeta?.computedHash || '';

    if (!lockMeta && !manifest) {
        return {
            skillName,
            source,
            installedPath: '',
            currentHash: '',
            state: 'not-installed',
        };
    }

    // Check if installed in .agents/skills
    const agentSkillPath = join(projectDir, '.agents/skills', skillName, 'SKILL.md');
    const isInstalled = existsSync(agentSkillPath);

    if (!isInstalled && !lockMeta) {
        return {
            skillName,
            source,
            installedPath: agentSkillPath,
            currentHash: '',
            state: 'not-installed',
        };
    }

    if (!skillPath || source === 'unknown' || manifest?.sourceType === 'local') {
        return {
            skillName,
            source: 'local',
            installedPath: agentSkillPath,
            currentHash: 'local',
            state: 'up-to-date',
            lastUpdated: lockMeta?.updatedAt,
        };
    }

    try {
        const { hash: remoteHash } = await fetchSkillContentFromGitHub(source, skillPath, branch);

        // Check if locally modified
        if (isInstalled) {
            const localContent = await readFile(agentSkillPath, 'utf-8');
            const localFileHash = computeSha256(localContent);
            if (currentHash && localFileHash !== currentHash && localFileHash !== remoteHash) {
                return {
                    skillName,
                    source,
                    installedPath: agentSkillPath,
                    currentHash: localFileHash,
                    remoteHash,
                    state: 'local-modified',
                    lastUpdated: lockMeta?.updatedAt || lockMeta?.installedAt,
                };
            }
        }

        const state = currentHash === remoteHash ? 'up-to-date' : 'update-available';

        return {
            skillName,
            source,
            installedPath: agentSkillPath,
            currentHash,
            remoteHash,
            state,
            lastUpdated: lockMeta?.updatedAt || lockMeta?.installedAt,
        };
    } catch {
        return {
            skillName,
            source,
            installedPath: agentSkillPath,
            currentHash,
            state: 'offline',
            lastUpdated: lockMeta?.updatedAt || lockMeta?.installedAt,
        };
    }
}

export async function checkAllSkillsFreshness(projectDir: string): Promise<SkillStatusReport[]> {
    const lock = await readSkillsLockfile(projectDir);
    const lockSkills = Object.keys(lock.skills);

    // Also include any remote skills from manifest
    const allSkillNames = Array.from(new Set([...lockSkills, ...SKILLS.filter((s) => s.sourceType === 'github').map((s) => s.name)]));

    const reports: SkillStatusReport[] = [];
    for (const name of allSkillNames) {
        reports.push(await checkSkillFreshness(projectDir, name));
    }
    return reports;
}
