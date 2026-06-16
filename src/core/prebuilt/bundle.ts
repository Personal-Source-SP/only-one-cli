import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { listStructureRelativePaths } from '@/core/structure/paths.js';

const CORE_BUNDLE_ENTRIES = ['.gitnexus', '.cocoindex', 'manifest.json'] as const;

export function listBundleEntries(indexOutputDir: string): string[] {
    const entries: string[] = [];

    for (const entry of CORE_BUNDLE_ENTRIES) {
        if (existsSync(join(indexOutputDir, entry))) {
            entries.push(entry);
        }
    }

    if (listStructureRelativePaths(indexOutputDir).length) {
        entries.push('structure');
    }

    return entries;
}

export function createPrebuiltBundle(indexOutputDir: string, bundlePath: string): string[] {
    const dirs = listBundleEntries(indexOutputDir);

    if (!dirs.length) {
        throw new Error(
            'No index artifacts found. Run only-one-cli index:create first, or omit --skip-gitnexus / --skip-cocoindex on push-index.',
        );
    }

    execFileSync('tar', ['--create', '--gzip', '--file', bundlePath, '--directory', indexOutputDir, ...dirs], {
        stdio: 'pipe',
        env: { ...process.env, COPYFILE_DISABLE: '1' },
    });

    return dirs;
}
