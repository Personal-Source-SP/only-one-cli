import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPrebuiltBundle, listBundleEntries } from '@src/core/prebuilt/bundle.js';

describe('prebuilt-bundle', () => {
    it('lists only existing bundle entries', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-bundle-list-'));

        try {
            await mkdir(join(cwd, '.gitnexus'), { recursive: true });
            await writeFile(join(cwd, 'manifest.json'), '{}', 'utf-8');

            expect(listBundleEntries(cwd)).toEqual(['.gitnexus', 'manifest.json']);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('includes structure when markdown files exist', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-bundle-structure-'));

        try {
            await mkdir(join(cwd, 'out', 'structure'), { recursive: true });
            await writeFile(join(cwd, 'out', 'structure', 'acme-app-structural.md'), '# bp', 'utf-8');
            await writeFile(join(cwd, 'out', 'manifest.json'), '{}', 'utf-8');

            expect(listBundleEntries(join(cwd, 'out'))).toContain('structure');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('creates tar.gz with gitnexus, cocoindex, and manifest only', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-bundle-tar-'));
        const bundlePath = join(cwd, 'prebuilt.tar.gz');

        try {
            await mkdir(join(cwd, 'out', '.gitnexus'), { recursive: true });
            await mkdir(join(cwd, 'out', '.cocoindex'), { recursive: true });
            await writeFile(join(cwd, 'out', '.gitnexus', 'graph.json'), '{}', 'utf-8');
            await writeFile(join(cwd, 'out', '.cocoindex', 'documents.json'), '[]', 'utf-8');
            await writeFile(join(cwd, 'out', 'manifest.json'), '{"schemaVersion":"1.0"}', 'utf-8');
            await writeFile(join(cwd, 'out', 'source.ts'), 'export const x = 1;', 'utf-8');

            const entries = createPrebuiltBundle(join(cwd, 'out'), bundlePath);
            expect(entries).toEqual(['.gitnexus', '.cocoindex', 'manifest.json']);

            const listing = execFileSync('tar', ['-tzf', bundlePath], { encoding: 'utf-8' });
            expect(listing).toContain('.gitnexus/graph.json');
            expect(listing).toContain('.cocoindex/documents.json');
            expect(listing).toContain('manifest.json');
            expect(listing).not.toContain('source.ts');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('creates tar.gz including structure directory', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'hybrid-bundle-structure-tar-'));
        const bundlePath = join(cwd, 'prebuilt.tar.gz');

        try {
            await mkdir(join(cwd, 'out', 'structure'), { recursive: true });
            await writeFile(join(cwd, 'out', 'structure', 'acme-app-structural.md'), '# bp', 'utf-8');
            await writeFile(join(cwd, 'out', 'manifest.json'), '{"schemaVersion":"1.0"}', 'utf-8');

            const entries = createPrebuiltBundle(join(cwd, 'out'), bundlePath);
            expect(entries).toEqual(['manifest.json', 'structure']);

            const listing = execFileSync('tar', ['-tzf', bundlePath], { encoding: 'utf-8' });
            expect(listing).toContain('structure/acme-app-structural.md');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});
