import { describe, expect, it } from 'vitest';
import type { ProgramDeps } from '@/cli/deps.js';
import { createInitCommand } from '@/commands/init/command.ts';
import { createComboCommand } from '@/commands/combo/command.ts';
import { createMcpCommand } from '@/commands/mcp/command.ts';
import { createPluginCommand } from '@/commands/plugin/command.ts';
import { createRuleCommand } from '@/commands/rule/command.ts';
import { createSkillCommand } from '@/commands/skill/command.ts';

describe('CLI-wide --yes rejection (Task 3.1)', () => {
    const deps: Partial<ProgramDeps> = {
        stdout: () => {},
    };

    it('rejects --yes on init command', async () => {
        const cmd = createInitCommand(deps as ProgramDeps);
        await expect(cmd.parseAsync(['node', 'test', '--yes'])).rejects.toThrow();
    });

    it('rejects --yes on init package command', async () => {
        const cmd = createInitCommand(deps as ProgramDeps);
        await expect(cmd.parseAsync(['node', 'test', 'package', '--yes'])).rejects.toThrow();
    });

    it('rejects --yes on init skill command', async () => {
        const cmd = createInitCommand(deps as ProgramDeps);
        await expect(cmd.parseAsync(['node', 'test', 'skill', '--yes'])).rejects.toThrow();
    });

    it('rejects --yes on init configs command', async () => {
        const cmd = createInitCommand(deps as ProgramDeps);
        await expect(cmd.parseAsync(['node', 'test', 'configs', '--yes'])).rejects.toThrow();
    });

    it('rejects --yes on init combo command', async () => {
        const cmd = createInitCommand(deps as ProgramDeps);
        await expect(cmd.parseAsync(['node', 'test', 'combo', '--yes'])).rejects.toThrow();
    });

    it('rejects --yes on init mcp command', async () => {
        const cmd = createInitCommand(deps as ProgramDeps);
        await expect(cmd.parseAsync(['node', 'test', 'mcp', '--yes'])).rejects.toThrow();
    });

    it('rejects --yes on standalone combo command', async () => {
        const cmd = createComboCommand(deps as ProgramDeps);
        await expect(cmd.parseAsync(['node', 'test', '--yes'])).rejects.toThrow();
    });

    it('rejects --yes on standalone mcp command', async () => {
        const cmd = createMcpCommand(deps as ProgramDeps);
        await expect(cmd.parseAsync(['node', 'test', '--yes'])).rejects.toThrow();
    });

    it('rejects --yes on standalone plugin command', async () => {
        const cmd = createPluginCommand(deps as ProgramDeps);
        await expect(cmd.parseAsync(['node', 'test', '--yes'])).rejects.toThrow();
    });

    it('rejects --yes on standalone rule command', async () => {
        const cmd = createRuleCommand(deps as ProgramDeps);
        await expect(cmd.parseAsync(['node', 'test', '--yes'])).rejects.toThrow();
    });

    it('rejects --yes on standalone skill command', async () => {
        const cmd = createSkillCommand(deps as ProgramDeps);
        await expect(cmd.parseAsync(['node', 'test', '--yes'])).rejects.toThrow();
    });
});
