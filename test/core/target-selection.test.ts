import { describe, expect, it } from 'vitest';
import {
    createTargetAssetPlan,
    filterCompatibleAssets,
    formatMissingArgumentError,
    selectTargets,
} from '@src/core/target-selection/index.js';

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

    it('fails in non-interactive mode when prompts are unavailable and automatic is false', async () => {
        await expect(
            selectTargets({
                automatic: false,
                choices,
                message: 'Select target',
            }),
        ).rejects.toThrow();
    });
});

describe('createTargetAssetPlan & plan utilities', () => {
    const assets = [
        { id: 'p1', name: 'Plugin 1', supportedTargets: ['antigravity', 'claude'] },
        { id: 'p2', name: 'Plugin 2', supportedTargets: ['claude', 'cursor'] },
        { id: 'p3', name: 'Plugin 3' }, // supports all
    ] as const;

    it('filters compatible assets correctly', () => {
        const antigravityAssets = filterCompatibleAssets(assets, 'antigravity');
        expect(antigravityAssets.map((a) => a.id)).toEqual(['p1', 'p3']);
    });

    it('creates target asset plan preserving target and asset order', () => {
        const plan = createTargetAssetPlan(['antigravity', 'claude'], assets, {
            antigravity: ['p1', 'p3'],
            claude: ['p2', 'p1'],
        });

        expect(plan).toEqual([
            {
                targetId: 'antigravity',
                assetIds: ['p1', 'p3'],
                assets: [assets[0], assets[2]],
            },
            {
                targetId: 'claude',
                assetIds: ['p2', 'p1'],
                assets: [assets[1], assets[0]],
            },
        ]);
    });

    it('throws error when selecting an incompatible asset for a target', () => {
        expect(() =>
            createTargetAssetPlan(['antigravity'], assets, {
                antigravity: ['p2'],
            }),
        ).toThrow("Asset 'p2' is not compatible with target 'antigravity'.");
    });

    it('formats missing argument error cleanly', () => {
        const err = formatMissingArgumentError('target', {
            requiredArg: 'PLUGIN_ID',
            optionFlag: '--tool or --ide',
            validValues: ['antigravity', 'claude'],
        });
        expect(err).toBe(
            "Missing required positional argument 'PLUGIN_ID'. Specify using --tool or --ide. Valid values: antigravity, claude.",
        );
    });
});
