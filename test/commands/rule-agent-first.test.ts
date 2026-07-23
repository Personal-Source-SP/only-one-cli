import { describe, expect, it, vi } from 'vitest';
import type { ProgramDeps } from '@/cli/deps.js';
import { createRuleCommand } from '@/commands/rule/command.js';
import { RULES } from '@assets/rules/index.js';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const testProjectDir = join(process.cwd(), 'tmp/rule-command-agent-first-test');

describe('Rule Command Agent-First Selection & Per-Agent Choices (Tasks 2.3, 2.4, 2.5, 2.6)', () => {
    it('prompts agent first, then asks compatible rules per selected agent with checked defaults', async () => {
        const stdoutLogs: string[] = [];
        const checkboxCalls: Array<{ message: string; choices: any[] }> = [];

        const deps: Partial<ProgramDeps> = {
            stdout: (msg) => stdoutLogs.push(msg),
            prompts: {
                checkbox: async (opts) => {
                    checkboxCalls.push({ message: opts.message, choices: opts.choices });
                    if (opts.message.includes('target IDEs/Tools') || opts.message.includes('agents')) {
                        return ['claude'];
                    }
                    if (opts.message.includes('Claude')) {
                        return ['context-minimization'];
                    }
                    return [];
                },
            },
        };

        await rm(testProjectDir, { recursive: true, force: true });
        await mkdir(testProjectDir, { recursive: true });

        const cmd = createRuleCommand(deps as ProgramDeps);
        await cmd.parseAsync(['node', 'test', testProjectDir]);

        expect(checkboxCalls.length).toBe(2);
        expect(checkboxCalls[0].message).toContain('Select target IDEs/Tools');
        expect(checkboxCalls[1].message).toContain('Claude');
        expect(checkboxCalls[1].choices.every((c) => c.checked)).toBe(true);

        await rm(testProjectDir, { recursive: true, force: true });
    });

    it('fails non-interactively if rule IDs are missing', async () => {
        const deps: Partial<ProgramDeps> = { stdout: () => {} };
        await rm(testProjectDir, { recursive: true, force: true });
        await mkdir(testProjectDir, { recursive: true });

        const cmd = createRuleCommand(deps as ProgramDeps);
        await expect(cmd.parseAsync(['node', 'test', testProjectDir, '--tool', 'claude'])).rejects.toThrow();

        await rm(testProjectDir, { recursive: true, force: true });
    });

    it('fails non-interactively if tool target is missing', async () => {
        const deps: Partial<ProgramDeps> = { stdout: () => {} };
        await rm(testProjectDir, { recursive: true, force: true });
        await mkdir(testProjectDir, { recursive: true });

        const cmd = createRuleCommand(deps as ProgramDeps);
        await expect(cmd.parseAsync(['node', 'test', testProjectDir, 'context-minimization'])).rejects.toThrow();

        await rm(testProjectDir, { recursive: true, force: true });
    });
});
