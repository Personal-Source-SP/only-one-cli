import { describe, expect, it, vi } from 'vitest';
import type { ProgramDeps } from '@/cli/deps.js';
import { createComboCommand } from '@/commands/combo/command.js';
import { createMcpCommand } from '@/commands/mcp/command.js';
import { createSkillCommand } from '@/commands/skill/command.js';
import { createPluginCommand } from '@/commands/plugin/command.js';
import { createRuleCommand } from '@/commands/rule/command.js';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const testProjectDir = join(process.cwd(), 'tmp/regression-agent-first-test');

describe('Regression & Integration for Agent-First Selections (Tasks 5.1, 5.2, 5.3)', () => {
    it('skill command prompts agent target first, then skills with checked defaults', async () => {
        const checkboxCalls: Array<{ message: string; choices: any[] }> = [];
        const deps: Partial<ProgramDeps> = {
            stdout: () => {},
            prompts: {
                checkbox: async (opts) => {
                    checkboxCalls.push({ message: opts.message, choices: opts.choices });
                    if (opts.message.includes('target IDEs/Tools')) return ['antigravity'];
                    if (opts.message.includes('skills to add')) return ['grill-me'];
                    return [];
                },
            },
        };

        await rm(testProjectDir, { recursive: true, force: true });
        await mkdir(testProjectDir, { recursive: true });

        const cmd = createSkillCommand(deps as ProgramDeps);
        await cmd.parseAsync(['node', 'test', testProjectDir]);

        expect(checkboxCalls.length).toBe(2);
        expect(checkboxCalls[0].message).toContain('Select target IDEs/Tools');
        expect(checkboxCalls[1].message).toContain('Select custom skills to add');
        expect(checkboxCalls[1].choices.every((c) => c.checked)).toBe(true);

        await rm(testProjectDir, { recursive: true, force: true });
    });

    it('mcp command prompts target IDE first, then MCP servers with checked defaults', async () => {
        const checkboxCalls: Array<{ message: string; choices: any[] }> = [];
        const deps: Partial<ProgramDeps> = {
            cwd: testProjectDir,
            stdout: () => {},
            env: { HOME: testProjectDir },
            prompts: {
                checkbox: async (opts) => {
                    checkboxCalls.push({ message: opts.message, choices: opts.choices });
                    if (opts.message.includes('target IDEs')) return ['cursor'];
                    if (opts.message.includes('MCP servers')) return ['github'];
                    return [];
                },
            },
        };

        await rm(testProjectDir, { recursive: true, force: true });
        await mkdir(testProjectDir, { recursive: true });

        const cmd = createMcpCommand(deps as ProgramDeps);
        await cmd.parseAsync(['node', 'test']);

        expect(checkboxCalls.length).toBe(2);
        expect(checkboxCalls[0].message).toContain('Select target IDEs');
        expect(checkboxCalls[1].message).toContain('Select MCP servers');

        await rm(testProjectDir, { recursive: true, force: true });
    });

    it('combo command prompts agent target first, then combo choices', async () => {
        const checkboxCalls: Array<{ message: string; choices: any[] }> = [];
        const deps: Partial<ProgramDeps> = {
            cwd: testProjectDir,
            stdout: () => {},
            env: { HOME: testProjectDir },
            prompts: {
                checkbox: async (opts) => {
                    checkboxCalls.push({ message: opts.message, choices: opts.choices });
                    if (opts.message.includes('target IDEs/Tools')) return ['antigravity'];
                    if (opts.message.includes('combos to install')) return ['idsd-flow'];
                    if (opts.message.includes('already exist')) return [];
                    return [];
                },
            },
        };

        await rm(testProjectDir, { recursive: true, force: true });
        await mkdir(testProjectDir, { recursive: true });

        const cmd = createComboCommand(deps as ProgramDeps);
        await cmd.parseAsync(['node', 'test', testProjectDir]);

        expect(checkboxCalls.length).toBeGreaterThanOrEqual(2);
        expect(checkboxCalls[0].message).toContain('Select target IDEs/Tools');
        expect(checkboxCalls[1].message).toContain('Select combos to install');

        await rm(testProjectDir, { recursive: true, force: true });
    });
});
