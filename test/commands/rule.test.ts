import { describe, expect, it, vi } from 'vitest';
import type { ProgramDeps } from '@/cli/deps.js';
import { AllowedToolId } from '@/constants/allowed-tools.js';
import { createRuleCommand } from '@/commands/rule/command.js';
import { createPluginCommand } from '@/commands/plugin/command.js';
import { installRules } from '@/core/rule/index.js';
import { RULES } from '@assets/rules/index.js';
import { getAllowedRuleTargets } from '@/core/target-selection/catalog.js';
import { mkdir, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const testProjectDir = join(process.cwd(), 'tmp/rule-command-test');

describe('Rule Command & Installation Integration (Tasks 4.1 - 4.5)', () => {
    it('only-one rule command rejects explicit Codex target before side effects', async () => {
        const stdoutLogs: string[] = [];
        const deps: Partial<ProgramDeps> = {
            stdout: (msg) => stdoutLogs.push(msg),
        };

        await rm(testProjectDir, { recursive: true, force: true });
        await mkdir(testProjectDir, { recursive: true });

        const cmd = createRuleCommand(deps as ProgramDeps);

        await expect(cmd.parseAsync(['node', 'test', testProjectDir, 'context-minimization', '--tool', 'codex'])).rejects.toThrow(
            "Unsupported target 'codex'. Valid targets: antigravity, claude, cursor",
        );
    });

    it('copies context-minimization rule file to native target paths for Antigravity, Claude, and Cursor', async () => {
        const stdoutLogs: string[] = [];
        const deps: Partial<ProgramDeps> = {
            stdout: (msg) => stdoutLogs.push(msg),
        };

        await rm(testProjectDir, { recursive: true, force: true });
        await mkdir(testProjectDir, { recursive: true });

        const selectedTargets = getAllowedRuleTargets(); // Antigravity, Claude, Cursor

        const mockExecFileAsync = vi.fn(async () => ({ stdout: '', stderr: '' }));

        const { results } = await installRules({
            deps: deps as ProgramDeps,
            projectDir: testProjectDir,
            selectedTargets,
            ruleIds: ['context-minimization'],
            execFileAsync: mockExecFileAsync,
        });

        // Verify native file copy locations
        expect(existsSync(join(testProjectDir, '.agents/rules/context-minimization.md'))).toBe(true);
        expect(existsSync(join(testProjectDir, '.claude/rules/context-minimization.md'))).toBe(true);
        expect(existsSync(join(testProjectDir, '.cursor/rules/context-minimization.md'))).toBe(true);

        const content = await readFile(join(testProjectDir, '.agents/rules/context-minimization.md'), 'utf-8');
        expect(content).toContain('# Context Minimization');
        expect(content).toContain('Code Discovery & Analysis');

        // Cleanup
        await rm(testProjectDir, { recursive: true, force: true });
    });
});
