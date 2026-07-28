import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { resolvePackageRoot } from '@/core/runtime/package-root.js';

export type DoctorMode = 'docker' | 'local';

export const DEFAULT_COCOINDEX_IMAGE = 'cocoindex/cocoindex-code:latest';

export function resolveCocoindexScript(): string {
    if (process.env.COCOINDEX_SCRIPT) {
        return process.env.COCOINDEX_SCRIPT;
    }

    return join(resolvePackageRoot(import.meta.url), 'scripts/cocoindex_documents.py');
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

export function resolveCocoindexImage(): string {
    return process.env.COCOINDEX_IMAGE ?? DEFAULT_COCOINDEX_IMAGE;
}

/** `ccc` has no --version flag; --help confirms the CLI is runnable. */
export function cocoindexDockerVerifyArgs(image: string): string[] {
    return ['run', '--rm', '--entrypoint', 'ccc', image, '--help'];
}
