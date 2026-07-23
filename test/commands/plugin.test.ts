import { describe, expect, it, vi } from 'vitest';
import type { ProgramDeps } from '@/cli/deps.js';
import { createPluginCommand } from '@/commands/plugin/command.js';
import { PLUGINS } from '@assets/plugins/index.js';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const testProjectDir = join(process.cwd(), 'tmp/plugin-command-test');

describe('Plugin Command Agent-First Selection & Non-TTY behavior (Tasks 2.1, 2.5, 2.6)', () => {
    it('prompts agent first, then asks compatible plugins per selected agent', async () => {
        const stdoutLogs: string[] = [];
        const checkboxCalls: Array<{ message: string; choices: any[] }> = [];

        const deps: Partial<ProgramDeps> = {
            stdout: (msg) => stdoutLogs.push(msg),
            prompts: {
                checkbox: async (opts) => {
                    checkboxCalls.push({ message: opts.message, choices: opts.choices });
                    if (opts.message.includes('target IDEs/Tools') || opts.message.includes('agents')) {
                        return ['claude', 'cursor'];
                    }
                    if (opts.message.includes('Claude')) {
                        return ['superpowers'];
                    }
                    if (opts.message.includes('Cursor')) {
                        return ['superpowers'];
                    }
                    return [];
                },
            },
        };

        await rm(testProjectDir, { recursive: true, force: true });
        await mkdir(testProjectDir, { recursive: true });

        const cmd = createPluginCommand(deps as ProgramDeps);
        await cmd.parseAsync(['node', 'test', testProjectDir]);

        expect(checkboxCalls.length).toBe(3);
        // Prompt 1: Agents
        expect(checkboxCalls[0].message).toContain('Select target IDEs/Tools');
        // Prompt 2: Plugins for Claude
        expect(checkboxCalls[1].message).toContain('Claude');
        expect(checkboxCalls[1].choices.every((c) => c.checked)).toBe(true);
        // Prompt 3: Plugins for Cursor
        expect(checkboxCalls[2].message).toContain('Cursor');
        expect(checkboxCalls[2].choices.every((c) => c.checked)).toBe(true);

        await rm(testProjectDir, { recursive: true, force: true });
    });

    it('supports selecting different plugins for different agents', async () => {
        const stdoutLogs: string[] = [];
        const deps: Partial<ProgramDeps> = {
            stdout: (msg) => stdoutLogs.push(msg),
            prompts: {
                checkbox: async (opts) => {
                    if (opts.message.includes('target IDEs/Tools') || opts.message.includes('agents')) {
                        return ['claude', 'cursor'];
                    }
                    if (opts.message.includes('Claude')) {
                        return ['superpowers'];
                    }
                    if (opts.message.includes('Cursor')) {
                        return []; // None for Cursor
                    }
                    return [];
                },
            },
        };

        await rm(testProjectDir, { recursive: true, force: true });
        await mkdir(testProjectDir, { recursive: true });

        const cmd = createPluginCommand(deps as ProgramDeps);
        await cmd.parseAsync(['node', 'test', testProjectDir]);

        const fullLog = stdoutLogs.join('\n');
        expect(fullLog).toContain('superpowers (claude)');
        expect(fullLog).not.toContain('superpowers (cursor)');

        await rm(testProjectDir, { recursive: true, force: true });
    });

    it('fails non-interactively if plugin IDs are missing', async () => {
        const deps: Partial<ProgramDeps> = {
            stdout: () => {},
        };

        await rm(testProjectDir, { recursive: true, force: true });
        await mkdir(testProjectDir, { recursive: true });

        const cmd = createPluginCommand(deps as ProgramDeps);
        await expect(cmd.parseAsync(['node', 'test', testProjectDir, '--tool', 'claude'])).rejects.toThrow();

        await rm(testProjectDir, { recursive: true, force: true });
    });

    it('fails non-interactively if tool target is missing', async () => {
        const deps: Partial<ProgramDeps> = {
            stdout: () => {},
        };

        await rm(testProjectDir, { recursive: true, force: true });
        await mkdir(testProjectDir, { recursive: true });

        const cmd = createPluginCommand(deps as ProgramDeps);
        await expect(cmd.parseAsync(['node', 'test', testProjectDir, 'superpowers'])).rejects.toThrow();

        await rm(testProjectDir, { recursive: true, force: true });
    });

    it('fails preflight if an explicit plugin is incompatible with explicit target', async () => {
        const deps: Partial<ProgramDeps> = {
            stdout: () => {},
        };

        await rm(testProjectDir, { recursive: true, force: true });
        await mkdir(testProjectDir, { recursive: true });

        const cmd = createPluginCommand(deps as ProgramDeps);
        // Assuming fake-plugin is unknown or incompatible
        await expect(cmd.parseAsync(['node', 'test', testProjectDir, 'nonexistent-plugin', '--tool', 'claude'])).rejects.toThrow();

        await rm(testProjectDir, { recursive: true, force: true });
    });
});
