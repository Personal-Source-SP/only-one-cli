import { describe, expect, it, vi } from 'vitest';
import { selectSingleTarget, selectSingleAllowedAgentTarget } from '@/core/target-selection/single-selection.js';

describe('single target selection', () => {
    it('selects target via prompts.select', async () => {
        const selectMock = vi.fn().mockResolvedValue('antigravity');
        const selected = await selectSingleTarget(
            [
                { name: 'Antigravity', value: 'antigravity' },
                { name: 'Cursor', value: 'cursor' },
            ],
            {
                automatic: false,
                message: 'Select target',
                prompts: { select: selectMock },
            },
        );
        expect(selected).toBe('antigravity');
        expect(selectMock).toHaveBeenCalled();
    });

    it('selects first target when multiple explicit values are passed', async () => {
        const selected = await selectSingleTarget(
            [
                { name: 'Antigravity', value: 'antigravity' },
                { name: 'Cursor', value: 'cursor' },
            ],
            {
                automatic: false,
                explicit: 'antigravity,cursor',
                message: 'Select target',
            },
        );
        expect(selected).toBe('antigravity');
    });

    it('accepts a single valid explicit target', async () => {
        const selected = await selectSingleTarget(
            [
                { name: 'Antigravity', value: 'antigravity' },
                { name: 'Cursor', value: 'cursor' },
            ],
            {
                automatic: false,
                explicit: 'cursor',
                message: 'Select target',
            },
        );
        expect(selected).toBe('cursor');
    });
});
