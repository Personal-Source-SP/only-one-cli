import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export type SkillsManifestEntry = {
    path: string;
    exclude?: string[];
};

export type SkillsManifest = {
    entries: SkillsManifestEntry[];
};

const CANONICAL_SKILL_PATH = '~/.agents/skills';

export async function mergeSkillsManifest(filePath: string): Promise<void> {
    let manifest: SkillsManifest = { entries: [] };

    if (existsSync(filePath)) {
        try {
            const content = await readFile(filePath, 'utf-8');
            const parsed = JSON.parse(content);
            if (parsed && Array.isArray(parsed.entries)) {
                manifest = parsed;
            }
        } catch {
            manifest = { entries: [] };
        }
    } else {
        await mkdir(join(filePath, '..'), { recursive: true });
    }

    const hasEntry = manifest.entries.some((e) => e.path === CANONICAL_SKILL_PATH || e.path === '~/.agents/skills/');
    if (!hasEntry) {
        manifest.entries.push({ path: CANONICAL_SKILL_PATH });
    }

    await writeFile(filePath, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
}

export async function syncGlobalSkillsManifest(homeDir: string): Promise<void> {
    const agentsManifestPath = join(homeDir, '.agents', 'skills.json');

    if (existsSync(join(homeDir, '.agents'))) {
        await mergeSkillsManifest(agentsManifestPath);
    }
}
