import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseJsoncObject } from './json.js';
import type { VsFileSystem } from './types.js';

export interface VsLibraryManifest {
    extensions: string[];
    settings: Record<string, unknown>;
}

export const resolveVsLibraryDir = (): string => join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'libraries', 'vs');

export const loadVsLibraryManifest = async (fs: VsFileSystem, libraryDir = resolveVsLibraryDir()): Promise<VsLibraryManifest> => {
    const settings = parseJsoncObject(await fs.readFile(join(libraryDir, 'settings.json')));
    const parsed = parseJsoncObject(await fs.readFile(join(libraryDir, 'extensions.json')));
    const extensions = parsed.extensions;
    if (!Array.isArray(extensions) || extensions.some((item) => typeof item !== 'string')) {
        throw new Error('libraries/vs/extensions.json must contain string[] field "extensions"');
    }
    return { extensions: normalizeExtensionIds(extensions), settings };
};

export const normalizeExtensionIds = (extensions: string[]): string[] =>
    Array.from(new Map(extensions.map((item) => [item.trim().toLowerCase(), item.trim()])).values()).filter(Boolean);
