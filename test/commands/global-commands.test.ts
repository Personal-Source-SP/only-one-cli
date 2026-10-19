import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import type { ProgramDeps } from '@/cli/deps.js';
import { createSkillCommand } from '@/commands/skill/command.js';
import { createWorkflowCommand } from '@/commands/workflow/command.js';
import { createRuleCommand } from '@/commands/rule/command.js';
import { createComboCommand } from '@/commands/combo/command.js';
import { createUpdateCommand } from '@/commands/update/command.js';
import { readInstalledLockfile, resolveInstalledLockfilePath } from '@/core/assets/lockfile.js';

let tempHome: string;

vi.mock('node:os', async () => {
    const actual = await vi.importActual<typeof import('node:os')>('node:os');
    return {
        ...actual,
        homedir: () => tempHome,
    };
});

describe('Global Commands Integration (--global flag)', () => {
    beforeEach(async () => {
        tempHome = await mkdtemp(join(tmpdir(), 'global-cmd-test-'));
    });

    afterEach(async () => {
        if (tempHome && existsSync(tempHome)) {
            await rm(tempHome, { recursive: true, force: true });
        }
    });

    it('installs skills globally into simulated user home directory', async () => {
        const logs: string[] = [];
        const deps: Partial<ProgramDeps> = {
            stdout: (msg) => logs.push(msg),
            cwd: tempHome,
        };

        const cmd = createSkillCommand(deps as ProgramDeps);
        await cmd.parseAsync(['node', 'test', tempHome, 'c4-diagrams', '--tool', 'antigravity', '--global']);

        const skillDest = join(tempHome, '.gemini/config/skills/c4-diagrams/SKILL.md');
        expect(existsSync(skillDest)).toBe(true);

        const lockPath = resolveInstalledLockfilePath(tempHome, true);
        expect(existsSync(lockPath)).toBe(true);

        const lock = await readInstalledLockfile(tempHome, true);
        expect(lock.installed.skills?.['c4-diagrams']).toBeDefined();

        // Must never touch gitignore in homedir
        expect(existsSync(join(tempHome, '.gitignore'))).toBe(false);
    });

    it('installs workflows globally into simulated user home directory', async () => {
        const logs: string[] = [];
        const deps: Partial<ProgramDeps> = {
            stdout: (msg) => logs.push(msg),
            cwd: tempHome,
        };

        const cmd = createWorkflowCommand(deps as ProgramDeps);
        await cmd.parseAsync(['node', 'test', tempHome, 'only-one-idea', '--tool', 'antigravity', '--global']);

        const wfDest = join(tempHome, '.gemini/config/workflows/only-one-idea.md');
        expect(existsSync(wfDest)).toBe(true);

        const lock = await readInstalledLockfile(tempHome, true);
        expect(lock.installed.workflows?.['only-one-idea']).toBeDefined();
        expect(existsSync(join(tempHome, '.gitignore'))).toBe(false);
    });

    it('installs rules globally into simulated user home directory', async () => {
        const logs: string[] = [];
        const deps: Partial<ProgramDeps> = {
            stdout: (msg) => logs.push(msg),
            cwd: tempHome,
        };

        const cmd = createRuleCommand(deps as ProgramDeps);
        await cmd.parseAsync(['node', 'test', tempHome, 'next-architecture-stack', '--tool', 'antigravity', '--global']);

        const ruleDest = join(tempHome, '.gemini/config/rules/02-next-architecture-stack.md');
        expect(existsSync(ruleDest)).toBe(true);

        const lock = await readInstalledLockfile(tempHome, true);
        expect(lock.installed.rules?.['next-architecture-stack']).toBeDefined();
        expect(existsSync(join(tempHome, '.gitignore'))).toBe(false);
    });

    it('applies combo globally across IDE destinations and records combo entry', async () => {
        const logs: string[] = [];
        const deps: Partial<ProgramDeps> = {
            stdout: (msg) => logs.push(msg),
            cwd: tempHome,
        };

        const cmd = createComboCommand(deps as ProgramDeps);
        await cmd.parseAsync(['node', 'test', tempHome, 'git-flow', '--tool', 'antigravity', '--global']);

        const wfDest = join(tempHome, '.gemini/config/workflows/only-one-pr-git.md');
        expect(existsSync(wfDest)).toBe(true);

        const lock = await readInstalledLockfile(tempHome, true);
        expect(lock.installed.combos?.['git-flow']).toBeDefined();
        expect(existsSync(join(tempHome, '.gitignore'))).toBe(false);
    });

    it('updates globally installed assets when update --global is invoked', async () => {
        const logs: string[] = [];
        const deps: Partial<ProgramDeps> = {
            stdout: (msg) => logs.push(msg),
            cwd: tempHome,
        };

        // Preinstall a workflow globally
        const wfCmd = createWorkflowCommand(deps as ProgramDeps);
        await wfCmd.parseAsync(['node', 'test', tempHome, 'only-one-idea', '--tool', 'antigravity', '--global']);

        // Run update globally
        const updateCmd = createUpdateCommand(deps as ProgramDeps);
        await updateCmd.parseAsync(['node', 'test', '--global']);

        const output = logs.join('\n');
        expect(output).toContain('Tracked Asset Status');
        expect(output).toContain('only-one-idea');
    });
});
