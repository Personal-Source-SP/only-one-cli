import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export type DoctorMode = 'docker' | 'local';

export const DEFAULT_GITNEXUS_IMAGE = 'ghcr.io/abhigyanpatwari/gitnexus:1.6.4';

export const DEFAULT_COCOINDEX_IMAGE = 'cocoindex/cocoindex-code:latest';

/**
 * Document-only CocoIndex script shipped with the CLI package.
 * Source: `cli/scripts/cocoindex_documents.py` → npm publish `scripts/cocoindex_documents.py`
 * (sibling to `dist/` when installed as `only-one`).
 */
export function resolveCocoindexScript(): string {
    if (process.env.COCOINDEX_SCRIPT) {
        return process.env.COCOINDEX_SCRIPT;
    }

    return join(dirname(fileURLToPath(import.meta.url)), '../../../scripts/cocoindex_documents.py');
}

export function assertCocoindexScriptExists(scriptPath = resolveCocoindexScript()): string {
    if (!existsSync(scriptPath)) {
        throw new Error(
            `CocoIndex script not found at ${scriptPath}.\n` +
                '  Expected only-one/scripts/cocoindex_documents.py next to dist/. Reinstall the CLI or set COCOINDEX_SCRIPT.',
        );
    }
    return scriptPath;
}

export function resolveGitnexusBin(): string {
    return process.env.GITNEXUS_BIN ?? 'npx';
}

export function resolveGitnexusImage(): string {
    return process.env.GITNEXUS_IMAGE ?? DEFAULT_GITNEXUS_IMAGE;
}

export function resolveCocoindexImage(): string {
    return process.env.COCOINDEX_IMAGE ?? DEFAULT_COCOINDEX_IMAGE;
}

/**
 * Relative CLI path when the container WORKDIR is `/app` (e.g. `docker exec` on the doctor container).
 */
export const GITNEXUS_CLI_PATH = 'gitnexus/dist/cli/index.js';

/** Absolute CLI path for `docker run -w /workspace` (project bind-mount). */
export const GITNEXUS_DOCKER_CLI_PATH = process.env.GITNEXUS_DOCKER_CLI_PATH ?? '/app/gitnexus/dist/cli/index.js';

export function gitnexusDockerVerifyArgs(image: string): string[] {
    return ['run', '--rm', '--entrypoint', 'node', image, GITNEXUS_DOCKER_CLI_PATH, '--version'];
}

/** `ccc` has no --version flag; --help confirms the CLI is runnable. */
export function cocoindexDockerVerifyArgs(image: string): string[] {
    return ['run', '--rm', '--entrypoint', 'ccc', image, '--help'];
}
