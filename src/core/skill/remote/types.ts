export type SkillSyncState = 'up-to-date' | 'update-available' | 'local-modified' | 'not-installed' | 'offline';

export interface RemoteSkillMeta {
    name: string;
    description?: string;
    source: string;
    sourceType: 'github';
    branch?: string;
    skillPath: string;
    computedHash: string;
    installedAt?: string;
    updatedAt?: string;
}

export interface SkillsLockfile {
    version: number;
    skills: Record<string, RemoteSkillMeta>;
}

export interface SkillStatusReport {
    skillName: string;
    source: string;
    installedPath?: string;
    currentHash: string;
    remoteHash?: string;
    state: SkillSyncState;
    lastUpdated?: string;
}
