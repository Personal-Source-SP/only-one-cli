import { describe, expect, it } from 'vitest';
import { planMcps, planSkills, planWorkflows } from '@/core/agent/service-planners.js';
import { mkdtemp, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('Agent Planners (Tasks 3.1 - 3.7)', () => {
    it('plans MCPs without side effects and classifies state per IDE target', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'mcp-plan-test-'));
        try {
            const items = await planMcps({
                targetIdeIds: ['cursor', 'antigravity'],
                selectedMcpNames: ['github'],
                homeDir: cwd,
            });

            expect(items.length).toBe(2);
            expect(items.some((i) => i.key === 'mcp:cursor:github')).toBe(true);
            expect(items.some((i) => i.key === 'mcp:antigravity:github')).toBe(true);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('plans skills and plans workflows expanding required skills/MCPs', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'skill-plan-test-'));
        try {
            await mkdir(join(cwd, '.cursor'), { recursive: true });

            const { skillItems } = await planSkills({
                projectDir: cwd,
                selectedTools: ['cursor'],
                selectedSkillNames: ['only-one-pr-git-skill'],
            });

            expect(skillItems.length).toBe(1);
            expect(skillItems[0].key).toBe('skill:cursor:only-one-pr-git-skill');

            // only-one-pr-git workflow has required skill only-one-pr-git-skill and required MCP github
            const {
                workflowItems,
                skillItems: autoSkills,
                mcpItems,
            } = await planWorkflows({
                projectDir: cwd,
                selectedTools: ['cursor'],
                selectedWorkflowNames: ['only-one-pr-git'],
            });

            expect(workflowItems.length).toBe(1);
            expect(workflowItems[0].name).toBe('only-one-pr-git');
            expect(autoSkills.length).toBe(1);
            expect(autoSkills[0].name).toBe('only-one-pr-git-skill');
            expect(autoSkills[0].origin).toBe('auto-required');
            expect(mcpItems.length).toBe(1);
            expect(mcpItems[0].name).toBe('github');
            expect(mcpItems[0].origin).toBe('auto-required');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});
