import { join } from 'node:path';
import { VsEditorId, VsPlatform, type VsEditorDescriptor } from './types.js';

const macUser = (homeDir: string, appName: string) => join(homeDir, 'Library', 'Application Support', appName, 'User', 'settings.json');
const winUser = (homeDir: string, appName: string) => join(homeDir, 'AppData', 'Roaming', appName, 'User', 'settings.json');

export const vsEditors: VsEditorDescriptor[] = [
    {
        id: VsEditorId.VSCode,
        name: 'VS Code',
        commandCandidates: ['code'],
        resolveSettingsPath: (homeDir, platform) => (platform === VsPlatform.Win32 ? winUser(homeDir, 'Code') : macUser(homeDir, 'Code')),
    },
    {
        id: VsEditorId.Cursor,
        name: 'Cursor',
        commandCandidates: ['cursor'],
        resolveSettingsPath: (homeDir, platform) =>
            platform === VsPlatform.Win32 ? winUser(homeDir, 'Cursor') : macUser(homeDir, 'Cursor'),
    },
    {
        id: VsEditorId.Antigravity,
        name: 'Antigravity',
        commandCandidates: ['antigravity-ide', 'antigravity'],
        resolveSettingsPath: (homeDir, platform) =>
            platform === VsPlatform.Win32 ? winUser(homeDir, 'Antigravity IDE') : macUser(homeDir, 'Antigravity IDE'),
    },
];

export const findVsEditor = (id: VsEditorId): VsEditorDescriptor | undefined => vsEditors.find((editor) => editor.id === id);

export const parseVsEditorIds = (value: string | undefined): VsEditorId[] => {
    if (!value) return [];
    return value
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter((item): item is VsEditorId => Object.values(VsEditorId).includes(item as VsEditorId));
};
