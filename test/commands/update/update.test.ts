import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ProgramDeps } from '@/cli/deps.js';
import { createUpdateCommand } from '@/commands/update/command.js';
import { recordInstalledAssetsBatch, readInstalledLockfile } from '@/core/assets/lockfile.js';

describe('Update Command Integration Tests', () => {
    let testProjectDir: string;

    beforeEach(async () => {
        testProjectDir = await mkdtemp(join(tmpdir(), 'only-one-update-test-'));
    });

    afterEach(async () => {
        await rm(testProjectDir, { recursive: true, force: true });
    });

    it('automatically restores missing asset files on disk during update', async () => {
        const stdoutLines: string[] = [];
        const deps: Partial<ProgramDeps> = {
            stdout: (msg: string) => stdoutLines.push(msg),
            stderr: () => {},
            cwd: testProjectDir,
        };

        // Record a valid workflow in lockfile, but do NOT create the file on disk
        await recordInstalledAssetsBatch(testProjectDir, [{ type: 'workflows', id: 'only-one-clockify', version: '1.0.0' }]);

        const targetFilePath = join(testProjectDir, '.agents/workflows/only-one-clockify.md');
        expect(existsSync(targetFilePath)).toBe(false);

        const cmd = createUpdateCommand(deps as ProgramDeps);
        await cmd.parseAsync(['node', 'test', testProjectDir]);

        const output = stdoutLines.join('\n');
        expect(output).toContain('Missing');
        expect(output).toContain('Restored Missing Assets');
        expect(existsSync(targetFilePath)).toBe(true);
    });

    it('warns about orphaned assets and prunes them when --prune is provided', async () => {
        const stdoutLines1: string[] = [];
        const deps1: Partial<ProgramDeps> = {
            stdout: (msg: string) => stdoutLines1.push(msg),
            stderr: () => {},
            cwd: testProjectDir,
        };

        // Create an orphaned workflow in lockfile and on disk
        await recordInstalledAssetsBatch(testProjectDir, [{ type: 'workflows', id: 'obsolete-workflow', version: '1.0.0' }]);
        const orphanFile = join(testProjectDir, '.agents/workflows/obsolete-workflow.md');
        await mkdir(join(testProjectDir, '.agents/workflows'), { recursive: true });
        await writeFile(orphanFile, '# Obsolete\n');

        // 1. Run update without --prune -> should warn but NOT delete
        const cmd1 = createUpdateCommand(deps1 as ProgramDeps);
        await cmd1.parseAsync(['node', 'test', testProjectDir]);

        const output1 = stdoutLines1.join('\n');
        expect(output1).toContain('orphaned asset(s) no longer provided upstream');
        expect(output1).toContain('obsolete-workflow');
        expect(output1).toContain('Run "only-one update --prune"');
        expect(existsSync(orphanFile)).toBe(true);

        // 2. Run update with --prune -> should delete file and clean lockfile
        const stdoutLines2: string[] = [];
        const deps2: Partial<ProgramDeps> = {
            stdout: (msg: string) => stdoutLines2.push(msg),
            stderr: () => {},
            cwd: testProjectDir,
        };

        const cmd2 = createUpdateCommand(deps2 as ProgramDeps);
        await cmd2.parseAsync(['node', 'test', testProjectDir, '--prune']);

        const output2 = stdoutLines2.join('\n');
        expect(output2).toContain('Pruned Orphaned Assets');
        expect(output2).toContain('obsolete-workflow');
        expect(existsSync(orphanFile)).toBe(false);

        const lockfile = await readInstalledLockfile(testProjectDir);
        expect(lockfile.installed.workflows?.['obsolete-workflow']).toBeUndefined();
    });

    it('supports json output with asset prune and restore details', async () => {
        const stdoutLines: string[] = [];
        const deps: Partial<ProgramDeps> = {
            stdout: (msg: string) => stdoutLines.push(msg),
            stderr: () => {},
            cwd: testProjectDir,
        };

        await recordInstalledAssetsBatch(testProjectDir, [{ type: 'workflows', id: 'obsolete-workflow', version: '1.0.0' }]);

        const { Command } = await import('commander');
        const root = new Command();
        root.option('--json');
        root.addCommand(createUpdateCommand(deps as ProgramDeps));

        await root.parseAsync(['node', 'test', 'update', testProjectDir, '--prune', '--json']);

        const jsonOutput = stdoutLines.join('\n');
        const parsed = JSON.parse(jsonOutput);
        expect(parsed.assets).toBeDefined();
        expect(parsed.assets.removed.length).toBe(1);
        expect(parsed.assets.removed[0].id).toBe('obsolete-workflow');
        expect(parsed.assets.pruned.pruned.length).toBe(1);
    });
});
