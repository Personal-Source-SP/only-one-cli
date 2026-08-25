import { describe, expect, it, vi } from 'vitest';
import type { ProgramDeps } from '@/cli/deps.js';
import { createWorkflowCommand } from '@/commands/workflow/command.js';
import { mkdir, rm, writeFile, existsSync } from 'node:fs';
import { mkdir as mkdirP, rm as rmP, readFile as fsReadFile } from 'node:fs/promises';
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

        expect(checkboxCalls.length).toBe(3);
        expect(checkboxCalls[0].message).toContain('Select target IDEs/Tools');
        expect(checkboxCalls[1].message).toContain('Select workflows to add');

        await rmP(testProjectDir, { recursive: true, force: true });
    });

    it('installs workflows without implicitly installing skills', async () => {
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
        expect(existsSync(skillDest)).toBe(false);

        await rmP(testProjectDir, { recursive: true, force: true });
    });

    it('installs only-one-archive and only-one-clean workflows properly', async () => {
        const deps: Partial<ProgramDeps> = {
            stdout: () => {},
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
        await cmd.parseAsync(['node', 'test', testProjectDir, 'only-one-archive,only-one-clean']);

        const archiveDest = join(testProjectDir, '.agents/workflows/only-one-archive.md');
        const cleanDest = join(testProjectDir, '.agents/workflows/only-one-clean.md');

        expect(existsSync(archiveDest)).toBe(true);
        expect(existsSync(cleanDest)).toBe(true);

        await rmP(testProjectDir, { recursive: true, force: true });
    });

    it('ensures only-one-idea and only-one-plan contain English learning specifications', async () => {
        const ideaContent = await fsReadFile(join(process.cwd(), 'assets/workflows/only-one-idea.md'), 'utf-8');
        const planContent = await fsReadFile(join(process.cwd(), 'assets/workflows/only-one-plan.md'), 'utf-8');

        expect(ideaContent).toContain('conversational-english-coaching');
        expect(ideaContent).toContain('english-learning-extraction');
        expect(ideaContent).toContain('## 7. Technical English Key Patterns');

        expect(planContent).toContain('conversational-english-coaching');
        expect(planContent).toContain('english-learning-extraction');
        expect(planContent).toContain('Section 6. Technical English Key Patterns');
    });
});
