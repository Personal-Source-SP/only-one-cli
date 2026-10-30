import { existsSync } from 'node:fs';
import { mkdir as mkdirP, readFile as fsReadFile, rm as rmP } from 'node:fs/promises';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import type { ProgramDeps } from '@/cli/deps.js';
import { createWorkflowCommand } from '@/commands/workflow/command.js';

const testProjectDir = join(process.cwd(), 'tmp/workflow-command-test');

describe('Workflow Command Unit & Integration Tests (Deprecated & Forwarded)', () => {
    it('outputs deprecation warning and redirects workflow command to skill command', async () => {
        const outputs: string[] = [];
        const checkboxCalls: Array<{ message: string; choices: any[] }> = [];
        const deps: Partial<ProgramDeps> = {
            stdout: (msg) => {
                outputs.push(msg);
            },
            prompts: {
                checkbox: async (opts) => {
                    checkboxCalls.push({ message: opts.message, choices: opts.choices });

                    if (opts.message.includes('target IDEs/Tools')) return ['antigravity'];

                    if (opts.message.includes('skills to add')) return ['only-one-idea'];

                    return [];
                },
            },
        };

        await rmP(testProjectDir, { recursive: true, force: true });
        await mkdirP(testProjectDir, { recursive: true });

        const cmd = createWorkflowCommand(deps as ProgramDeps);
        await cmd.parseAsync(['node', 'test', testProjectDir]);

        expect(outputs.some((msg) => msg.includes('[DEPRECATED]') && msg.includes('only-one skill'))).toBe(true);
        expect(checkboxCalls.length).toBe(3);
        expect(checkboxCalls[0].message).toContain('Select target IDEs/Tools');
        expect(checkboxCalls[1].message).toContain('Select custom skills to add');

        await rmP(testProjectDir, { recursive: true, force: true });
    });

    it('redirects direct workflow installation to skill installation', async () => {
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
        await cmd.parseAsync(['node', 'test', testProjectDir, 'only-one-clean']);

        const cleanSkillDest = join(testProjectDir, '.agents/skills/only-one-clean/SKILL.md');

        expect(outputs.some((msg) => msg.includes('[DEPRECATED]'))).toBe(true);
        expect(existsSync(cleanSkillDest)).toBe(true);

        await rmP(testProjectDir, { recursive: true, force: true });
    });

    it('ensures only-one-idea and only-one-plan do not retain conversational english coaching or english learning extraction', async () => {
        const ideaContent = await fsReadFile(join(process.cwd(), 'assets/agents/skills/only-one-idea/SKILL.md'), 'utf-8');
        const planContent = await fsReadFile(join(process.cwd(), 'assets/agents/skills/only-one-plan/SKILL.md'), 'utf-8');

        expect(ideaContent).not.toContain('conversational-english-coaching');
        expect(ideaContent).not.toContain('english-learning-extraction');
        expect(planContent).not.toContain('conversational-english-coaching');
    });
});
