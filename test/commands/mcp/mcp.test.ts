import { describe, expect, it, vi } from 'vitest';
import { mkdtemp, rm, mkdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { existsSync, writeFileSync } from 'node:fs';
import { createProgram } from '@src/index.js';

describe('mcp command', () => {
    it('configures selected MCP servers in Cursor global mcp.json', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'mcp-test-'));
        const tempHome = join(cwd, 'home');
        const writes: string[] = [];

        try {
            await mkdir(join(tempHome, '.cursor'), { recursive: true });

            const program = createProgram({
                cwd,
                env: { HOME: tempHome, USERPROFILE: tempHome },
                fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
                stdout: (line) => writes.push(line),
                prompts: {
                    checkbox: vi.fn().mockResolvedValue(['cursor']),
                },
            });

            await program.parseAsync(['mcp', 'github', '--ide', 'cursor', '--yes'], { from: 'user' });

            const output = writes.join('\n');
            expect(output).toContain('MCP SYNC REPORT');
            expect(output).toContain('github');

            const mcpJsonPath = join(tempHome, '.cursor', 'mcp.json');
            expect(existsSync(mcpJsonPath)).toBe(true);

            const mcpContent = await readFile(mcpJsonPath, 'utf-8');
            expect(mcpContent).toContain('server-github');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});
