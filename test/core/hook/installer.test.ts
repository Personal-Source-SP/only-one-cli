import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { installHooks } from '../../../src/core/hook/installer.js';

describe('Hook Installer Module', () => {
    let testDir: string;

    beforeEach(() => {
        testDir = mkdtempSync(join(tmpdir(), 'only-one-hook-installer-'));
    });

    afterEach(() => {
        rmSync(testDir, { recursive: true, force: true });
    });

    it('installs hook scripts into specific IDE hooks directories (TC-04)', async () => {
        const res = await installHooks({
            projectDir: testDir,
            tools: ['antigravity', 'claude'],
        });

        expect(res.installedFiles.length).toBeGreaterThan(0);
        expect(existsSync(join(testDir, '.gemini', 'hooks', 'block-heavy-scripts.sh'))).toBe(true);
        expect(existsSync(join(testDir, '.claude', 'hooks', 'block-heavy-scripts.sh'))).toBe(true);
        expect(existsSync(join(testDir, '.gemini', 'hooks.json'))).toBe(true);
        expect(existsSync(join(testDir, '.claude', 'settings.json'))).toBe(true);
    });

    it('does not create .agents directory when installing hooks (TC-05)', async () => {
        await installHooks({
            projectDir: testDir,
            tools: ['antigravity', 'claude'],
        });

        expect(existsSync(join(testDir, '.agents'))).toBe(false);
    });

    it('generates dynamic command paths matching IDE script location (TC-06)', async () => {
        await installHooks({
            projectDir: testDir,
            tools: ['antigravity', 'claude'],
        });

        const geminiConfig = readFileSync(join(testDir, '.gemini', 'hooks.json'), 'utf-8');
        expect(geminiConfig).toContain('.gemini/hooks/block-heavy-scripts.sh');
        expect(geminiConfig).not.toContain('.agents/hooks/');

        const claudeConfig = readFileSync(join(testDir, '.claude', 'settings.json'), 'utf-8');
        expect(claudeConfig).toContain('.claude/hooks/block-heavy-scripts.sh');
        expect(claudeConfig).not.toContain('.agents/hooks/');
    });

    it('installs hook scripts into .gemini/config/hooks when isGlobal is true', async () => {
        const res = await installHooks({
            projectDir: testDir,
            homeDir: testDir,
            isGlobal: true,
            tools: ['antigravity'],
        });

        expect(existsSync(join(testDir, '.gemini', 'config', 'hooks', 'block-heavy-scripts.sh'))).toBe(true);
        expect(existsSync(join(testDir, '.gemini', 'config', 'hooks.json'))).toBe(true);
        const configContent = readFileSync(join(testDir, '.gemini', 'config', 'hooks.json'), 'utf-8');
        expect(configContent).toContain('~/.gemini/config/hooks/block-heavy-scripts.sh');
        expect(existsSync(join(testDir, '.gemini', 'hooks'))).toBe(false);
    });
});
