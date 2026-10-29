import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
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
});
