import type { ProgramDeps } from '@/cli/deps.js';
import { flattenSettings, loadVsLibraryManifest } from '@/core/vs/index.js';

export const loadVsSettingManifestsStep = async (_deps: ProgramDeps): Promise<Record<string, unknown>> => {
    const manifest = await loadVsLibraryManifest();
    return manifest.settings;
};

export const getAvailableSettingKeys = (settings: Record<string, unknown>): string[] => Object.keys(flattenSettings(settings));
