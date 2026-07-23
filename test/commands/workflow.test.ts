import { describe, expect, it, vi } from 'vitest';
import type { ProgramDeps } from '@/cli/deps.js';
import { createWorkflowCommand } from '@/commands/workflow/command.js';
import { mkdir, rm, writeFile, existsSync } from 'node:fs';
import { mkdir as mkdirP, rm as rmP } from 'node:fs/promises';
import { join } from 'node:path';

const testProjectDir = join(process.cwd(), 'tmp/workflow-command-test');

describe('Workflow Command Unit & Integration Tests', () => {
    it('workflow command prompts agent target first, then workflows', async () => {
        const checkboxCalls: Array<{ message: string; choices: any[] }> = [];
        const deps: Partial<ProgramDeps> = {
            stdout: () => {},
            prompts: {
                checkbox: async (opts) => {
                    checkboxCalls.push({ message: opts.message, choices: opts.choices });
                    if (opts.message.includes('target IDEs/Tools')) return ['antigravity'];
                    if (opts.message.includes('workflows to add')) return ['only-one-clockify'];
                    return [];
                },
            },
        };

        await rmP(testProjectDir, { recursive: true, force: true });
        await mkdirP(testProjectDir, { recursive: true });

        const cmd = createWorkflowCommand(deps as ProgramDeps);
        await cmd.parseAsync(['node', 'test', testProjectDir]);

        expect(checkboxCalls.length).toBe(2);
        expect(checkboxCalls[0].message).toContain('Select target IDEs/Tools');
        expect(checkboxCalls[1].message).toContain('Select workflows to add');

        await rmP(testProjectDir, { recursive: true, force: true });
    });

    it('installs workflows and required dependency skills', async () => {
        const outputs: string[] = [];
        const deps: Partial<ProgramDeps> = {
            stdout: (msg) => {
                outputs.push(msg);
            },
            prompts: {
                checkbox: async (opts) => {
                    if (opts.message.includes('target IDEs/Tools')) return ['antigravity'];
                    return [];
                },
            },
        };

        await rmP(testProjectDir, { recursive: true, force: true });
        await mkdirP(testProjectDir, { recursive: true });

        const cmd = createWorkflowCommand(deps as ProgramDeps);
        // Cài đặt trực tiếp qua đối số
        await cmd.parseAsync(['node', 'test', testProjectDir, 'only-one-clockify']);

        const workflowDest = join(testProjectDir, '.agents/workflows/only-one-clockify.md');
        const skillDest = join(testProjectDir, '.agents/skills/only-one-clockify-skill/SKILL.md');

        expect(existsSync(workflowDest)).toBe(true);
        expect(existsSync(skillDest)).toBe(true);

        await rmP(testProjectDir, { recursive: true, force: true });
    });
});
