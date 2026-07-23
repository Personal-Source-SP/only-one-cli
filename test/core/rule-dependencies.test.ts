import { describe, expect, it } from 'vitest';
import { AllowedToolId } from '@/constants/allowed-tools.js';
import { validateRuleDependenciesPreflight, buildDeduplicatedDependencyPlan } from '@/core/rule/dependencies.js';
import { RULES } from '@assets/rules/index.js';

describe('Rule Dependency Resolution & Preflight Validation (Tasks 3.1, 3.2, 3.7)', () => {
    it('preflight validation fails for unknown dependency ID', () => {
        const customRules = [
            {
                id: 'bad-rule',
                description: 'test',
                sourceFile: 'context-minimization.md',
                supportedTargets: [AllowedToolId.Antigravity],
                requiredPackages: ['non-existent-package'],
            },
        ];

        const result = validateRuleDependenciesPreflight(['bad-rule'], [AllowedToolId.Antigravity], customRules);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0]).toContain("unknown package dependency 'non-existent-package'");
    });

    it('preflight validation fails if Codex target is explicitly selected for rules', () => {
        const result = validateRuleDependenciesPreflight(['context-minimization'], [AllowedToolId.Codex]);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("Target 'codex' does not support rule installation");
    });

    it('buildDeduplicatedDependencyPlan returns deterministic order: packages, plugins, MCPs, skills', () => {
        const plan = buildDeduplicatedDependencyPlan(['context-minimization']);
        expect(plan.packages).toEqual(['@fission-ai/openspec']);
        expect(plan.plugins).toEqual(['superpowers']);
        expect(plan.mcps).toEqual(['gitnexus']);
        expect(plan.skills).toEqual([]);
    });

    it('resolves all registered Next.js skills for react-nextjs', () => {
        const result = validateRuleDependenciesPreflight(['react-nextjs'], [AllowedToolId.Antigravity]);
        const plan = buildDeduplicatedDependencyPlan(['react-nextjs']);

        expect(result).toEqual({ valid: true, errors: [] });
        expect(plan.skills).toEqual([
            'next-dev-loop',
            'next-cache-components-adoption',
            'next-cache-components-optimizer',
            'next-partial-prefetching-adoption',
        ]);
    });

    it('deduplicates shared dependencies across multiple selected rules', () => {
        const customRules = [
            {
                id: 'rule-1',
                description: 'r1',
                sourceFile: 'context-minimization.md',
                supportedTargets: [AllowedToolId.Antigravity],
                requiredPackages: ['@fission-ai/openspec'],
                requiredPlugins: ['superpowers'],
            },
            {
                id: 'rule-2',
                description: 'r2',
                sourceFile: 'context-minimization.md',
                supportedTargets: [AllowedToolId.Antigravity],
                requiredPackages: ['@fission-ai/openspec'],
                requiredPlugins: ['superpowers'],
            },
        ];

        const plan = buildDeduplicatedDependencyPlan(['rule-1', 'rule-2'], customRules);
        expect(plan.packages).toEqual(['@fission-ai/openspec']);
        expect(plan.plugins).toEqual(['superpowers']);
    });
});
