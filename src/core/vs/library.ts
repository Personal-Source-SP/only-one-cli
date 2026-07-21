import { join } from 'node:path';
import { parseJsoncObject } from './json.js';
import { VS_LIBRARY } from '@assets/vs/index.js';
import type { VsFileSystem } from './types.js';

export interface VsLibraryManifest {
    extensions: string[];
    settings: Record<string, unknown>;
}

export const loadVsLibraryManifest = async (fs?: VsFileSystem, libraryDir?: string): Promise<VsLibraryManifest> => {
    if (fs && libraryDir) {
        try {
            const settings = parseJsoncObject(await fs.readFile(join(libraryDir, 'settings.json')));
            const parsed = parseJsoncObject(await fs.readFile(join(libraryDir, 'extensions.json')));
            const extensions = parsed.extensions;
            if (Array.isArray(extensions) && extensions.every((item) => typeof item === 'string')) {
                return { extensions: normalizeExtensionIds(extensions), settings };
            }
        } catch {
            // fall back
        }
    }
    return { extensions: normalizeExtensionIds(VS_LIBRARY.extensions), settings: VS_LIBRARY.settings };
};

export const normalizeExtensionIds = (extensions: string[]): string[] =>
    Array.from(new Map(extensions.map((item) => [item.trim().toLowerCase(), item.trim()])).values()).filter(Boolean);
