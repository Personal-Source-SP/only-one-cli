import { describe, expect, it } from 'vitest';
import { planMcps, planSkills } from '@/core/agent/service-planners.js';
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

    it('plans skills and classifies state per IDE target', async () => {
        const cwd = await mkdtemp(join(tmpdir(), 'skill-plan-test-'));
        try {
            await mkdir(join(cwd, '.cursor'), { recursive: true });

            const { skillItems } = await planSkills({
                projectDir: cwd,
                selectedTools: ['cursor'],
                selectedSkillNames: ['only-one-pr-git'],
            });

            expect(skillItems.length).toBe(1);
            expect(skillItems[0].key).toBe('skill:cursor:only-one-pr-git');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});
