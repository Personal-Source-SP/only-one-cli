export type AssetType = 'workflows' | 'skills' | 'rules' | 'mcps' | 'packages' | 'configs' | 'combos' | 'git' | 'vs';

export interface InstalledAssetRecord {
    version: string;
    installedAt: string;
    updatedAt?: string;
    files?: string[];
}

export interface OnlyOneInstalledState {
    schemaVersion: 1;
    updatedAt: string;
    installed: Partial<Record<AssetType, Record<string, InstalledAssetRecord>>>;
}

export type AssetUpdateStatus = 'up-to-date' | 'outdated' | 'untracked';

export interface AssetInspectionItem {
    type: AssetType;
    id: string;
    name: string;
    installedVersion?: string;
    latestVersion: string;
    status: AssetUpdateStatus;
}
