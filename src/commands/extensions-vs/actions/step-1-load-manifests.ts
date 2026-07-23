import type { ProgramDeps } from '@/cli/deps.js';
import { loadVsLibraryManifest } from '@/core/vs/index.js';

export const loadVsLibraryManifestStep = async (_deps: ProgramDeps): Promise<string[]> => {
    const manifest = await loadVsLibraryManifest();
    return manifest.extensions;
};
