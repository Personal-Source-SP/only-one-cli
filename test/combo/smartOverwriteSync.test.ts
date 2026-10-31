import { describe, expect, it, vi } from 'vitest';

import { COMBOS } from '../../assets/agents/combos/index.js';
import { confirmComboOverwriteStep } from '../../src/commands/combo/actions/step-4-confirm-overwrite.js';
import type { ExtendedComboManifest } from '../../src/core/combo/index.js';
import * as comboCore from '../../src/core/combo/index.js';

describe('Combo Smart Overwrite & Force Sync Engine', () => {
    it('should bypass interactive checkbox prompt and return all existing IDs when force flag is true', async () => {
        vi.spyOn(comboCore, 'checkExistingComboComponents').mockResolvedValueOnce([
            {
                id: 'rule:context-and-tools:antigravity',
                exists: true,
                label: 'Rule: context-and-tools (antigravity)',
                type: 'rule',
                status: 'installed',
                meta: {},
                isOutdated: true,
                versionDiff: '0.0.1 -> 0.0.2',
            },
            {
                id: 'rule:execution-terminal:antigravity',
                exists: true,
                label: 'Rule: execution-terminal (antigravity)',
                type: 'rule',
                status: 'installed',
                meta: {},
                isOutdated: false,
            },
        ]);

        const mockDeps: any = {
            prompts: {
                checkbox: vi.fn(),
            },
        };

        const mockCombo: ExtendedComboManifest = {
            id: 'test-combo',
            name: 'Test Combo',
            version: '0.0.1',
            scope: 'global',
            supportedAgents: ['antigravity'],
            rules: ['context-and-tools'],
        };

        const result = await confirmComboOverwriteStep(
            mockDeps,
            process.cwd(),
            mockCombo,
            [{ name: 'Antigravity', value: 'antigravity', rulesDir: '.agents/rules' }],
            true,
            true, // force = true
        );

        expect(mockDeps.prompts.checkbox).not.toHaveBeenCalled();
        expect(result).toEqual(['rule:context-and-tools:antigravity', 'rule:execution-terminal:antigravity']);
    });

    it('should pre-select checked true for outdated components with version label when prompt is interactive', async () => {
        let capturedChoices: any[] = [];
        vi.spyOn(comboCore, 'checkExistingComboComponents').mockResolvedValueOnce([
            {
                id: 'rule:context-and-tools:antigravity',
                exists: true,
                label: 'Rule: context-and-tools (antigravity)',
                type: 'rule',
                status: 'installed',
                meta: {},
                isOutdated: true,
                versionDiff: '0.0.1 -> 0.0.2',
            },
            {
                id: 'rule:execution-terminal:antigravity',
                exists: true,
                label: 'Rule: execution-terminal (antigravity)',
                type: 'rule',
                status: 'installed',
                meta: {},
                isOutdated: false,
            },
        ]);

        const mockDeps: any = {
            prompts: {
                checkbox: vi.fn().mockImplementation(async ({ choices }) => {
                    capturedChoices = choices;

                    return [];
                }),
            },
        };

        const mockCombo: ExtendedComboManifest = {
            id: 'test-combo',
            name: 'Test Combo',
            version: '0.0.1',
            scope: 'global',
            supportedAgents: ['antigravity'],
            rules: ['context-and-tools'],
        };

        await confirmComboOverwriteStep(
            mockDeps,
            process.cwd(),
            mockCombo,
            [{ name: 'Antigravity', value: 'antigravity', rulesDir: '.agents/rules' }],
            true,
            false, // force = false
        );

        expect(mockDeps.prompts.checkbox).toHaveBeenCalledTimes(1);
        expect(capturedChoices).toHaveLength(2);
        expect(capturedChoices[0]).toEqual({
            name: 'Rule: context-and-tools (antigravity) [UPDATE: 0.0.1 -> 0.0.2]',
            value: 'rule:context-and-tools:antigravity',
            checked: true,
        });
        expect(capturedChoices[1]).toEqual({
            name: 'Rule: execution-terminal (antigravity)',
            value: 'rule:execution-terminal:antigravity',
            checked: false,
        });
    });

    it('should declare core rules in only-one-flow combo manifest and bump version to 0.0.19', () => {
        const combo = COMBOS.find((c) => c.id === 'only-one-flow');

        expect(combo).toBeDefined();
        expect(combo?.version).toBe('0.0.19');
        expect(combo?.rules).toBeDefined();
        expect(combo?.rules).toContain('context-and-tools');
        expect(combo?.rules).toContain('execution-terminal');
        expect(combo?.rules).toContain('karpathy-ste100-discipline');
    });
});
