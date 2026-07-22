import { describe, expect, it } from 'vitest';
import { selectTargets } from '@src/core/target-selection/index.js';

const choices = [
    { name: 'Antigravity', value: 'antigravity' },
    { name: 'Claude', value: 'claude' },
    { name: 'Cursor', value: 'cursor' },
] as const;

describe('selectTargets', () => {
    it('normalizes explicit CSV and removes duplicates', async () => {
        await expect(selectTargets({ automatic: false, choices, explicit: ' Cursor,claude,cursor ', message: 'Select' })).resolves.toEqual([
            'cursor',
            'claude',
        ]);
    });

    it('rejects unsupported explicit IDs with valid IDs', async () => {
        await expect(selectTargets({ automatic: false, choices, explicit: 'vscode', message: 'Select' })).rejects.toThrow(
            "Unsupported target 'vscode'. Valid targets: antigravity, claude, cursor",
        );
    });

    it('selects every valid target for all and automatic modes', async () => {
        await expect(selectTargets({ automatic: false, choices, explicit: 'all', message: 'Select' })).resolves.toEqual([
            'antigravity',
            'claude',
            'cursor',
        ]);
        await expect(selectTargets({ automatic: true, choices, message: 'Select' })).resolves.toEqual(['antigravity', 'claude', 'cursor']);
    });

    it('passes preselection to interactive checkbox selection', async () => {
        const calls: Array<{ checked?: boolean; value: string }> = [];
        const selected = await selectTargets({
            automatic: false,
            choices,
            message: 'Select',
            preselected: ['claude'],
            prompts: {
                checkbox: async ({ choices: checkboxChoices }) => {
                    calls.push(...checkboxChoices);
                    return ['claude'];
                },
            },
        });

        expect(selected).toEqual(['claude']);
        expect(calls).toEqual([
            { checked: false, name: 'Antigravity', value: 'antigravity' },
            { checked: true, name: 'Claude', value: 'claude' },
            { checked: false, name: 'Cursor', value: 'cursor' },
        ]);
    });

    it('rejects empty interactive selection', async () => {
        await expect(
            selectTargets({
                automatic: false,
                choices,
                emptyMessage: 'Choose at least one tool',
                message: 'Select',
                prompts: { checkbox: async () => [] },
            }),
        ).rejects.toThrow('Choose at least one tool');
    });
});
