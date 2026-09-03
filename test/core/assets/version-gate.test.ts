import { describe, expect, it } from 'vitest';
import { mapChangedFileToAsset, verifyAllAssetsHaveValidVersions } from '@/core/assets/gate.js';

describe('Assets Version Gate & Integrity Verification', () => {
    it('verifies that 100% of all registered asset manifests have a valid decimal version', () => {
        const result = verifyAllAssetsHaveValidVersions();
        if (!result.valid) {
            console.error('Asset Version Violations:\n', result.errors.join('\n'));
        }
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('maps modified asset template files to corresponding asset types and IDs', () => {
        expect(mapChangedFileToAsset('assets/workflows/only-one-idea.md')).toEqual({
            type: 'workflows',
            id: 'only-one-idea',
        });

        expect(mapChangedFileToAsset('assets/skills/c4-diagrams/SKILL.md')).toEqual({
            type: 'skills',
            id: 'c4-diagrams',
        });

        expect(mapChangedFileToAsset('assets/rules/01-context-and-tools.md')).toEqual({
            type: 'rules',
            id: 'context-and-tools',
        });

        expect(mapChangedFileToAsset('unrelated/file.ts')).toBeNull();
    });
});
