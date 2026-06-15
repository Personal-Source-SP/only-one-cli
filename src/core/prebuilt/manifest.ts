import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { promisify } from 'node:util';
import type { IndexMode } from '../config/index.js';
import {
    GITNEXUS_DOCKER_CLI_PATH,
    resolveCocoindexImage,
    resolveCocoindexScript,
    resolveGitnexusBin,
    resolveGitnexusImage,
} from '../indexing/tools.js';
import { verifyGitnexusInContainer } from '../indexing/docker-runtime.js';
import { listStructureRelativePaths } from '../structure/paths.js';

const execFileAsync = promisify(execFile);

export interface ManifestData {
    artifactChecksum: string;
    cocoindexVersion: string;
    commitSha: string;
    createdAt: string;
    fileCount: number;
    gitnexusVersion: string;
    indexVersionId?: string;
    projectName: string;
    schemaVersion: string;
    structuralFiles?: string[];
}

const ARTIFACT_DIRS = ['.gitnexus', '.cocoindex'] as const;

export async function countFiles(dir: string): Promise<number> {
    if (!existsSync(dir)) return 0;
    let count = 0;
    const entries = await readdir(dir, { withFileTypes: true, recursive: true });
    for (const entry of entries) {
        if (entry.isFile()) count++;
    }
    return count;
}

export async function getCommitSha(dir: string): Promise<string> {
    try {
        const { stdout } = await execFileAsync('git', ['rev-parse', 'HEAD'], {
            cwd: dir,
            timeout: 5000,
        });
        return stdout.trim();
    } catch {
        return 'unknown';
    }
}

export async function detectGitnexusVersion(mode: IndexMode): Promise<string> {
    if (mode === 'docker') {
        try {
            return verifyGitnexusInContainer();
        } catch {
            const image = resolveGitnexusImage();
            const version = await execFileAsync(
                'docker',
                ['run', '--rm', '--entrypoint', 'node', image, GITNEXUS_DOCKER_CLI_PATH, '--version'],
                {
                    timeout: 120_000,
                },
            );
            return version.stdout.trim() || image;
        }
    }

    const bin = resolveGitnexusBin();
    const args = bin === 'npx' ? ['gitnexus', '--version'] : ['--version'];
    try {
        const { stdout } = await execFileAsync(bin, args, { timeout: 30_000 });
        return stdout.trim() || 'unknown';
    } catch {
        return 'unknown';
    }
}

export async function detectCocoindexVersion(mode: IndexMode): Promise<string> {
    if (mode === 'docker') {
        return resolveCocoindexImage();
    }

    const python = process.env.COCOINDEX_BINARY ?? 'python3';
    try {
        const { stdout } = await execFileAsync(python, ['--version'], { timeout: 10_000 });
        const py = stdout.trim();
        const script = resolveCocoindexScript();
        return existsSync(script) ? `${py}; ${script}` : py;
    } catch {
        return 'unknown';
    }
}

async function collectFiles(root: string): Promise<string[]> {
    if (!existsSync(root)) {
        return [];
    }

    const files: string[] = [];
    const walk = async (dir: string): Promise<void> => {
        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
                await walk(fullPath);
            } else if (entry.isFile()) {
                files.push(fullPath);
            }
        }
    };
    await walk(root);
    return files.sort();
}

/** Stable SHA-256 over artifact tree contents (paths + bytes). */
export async function computeArtifactChecksum(outputDir: string): Promise<string> {
    const hash = createHash('sha256');
    const roots = ARTIFACT_DIRS.map((dir) => join(outputDir, dir)).filter((dir) => existsSync(dir));

    for (const root of roots.sort()) {
        const files = await collectFiles(root);
        for (const filePath of files) {
            const rel = relative(outputDir, filePath);
            const content = await readFile(filePath);
            hash.update(`${rel}\0`);
            hash.update(content);
        }
    }

    return hash.digest('hex');
}

export async function buildManifestData(
    projectDir: string,
    outputDir: string,
    projectName: string,
    mode: IndexMode,
): Promise<ManifestData> {
    const [commitSha, gitnexusVersion, cocoindexVersion, fileCount, artifactChecksum] = await Promise.all([
        getCommitSha(projectDir),
        detectGitnexusVersion(mode),
        detectCocoindexVersion(mode),
        countFiles(join(outputDir, '.cocoindex')),
        computeArtifactChecksum(outputDir),
    ]);

    const structuralFiles = listStructureRelativePaths(outputDir);

    return {
        artifactChecksum,
        cocoindexVersion,
        commitSha,
        createdAt: new Date().toISOString(),
        fileCount,
        gitnexusVersion,
        projectName,
        schemaVersion: '1.0',
        ...(structuralFiles.length ? { structuralFiles } : {}),
    };
}

export async function readManifestFile(manifestPath: string): Promise<Record<string, unknown>> {
    const raw = await readFile(manifestPath, 'utf-8');
    return JSON.parse(raw) as Record<string, unknown>;
}

/** Persist backend-assigned index version id into local manifest.json after upload. */
export async function persistIndexVersionId(manifestPath: string, indexVersionId: string): Promise<void> {
    const manifest = await readManifestFile(manifestPath);
    manifest.indexVersionId = indexVersionId.trim();
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
}

export const extractUploadIndexVersionId = (response: unknown): string | null => {
    if (!response || typeof response !== 'object') {
        return null;
    }

    const payload = response as Record<string, unknown>;
    const indexVersionId = payload.indexVersionId;
    if (typeof indexVersionId !== 'string') {
        return null;
    }

    const normalized = indexVersionId.trim();
    return normalized.length ? normalized : null;
};
