import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mergeSkillsManifest, syncGlobalSkillsManifest } from '@src/core/skill/manifest-bridge.js';

describe('Skills Manifest Bridge', () => {
    let tempDir: string;

    beforeEach(async () => {
        tempDir = await mkdtemp(join(tmpdir(), 'manifest-bridge-test-'));
    });

    afterEach(async () => {
        if (tempDir && existsSync(tempDir)) {
            await rm(tempDir, { recursive: true, force: true });
        }
    });

    it('creates manifest file with canonical path when missing', async () => {
        const manifestPath = join(tempDir, 'skills.json');
        await mergeSkillsManifest(manifestPath);

        expect(existsSync(manifestPath)).toBe(true);
        const data = JSON.parse(await readFile(manifestPath, 'utf-8'));
        expect(data.entries).toEqual([{ path: '~/.agents/skills' }]);
    });

    it('is idempotent and does not duplicate existing entry', async () => {
        const manifestPath = join(tempDir, 'skills.json');
        await mergeSkillsManifest(manifestPath);
        await mergeSkillsManifest(manifestPath);

        const data = JSON.parse(await readFile(manifestPath, 'utf-8'));
        expect(data.entries).toHaveLength(1);
    });

    it('preserves existing custom entries', async () => {
        const manifestPath = join(tempDir, 'skills.json');
        await mkdir(tempDir, { recursive: true });
        await writeFile(manifestPath, JSON.stringify({ entries: [{ path: '/custom/path' }] }), 'utf-8');

        await mergeSkillsManifest(manifestPath);

        const data = JSON.parse(await readFile(manifestPath, 'utf-8'));
        expect(data.entries).toEqual([{ path: '/custom/path' }, { path: '~/.agents/skills' }]);
    });

    it('only syncs ~/.agents manifest if directory exists and does not create redundant ~/.gemini/config/skills.json', async () => {
        await syncGlobalSkillsManifest(tempDir);

        const agentsManifest = join(tempDir, '.agents', 'skills.json');
        const geminiManifest = join(tempDir, '.gemini', 'config', 'skills.json');

        expect(existsSync(agentsManifest)).toBe(false);
        expect(existsSync(geminiManifest)).toBe(false);

        await mkdir(join(tempDir, '.agents'), { recursive: true });
        await syncGlobalSkillsManifest(tempDir);
        expect(existsSync(agentsManifest)).toBe(true);
    });
});
