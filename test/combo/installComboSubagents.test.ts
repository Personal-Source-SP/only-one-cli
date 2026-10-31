import { describe, expect, it } from 'vitest';

import { COMBOS } from '../../assets/agents/combos/index';
import { AI_TOOLS, resolveToolDestinationPaths } from '../../src/core/agent/tools';

describe('Combo Subagents Distribution & Path Routing', () => {
    const antigravityTool = AI_TOOLS.find((t) => t.value === 'antigravity')!;
    const claudeTool = AI_TOOLS.find((t) => t.value === 'claude')!;

    describe('resolveToolDestinationPaths for subagents', () => {
        it('should resolve global subagents path for Antigravity to ~/.gemini/config/agents', () => {
            const homeDir = process.platform === 'win32' ? 'C:\\Users\\test' : '/home/test';
            const resolved = resolveToolDestinationPaths(antigravityTool, 'subagents' as any, homeDir, true);
            const normalized = resolved.replace(/\\/g, '/');
            expect(normalized).toContain('.gemini/config/agents');
        });

        it('should resolve workspace subagents path for Antigravity to .agents/agents', () => {
            const projectDir = '/workspace/my-app';
            const resolved = resolveToolDestinationPaths(antigravityTool, 'subagents' as any, projectDir, false);
            const normalized = resolved.replace(/\\/g, '/');
            expect(normalized).toContain('.agents/agents');
        });

        it('should resolve global subagents path for Claude Code to ~/.claude/agents', () => {
            const homeDir = process.platform === 'win32' ? 'C:\\Users\\test' : '/home/test';
            const resolved = resolveToolDestinationPaths(claudeTool, 'subagents' as any, homeDir, true);
            const normalized = resolved.replace(/\\/g, '/');
            expect(normalized).toContain('.claude/agents');
        });
    });

    describe('COMBOS manifest subagents configuration', () => {
        it('should include all 4 subagents in only-one-flow', () => {
            const universalCombo = COMBOS.find((c) => c.id === 'only-one-flow');
            expect(universalCombo).toBeDefined();
            expect(universalCombo?.subagents).toEqual(
                expect.arrayContaining(['codebase-scout', 'terminal-runner', 'browser-tester', 'api-tester']),
            );
        });

        it('should include browser-tester and codebase-scout in frontend-flow', () => {
            const frontendCombo = COMBOS.find((c) => c.id === 'frontend-flow');
            expect(frontendCombo).toBeDefined();
            expect(frontendCombo?.subagents).toEqual(expect.arrayContaining(['browser-tester', 'codebase-scout']));
        });

        it('should include api-tester, terminal-runner and codebase-scout in backend-flow', () => {
            const backendCombo = COMBOS.find((c) => c.id === 'backend-flow');
            expect(backendCombo).toBeDefined();
            expect(backendCombo?.subagents).toEqual(expect.arrayContaining(['api-tester', 'terminal-runner', 'codebase-scout']));
        });
    });
});
