import { describe, expect, it } from 'vitest';
import { PACKAGES } from '@assets/packages/index.js';
import type { PackageManifest } from '@assets/types.js';

describe('Package Registry Model (Task 1.1, 1.4 & 1.5)', () => {
    it('all package manifest entries have a stable id and supported installer strategy', () => {
        expect(PACKAGES.length).toBeGreaterThan(0);
        for (const pkg of PACKAGES) {
            expect(pkg.id).toBeDefined();
            expect(typeof pkg.id).toBe('string');
            expect(pkg.installer).toBeDefined();
            expect(['npm', 'skills']).toContain(pkg.installer.kind);
        }
    });

    it('Superpowers is excluded from the package registry', () => {
        const superpowers = PACKAGES.find((p) => p.id === 'superpowers');
        expect(superpowers).toBeUndefined();
    });

    it('OpenSpec is excluded and UI/UX Pro Max maintains npm installer strategy', () => {
        const openspec = PACKAGES.find((p) => p.id === '@fission-ai/openspec' || p.id === 'openspec');
        expect(openspec).toBeUndefined();

        const uiux = PACKAGES.find((p) => p.id === 'ui-ux-pro-max-cli');
        expect(uiux).toBeDefined();
        expect(uiux?.installer.kind).toBe('npm');
        if (uiux?.installer.kind === 'npm') {
            expect(uiux.installer.packageName).toBe('ui-ux-pro-max-cli');
        }
    });

    it('does not register deprecated skill packages', () => {
        const nextSkills = PACKAGES.filter((pkg) => pkg.id.startsWith('next-'));
        expect(nextSkills).toHaveLength(0);
    });
});
