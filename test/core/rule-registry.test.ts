import { describe, expect, it } from 'vitest';
import { RULES } from '@assets/rules/index.js';
import type { RuleManifest } from '@assets/types.js';
import { AllowedToolId } from '@/constants/allowed-tools.js';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { resolvePackageRoot } from '@/core/runtime/package-root.js';

const packageRoot = resolvePackageRoot(import.meta.url);

describe('Rule Registry Model (Task 2.1 & 2.2)', () => {
    it('all rule manifest entries have stable IDs, source file existence, and supported targets', () => {
        expect(RULES.length).toBeGreaterThan(0);
        const ids = new Set<string>();

        for (const rule of RULES) {
            expect(rule.id).toBeDefined();
            expect(typeof rule.id).toBe('string');
            expect(ids.has(rule.id)).toBe(false);
            ids.add(rule.id);

            expect(rule.description).toBeDefined();
            expect(rule.sourceFile).toBeDefined();

            const fullSourcePath = join(packageRoot, 'assets/rules', rule.sourceFile);
            expect(existsSync(fullSourcePath)).toBe(true);

            expect(rule.supportedTargets.length).toBeGreaterThan(0);
            expect(rule.supportedTargets).not.toContain(AllowedToolId.Codex);

            for (const targetId of rule.supportedTargets) {
                expect(Object.values(AllowedToolId)).toContain(targetId);
            }
        }
    });

    it('rule manifests declare expected dependencies and supported targets', () => {
        const supportedTargets = [AllowedToolId.Antigravity, AllowedToolId.Claude, AllowedToolId.Cursor];
        const expectedDependencies = [
            { id: 'bug-fix', packages: undefined, plugins: ['superpowers'], mcps: ['gitnexus'], skills: undefined },
            {
                id: 'context-minimization',
                packages: ['@fission-ai/openspec'],
                plugins: ['superpowers'],
                mcps: ['gitnexus'],
                skills: undefined,
            },
            {
                id: 'architecture-stack',
                packages: undefined,
                plugins: undefined,
                mcps: undefined,
                skills: [
                    'next-dev-loop',
                    'next-cache-components-adoption',
                    'next-cache-components-optimizer',
                    'next-partial-prefetching-adoption',
                ],
            },
            { id: 'ui', packages: undefined, plugins: undefined, mcps: undefined, skills: undefined },
        ];

        for (const expected of expectedDependencies) {
            const rule = RULES.find((item) => item.id === expected.id);
            expect(rule).toBeDefined();
            expect(rule?.requiredPackages).toEqual(expected.packages);
            expect(rule?.requiredPlugins).toEqual(expected.plugins);
            expect(rule?.requiredMcps).toEqual(expected.mcps);
            expect(rule?.requiredSkills).toEqual(expected.skills);
            expect(rule?.supportedTargets).toEqual(supportedTargets);
        }
    });
});
