import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ProgramDeps } from '@/cli/deps.js';
import { createComboCommand } from '@/commands/combo/command.js';
import { createRuleCommand } from '@/commands/rule/command.js';
import { createSkillCommand } from '@/commands/skill/command.js';
import { createUpdateCommand } from '@/commands/update/command.js';
import { createWorkflowCommand } from '@/commands/workflow/command.js';
import { resolveToolDestinationPaths } from '@/core/agent/tools.js';
import { readInstalledLockfile, resolveInstalledLockfilePath } from '@/core/assets/lockfile.js';

let tempHome: string;

vi.mock('node:os', async () => {
    const actual = await vi.importActual<typeof import('node:os')>('node:os');

    return {
        ...actual,
        homedir: () => tempHome,
    };
});

vi.mock('@/core/skill/remote/skills-sh-installer.js', async () => {
    const actual = await vi.importActual<typeof import('@/core/skill/remote/skills-sh-installer.js')>(
        '@/core/skill/remote/skills-sh-installer.js',
    );

    return {
        ...actual,
        installSkillViaSkillsCli: vi.fn(async ({ projectDir, skillName, selectedTools, isGlobal }: any) => {
            for (const tool of selectedTools) {
                const targetSkillDir = resolveToolDestinationPaths(tool, 'skills', projectDir, isGlobal);
                const destPath = join(targetSkillDir, skillName);
                await mkdir(destPath, { recursive: true });
                await writeFile(join(destPath, 'SKILL.md'), `# ${skillName}\n`, 'utf-8');
            }
        }),
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
        expect(existsSync(join(tempHome, '.gemini/config/skills.json'))).toBe(false);
        expect(existsSync(join(tempHome, '.agents'))).toBe(false);

        const lockPath = resolveInstalledLockfilePath(tempHome, true);
        expect(existsSync(lockPath)).toBe(true);

        const lock = await readInstalledLockfile(tempHome, true);
        expect(lock.installed.skills?.['c4-diagrams']).toBeDefined();

        // Must never touch gitignore in homedir
        expect(existsSync(join(tempHome, '.gitignore'))).toBe(false);
    });

    it('redirects workflow install globally into skills in simulated user home directory', async () => {
        const logs: string[] = [];
        const deps: Partial<ProgramDeps> = {
            stdout: (msg) => logs.push(msg),
            cwd: tempHome,
        };

        const cmd = createWorkflowCommand(deps as ProgramDeps);
        await cmd.parseAsync(['node', 'test', tempHome, 'only-one-idea', '--tool', 'antigravity', '--global']);

        const skillDest = join(tempHome, '.gemini/config/skills/only-one-idea/SKILL.md');
        expect(existsSync(skillDest)).toBe(true);

        const lock = await readInstalledLockfile(tempHome, true);
        expect(lock.installed.skills?.['only-one-idea']).toBeDefined();
        expect(logs.some((msg) => msg.includes('[DEPRECATED]'))).toBe(true);
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
        await cmd.parseAsync(['node', 'test', tempHome, 'only-one-flow', '--tool', 'antigravity', '--global']);

        expect(existsSync(join(tempHome, '.gemini/config/skills/only-one-pr-git/SKILL.md'))).toBe(true);
        expect(existsSync(join(tempHome, '.gemini/config/workflows'))).toBe(false);
        expect(existsSync(join(tempHome, '.gemini/config/hooks/block-heavy-scripts.sh'))).toBe(true);
        expect(existsSync(join(tempHome, '.gemini/config/hooks.json'))).toBe(true);
        expect(existsSync(join(tempHome, '.agents'))).toBe(false);

        const lock = await readInstalledLockfile(tempHome, true);
        expect(lock.installed.combos?.['only-one-flow']).toBeDefined();
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

    it('installs skills globally into specific IDE directory when --tool cursor is specified', async () => {
        const logs: string[] = [];
        const deps: Partial<ProgramDeps> = {
            stdout: (msg) => logs.push(msg),
            cwd: tempHome,
        };

        const cmd = createSkillCommand(deps as ProgramDeps);
        await cmd.parseAsync(['node', 'test', tempHome, 'c4-diagrams', '--tool', 'cursor', '--global']);

        const skillDest = join(tempHome, '.cursor/skills/c4-diagrams/SKILL.md');
        expect(existsSync(skillDest)).toBe(true);
        expect(existsSync(join(tempHome, '.gitignore'))).toBe(false);
    });
});
