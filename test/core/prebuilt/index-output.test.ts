import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
    HYBRID_INDEX_CONFIG_FILE,
    HYBRID_INDEX_DIR,
    resolveIndexOutputDir,
    resolveLocalConfigPath,
    resolveManifestPath,
} from '@src/core/prebuilt/index-output.js';

describe('index-output', () => {
    it('defaults to .only-one under the project root', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'only-one-output-'));
        try {
            expect(resolveIndexOutputDir(cwd)).toBe(join(cwd, HYBRID_INDEX_DIR));
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('resolves custom --output relative to project root', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'only-one-output-'));
        try {
            expect(resolveIndexOutputDir(cwd, 'artifacts/index')).toBe(join(cwd, 'artifacts/index'));
            expect(resolveManifestPath(join(cwd, HYBRID_INDEX_DIR))).toBe(join(cwd, HYBRID_INDEX_DIR, 'manifest.json'));
            expect(resolveLocalConfigPath(cwd)).toBe(join(cwd, HYBRID_INDEX_DIR, HYBRID_INDEX_CONFIG_FILE));
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});
