import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
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

    it('should install all hook scripts into .agents/hooks and create configs', async () => {
        const res = await installHooks({
            projectDir: testDir,
            tools: ['antigravity', 'claude'],
        });

        expect(res.installedFiles.length).toBeGreaterThan(0);
        expect(existsSync(join(testDir, '.agents', 'hooks', 'block-heavy-scripts.sh'))).toBe(true);
        expect(existsSync(join(testDir, '.agents', 'hooks.json'))).toBe(true);
        expect(existsSync(join(testDir, '.claude', 'settings.json'))).toBe(true);
    });
});
