import { execFile } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import type { ProgramDeps } from '@/cli/deps.js';
import { loadConfig, resolveIndexMode, type IndexMode } from '@/core/config/index.js';
import {
    assertCocoindexScriptExists,
    GITNEXUS_DOCKER_CLI_PATH,
    resolveCocoindexImage,
    resolveGitnexusBin,
    resolveGitnexusImage,
} from '@/core/indexing/tools.js';
import { ensureIndexOutputDir, relocateArtifactDir, resolveManifestPath } from '@/core/prebuilt/index-output.js';
import { buildManifestData, type ManifestData } from '@/core/prebuilt/manifest.js';

const execFileAsync = promisify(execFile);

export type { ManifestData };

export interface RunIndexerOptions {
    mode?: IndexMode;
    modeOverride?: string;
}

export async function resolveIndexerMode(projectDir: string, modeOverride?: string): Promise<IndexMode> {
    const config = await loadConfig(projectDir);
    return resolveIndexMode(config, modeOverride).mode;
}

export async function runGitnexus(
    projectDir: string,
    outputDir: string,
    deps: ProgramDeps,
    options: RunIndexerOptions = {},
): Promise<void> {
    const mode = options.mode ?? (await resolveIndexerMode(projectDir, options.modeOverride));
    deps.stdout(`→ Running gitnexus analyze (${mode})...`);

    if (mode === 'docker') {
        await runGitnexusDocker(projectDir);
    } else {
        await runGitnexusLocal(projectDir);
    }

    await relocateArtifactDir(projectDir, '.gitnexus', outputDir, true);
    deps.stdout('  ✓ gitnexus done');
}

async function runGitnexusLocal(projectDir: string): Promise<void> {
    const gitnexusBin = resolveGitnexusBin();
    const args =
        gitnexusBin === 'npx'
            ? ['gitnexus', 'analyze', projectDir, '--force', '--skip-agents-md']
            : ['analyze', projectDir, '--force', '--skip-agents-md'];

    await execFileAsync(gitnexusBin, args, { cwd: projectDir, timeout: 300_000 });
}

async function runGitnexusDocker(projectDir: string): Promise<void> {
    const image = resolveGitnexusImage();
    const workspace = '/workspace';

    await execFileAsync(
        'docker',
        [
            'run',
            '--rm',
            '-v',
            `${projectDir}:${workspace}`,
            '-w',
            workspace,
            '--entrypoint',
            'node',
            image,
            GITNEXUS_DOCKER_CLI_PATH,
            'analyze',
            workspace,
            '--force',
            '--skip-agents-md',
        ],
        { timeout: 300_000 },
    );
}

export async function runCocoindex(
    projectDir: string,
    outputDir: string,
    deps: ProgramDeps,
    options: RunIndexerOptions = {},
): Promise<void> {
    const mode = options.mode ?? (await resolveIndexerMode(projectDir, options.modeOverride));
    deps.stdout(`→ Running cocoindex index (${mode})...`);

    if (mode === 'docker') {
        await runCocoindexDocker(projectDir);
    } else {
        await runCocoindexLocal(projectDir);
    }

    await relocateArtifactDir(projectDir, '.cocoindex', outputDir, true);
    deps.stdout('  ✓ cocoindex done');
}

async function runCocoindexLocal(projectDir: string): Promise<void> {
    const python = process.env.COCOINDEX_BINARY ?? 'python3';
    const script = realpathSync(assertCocoindexScriptExists());

    await execFileAsync(python, [script, 'index', '--project-dir', projectDir, '--reset'], {
        cwd: projectDir,
        timeout: 300_000,
    });
}

async function runCocoindexDocker(projectDir: string): Promise<void> {
    const image = resolveCocoindexImage();
    const script = realpathSync(assertCocoindexScriptExists());
    const workspace = '/workspace';

    await execFileAsync(
        'docker',
        [
            'run',
            '--rm',
            '-v',
            `${projectDir}:${workspace}`,
            '-v',
            `${script}:/opt/cocoindex_documents.py:ro`,
            '-w',
            workspace,
            '--entrypoint',
            'python3',
            image,
            '/opt/cocoindex_documents.py',
            'index',
            '--project-dir',
            workspace,
            '--reset',
        ],
        { timeout: 300_000 },
    );
}

export async function createManifest(projectDir: string, outputDir: string, projectName: string, modeOverride?: string): Promise<void> {
    await ensureIndexOutputDir(outputDir);

    const mode = await resolveIndexerMode(projectDir, modeOverride);
    const manifest = await buildManifestData(projectDir, outputDir, projectName, mode);

    await writeFile(resolveManifestPath(outputDir), JSON.stringify(manifest, null, 2), 'utf-8');
}
