import { writeFile } from 'node:fs/promises';
import { loadConfig, resolveIndexMode, type IndexMode } from '@/core/config/index.js';
import { ensureIndexOutputDir, resolveManifestPath } from '@/core/prebuilt/index-output.js';
import { buildManifestData, type ManifestData } from '@/core/prebuilt/manifest.js';

export type { ManifestData };

export interface RunIndexerOptions {
    mode?: IndexMode;
    modeOverride?: string;
}

export async function resolveIndexerMode(projectDir: string, modeOverride?: string): Promise<IndexMode> {
    const config = await loadConfig(projectDir);
    return resolveIndexMode(config, modeOverride).mode;
}

export async function createManifest(projectDir: string, outputDir: string, projectName: string): Promise<void> {
    await ensureIndexOutputDir(outputDir);

    const manifest = await buildManifestData(projectDir, outputDir, projectName);

    await writeFile(resolveManifestPath(outputDir), JSON.stringify(manifest, null, 2), 'utf-8');
}
