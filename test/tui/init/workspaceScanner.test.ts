import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { scanWorkspaceAssets } from '../../../src/tui/init/services/workspaceScanner.js';

describe('scanWorkspaceAssets', () => {
    let testDir: string;

    beforeEach(() => {
        testDir = mkdtempSync(join(tmpdir(), 'only-one-init-scan-'));
        process.env.ONLY_ONE_HOME = join(testDir, '_mock_home');
    });

    afterEach(() => {
        delete process.env.ONLY_ONE_HOME;
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

    it('should scan new asset categories including combos, mcps, and ignore templates', () => {
        const items = scanWorkspaceAssets(testDir, ['antigravity']);
        const categories = new Set(items.map((i) => i.category));
        expect(categories.has('combo')).toBe(true);
        expect(categories.has('mcp')).toBe(true);
        expect(categories.has('git')).toBe(true);
        expect(categories.has('vs')).toBe(true);
        expect(categories.has('ignore')).toBe(true);
    });

    it('should detect installed combos and skills recorded in project lockfile', () => {
        mkdirSync(join(testDir, 'only-one'), { recursive: true });
        writeFileSync(
            join(testDir, 'only-one', 'installed.json'),
            JSON.stringify({
                schemaVersion: 1,
                installed: {
                    combos: {
                        'frontend-flow': { version: '0.0.13' },
                    },
                },
            }),
        );

        const items = scanWorkspaceAssets(testDir, ['antigravity']);
        const frontendCombo = items.find((i) => i.id === 'combo:frontend-flow');
        expect(frontendCombo).toBeDefined();
        expect(frontendCombo?.isInstalled).toBe(true);
        expect(frontendCombo?.selected).toBe(true);
    });

    it('should detect installed combos from global lockfile', () => {
        const mockHome = join(testDir, '_mock_home');
        mkdirSync(join(mockHome, '.only-one'), { recursive: true });
        writeFileSync(
            join(mockHome, '.only-one', 'installed.json'),
            JSON.stringify({
                schemaVersion: 1,
                installed: {
                    combos: {
                        'only-one-flow': { version: '0.0.16' },
                    },
                },
            }),
        );

        const items = scanWorkspaceAssets(testDir, ['antigravity']);
        const flowCombo = items.find((i) => i.id === 'combo:only-one-flow');
        expect(flowCombo).toBeDefined();
        expect(flowCombo?.isInstalled).toBe(true);
    });

    it('should detect installed git bash profile when destination file exists', () => {
        const mockHome = join(testDir, '_mock_home');
        mkdirSync(mockHome, { recursive: true });
        writeFileSync(join(mockHome, '.bashrc'), '# test bashrc');

        const items = scanWorkspaceAssets(testDir, ['antigravity']);
        const gitbash = items.find((i) => i.id === 'git:gitbash');
        expect(gitbash).toBeDefined();
        expect(gitbash?.isInstalled).toBe(true);
        expect(gitbash?.selected).toBe(true);
    });

    it('should detect installed MCP servers from mcp_config.json', () => {
        const mockHome = join(testDir, '_mock_home');
        const mcpDir = join(mockHome, '.gemini', 'config');
        mkdirSync(mcpDir, { recursive: true });
        writeFileSync(
            join(mcpDir, 'mcp_config.json'),
            JSON.stringify({
                mcpServers: {
                    github: { command: 'npx' },
                    fetch: { command: 'uvx' },
                },
            }),
        );

        const items = scanWorkspaceAssets(testDir, ['antigravity']);
        const githubMcp = items.find((i) => i.id === 'mcp:github');
        expect(githubMcp).toBeDefined();
        expect(githubMcp?.isInstalled).toBe(true);
        expect(githubMcp?.selected).toBe(true);
    });

    it('should detect installed VS Code extensions from extension directory', () => {
        const mockHome = join(testDir, '_mock_home');
        const vsExtDir = join(mockHome, '.vscode', 'extensions');
        mkdirSync(join(vsExtDir, 'dbaeumer.vscode-eslint-3.0.10'), { recursive: true });

        const items = scanWorkspaceAssets(testDir, ['antigravity']);
        const eslintExt = items.find((i) => i.id === 'vs:dbaeumer.vscode-eslint');
        expect(eslintExt).toBeDefined();
        expect(eslintExt?.isInstalled).toBe(true);
        expect(eslintExt?.selected).toBe(true);
    });

    it('should detect globally installed npm packages', () => {
        const mockHome = join(testDir, '_mock_home');
        const globalNpmDir = join(mockHome, 'AppData', 'Roaming', 'npm', 'node_modules', 'ui-ux-pro-max-cli');
        mkdirSync(globalNpmDir, { recursive: true });

        const items = scanWorkspaceAssets(testDir, ['antigravity']);
        const pkg = items.find((i) => i.id === 'package:ui-ux-pro-max-cli');
        expect(pkg).toBeDefined();
        expect(pkg?.isInstalled).toBe(true);
        expect(pkg?.selected).toBe(true);
    });
});
