import { describe, expect, it, vi } from 'vitest';
import type { ProgramDeps } from '@/cli/deps.js';
import { createPackageCommand } from '@/commands/package/command.js';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const testProjectDir = join(process.cwd(), 'tmp/package-command-test');

describe('Package Command Unit & Integration Tests', () => {
    it('package command performs environment validation, prompts for selection, and installs successfully', async () => {
        const outputs: string[] = [];
        const checkboxCalls: Array<{ message: string; choices: any[] }> = [];

        const deps: Partial<ProgramDeps> = {
            stdout: (msg) => {
                outputs.push(msg);
            },
            prompts: {
                checkbox: async (opts) => {
                    checkboxCalls.push({ message: opts.message, choices: opts.choices });
                    if (opts.message.includes('Select packages to install')) {
                        return ['ui-ux-pro-max-cli'];
                    }
                    return [];
                },
                confirm: async () => true,
                input: async () => '',
            },
        };

        await rm(testProjectDir, { recursive: true, force: true });
        await mkdir(testProjectDir, { recursive: true });

        const cmd = createPackageCommand(deps as ProgramDeps);
        await cmd.parseAsync(['node', 'test', testProjectDir]);

        expect(checkboxCalls.length).toBeGreaterThanOrEqual(1);
        expect(checkboxCalls[0].message).toContain('Select packages to install');

        const outputText = outputs.join('\n');
        expect(outputText).toContain('Installing packages...');

        await rm(testProjectDir, { recursive: true, force: true });
    });
});
