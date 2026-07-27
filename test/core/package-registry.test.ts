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

    it('OpenSpec and UI/UX Pro Max maintain npm installer strategy', () => {
        const openspec = PACKAGES.find((p) => p.id === '@fission-ai/openspec' || p.id === 'openspec');
        expect(openspec).toBeDefined();
        expect(openspec?.installer.kind).toBe('npm');
        if (openspec?.installer.kind === 'npm') {
            expect(openspec.installer.packageName).toBe('@fission-ai/openspec');
        }

        const uiux = PACKAGES.find((p) => p.id === 'ui-ux-pro-max-cli');
        expect(uiux).toBeDefined();
        expect(uiux?.installer.kind).toBe('npm');
        if (uiux?.installer.kind === 'npm') {
            expect(uiux.installer.packageName).toBe('ui-ux-pro-max-cli');
        }
    });

    it('registers official Next.js skills as pinned external installables', () => {
        const nextSkills = PACKAGES.filter((pkg) => pkg.id.startsWith('next-'));
        expect(nextSkills).toHaveLength(4);
        for (const pkg of nextSkills) {
            expect(pkg.installer.kind).toBe('skills');
            if (pkg.installer.kind === 'skills') {
                expect(pkg.installer.source).toBe('https://github.com/vercel/next.js/tree/canary/skills');
                expect(pkg.installer.skillName).toBe(pkg.id);
                expect(pkg.installer.cliVersion).toBe('1.4.0');
            }
        }
    });
});
