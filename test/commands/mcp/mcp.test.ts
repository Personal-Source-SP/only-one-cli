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

            await program.parseAsync(['mcp', 'github', '--ide', 'cursor'], { from: 'user' });

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

it('rejects unsupported targets before writing configuration', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'mcp-invalid-target-'));
    const tempHome = join(cwd, 'home');

    try {
        const program = createProgram({
            cwd,
            env: { HOME: tempHome, USERPROFILE: tempHome },
            fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
            stdout: () => undefined,
        });

        await expect(program.parseAsync(['mcp', 'github', '--ide', 'vscode'], { from: 'user' })).rejects.toThrow(
            "Unsupported target 'vscode'. Valid targets: antigravity, claude, cursor, codex",
        );
        expect(existsSync(tempHome)).toBe(false);
    } finally {
        await rm(cwd, { recursive: true, force: true });
    }
});

it('selects every MCP-capable target with --ide all', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'mcp-all-targets-'));
    const tempHome = join(cwd, 'home');

    try {
        const program = createProgram({
            cwd,
            env: { HOME: tempHome, USERPROFILE: tempHome },
            fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
            stdout: () => undefined,
        });

        await program.parseAsync(['mcp', 'github', '--ide', 'all'], { from: 'user' });

        expect(existsSync(join(tempHome, 'Library', 'Application Support', 'Antigravity IDE', 'User', 'mcp.json'))).toBe(true);
    } finally {
        await rm(cwd, { recursive: true, force: true });
    }
});

it('configures gitnexus via CLI without requiring manual credential instructions in report output', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'mcp-gitnexus-test-'));
    const tempHome = join(cwd, 'home');
    const writes: string[] = [];

    try {
        await mkdir(join(tempHome, '.cursor'), { recursive: true });

        const program = createProgram({
            cwd,
            env: { HOME: tempHome, USERPROFILE: tempHome },
            fetcher: vi.fn(async () => ({ ok: true, json: async () => ({}) })),
            stdout: (line) => writes.push(line),
        });

        await program.parseAsync(['mcp', 'gitnexus', '--ide', 'cursor'], { from: 'user' });

        const output = writes.join('\n');
        expect(output).toContain('MCP SYNC REPORT');
        expect(output).toContain('gitnexus');
        expect(output).not.toContain('fill manually');

        const mcpJsonPath = join(tempHome, '.cursor', 'mcp.json');
        expect(existsSync(mcpJsonPath)).toBe(true);

        const mcpContent = await readFile(mcpJsonPath, 'utf-8');
        expect(mcpContent).toContain('gitnexus@latest');
        expect(mcpContent).toContain('GITNEXUS_MCP_READ_ONLY');
    } finally {
        await rm(cwd, { recursive: true, force: true });
    }
});
