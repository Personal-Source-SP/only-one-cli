import { existsSync } from 'node:fs';
import { mkdir, rename, rm, readFile, appendFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

/** Default directory for project config and pre-index artifacts (under the project root). */
export const ONLY_ONE_DIR = '.only-one';

export const ONLY_ONE_CONFIG_FILE = '.onlyonecli.yml';

export function resolveIndexOutputDir(projectDir: string, output?: string): string {
    if (output) {
        return resolve(projectDir, output);
    }
    return join(projectDir, ONLY_ONE_DIR);
}

export function resolveLocalConfigPath(projectDir: string, output?: string): string {
    return join(resolveIndexOutputDir(projectDir, output), ONLY_ONE_CONFIG_FILE);
}

/** Prefer `.only-one/.onlyonecli.yml`, fall back to legacy project-root config. */
export function resolveLocalConfigPathForProject(projectDir: string, output?: string): string | null {
    const preferred = resolveLocalConfigPath(projectDir, output);
    if (existsSync(preferred)) {
        return preferred;
    }
    const legacy = join(projectDir, ONLY_ONE_CONFIG_FILE);
    if (existsSync(legacy)) {
        return legacy;
    }
    return null;
}

export function resolveManifestPath(outputDir: string): string {
    return join(outputDir, 'manifest.json');
}

/** Prefer `.only-one/manifest.json`, fall back to legacy project-root manifest. */
export function resolveManifestPathForProject(projectDir: string, output?: string): string | null {
    const preferred = resolveManifestPath(resolveIndexOutputDir(projectDir, output));
    if (existsSync(preferred)) {
        return preferred;
    }
    const legacy = join(projectDir, 'manifest.json');
    if (existsSync(legacy)) {
        return legacy;
    }
    return null;
}

export async function ensureIndexOutputDir(outputDir: string): Promise<void> {
    await mkdir(outputDir, { recursive: true });
}

/**
 * Indexers write under the source repo root; move artifact dirs into the output folder.
 */
export async function relocateArtifactDir(sourceRoot: string, dirName: string, outputDir: string, force = false): Promise<void> {
    const from = join(sourceRoot, dirName);
    const to = join(outputDir, dirName);

    if (!existsSync(from)) {
        return;
    }

    await ensureIndexOutputDir(outputDir);

    if (existsSync(to)) {
        if (!force) {
            await rm(from, { recursive: true, force: true });
            return;
        }
        await rm(to, { recursive: true, force: true });
    }

    await rename(from, to);
}

/**
 * Appends an entry to .gitignore so it's ignored and committed to the repository
 */
export async function ignoreInGitignore(projectDir: string, ignoreEntry: string): Promise<void> {
    const gitignorePath = join(projectDir, '.gitignore');
    if (existsSync(gitignorePath)) {
        try {
            const content = await readFile(gitignorePath, 'utf-8');
            if (
                !content
                    .split('\n')
                    .map((l) => l.trim())
                    .includes(ignoreEntry)
            ) {
                const prefix = content.endsWith('\n') || content.length === 0 ? '' : '\n';
                await appendFile(gitignorePath, `${prefix}${ignoreEntry}\n`, 'utf-8');
            }
        } catch (e) {
            // Ignore errors
        }
    } else {
        try {
            await appendFile(gitignorePath, `${ignoreEntry}\n`, 'utf-8');
        } catch (e) {
            // Ignore errors
        }
    }
}
