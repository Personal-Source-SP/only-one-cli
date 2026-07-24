import { describe, expect, it, vi } from 'vitest';
import type { ProgramDeps } from '@/cli/deps.js';
import { createSkillCommand } from '@/commands/skill/command.js';
import { createMcpCommand } from '@/commands/mcp/command.ts';
import { createComboCommand } from '@/commands/combo/command.ts';
import { createRuleCommand } from '@/commands/rule/command.ts';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const testProjectDir = join(process.cwd(), 'tmp/verification-prompts-test');

describe('Existing-resource verification prompts & non-TTY skip (Tasks 4.2 & 4.3)', () => {
    it('skills: skips existing skill non-interactively without prompt', async () => {
        const stdoutLogs: string[] = [];
        const deps: Partial<ProgramDeps> = {
            stdout: (msg) => stdoutLogs.push(msg),
        };

        await rm(testProjectDir, { recursive: true, force: true });
        await mkdir(join(testProjectDir, '.agents/skills/only-one-clockify-skill'), { recursive: true });
        await writeFile(join(testProjectDir, '.agents/skills/only-one-clockify-skill/SKILL.md'), 'existing content');

        const cmd = createSkillCommand(deps as ProgramDeps);
        await cmd.parseAsync(['node', 'test', testProjectDir, 'only-one-clockify-skill', '--tool', 'antigravity']);

        const fullLog = stdoutLogs.join('\n');
        expect(fullLog).toContain('Skipped (Kept Existing)');
        expect(fullLog).toContain('only-one-clockify-skill in Antigravity');

        await rm(testProjectDir, { recursive: true, force: true });
    });

    it('rules: skips existing rule non-interactively without prompt', async () => {
        const stdoutLogs: string[] = [];
        const deps: Partial<ProgramDeps> = {
            stdout: (msg) => stdoutLogs.push(msg),
        };

        await rm(testProjectDir, { recursive: true, force: true });
        await mkdir(join(testProjectDir, '.agents/rules'), { recursive: true });
        await writeFile(join(testProjectDir, '.agents/rules/01-context-and-tools.md'), 'existing rule');

        const cmd = createRuleCommand(deps as ProgramDeps);
        await cmd.parseAsync(['node', 'test', testProjectDir, 'context-and-tools', '--tool', 'antigravity']);

        const fullLog = stdoutLogs.join('\n');
        expect(fullLog).toContain('Skipped:');
        expect(fullLog).toContain('context-and-tools in Antigravity');

        await rm(testProjectDir, { recursive: true, force: true });
    });
});
