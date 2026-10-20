import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { scanWorkspaceAssets } from '../../../src/tui/init/services/workspaceScanner.js';

describe('scanWorkspaceAssets', () => {
    let testDir: string;

    beforeEach(() => {
        testDir = mkdtempSync(join(tmpdir(), 'only-one-init-scan-'));
    });

    afterEach(() => {
        rmSync(testDir, { recursive: true, force: true });
    });

    it('should detect uninstalled assets in clean directory', () => {
        const items = scanWorkspaceAssets(testDir, ['antigravity']);
        expect(items.length).toBeGreaterThan(0);
        const installed = items.filter((i) => i.isInstalled);
        expect(installed.length).toBe(0);
    });

    it('should mark installed items when directories and files exist', () => {
        mkdirSync(join(testDir, '.agents', 'skills', 'only-one-plan'), { recursive: true });
        const items = scanWorkspaceAssets(testDir, ['antigravity']);
        const planSkill = items.find((i) => i.name === 'only-one-plan' && i.category === 'skill');
        expect(planSkill).toBeDefined();
        expect(planSkill?.isInstalled).toBe(true);
        expect(planSkill?.selected).toBe(true);
    });
});
