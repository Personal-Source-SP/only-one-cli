import { describe, expect, it } from 'vitest';
import { RULES } from '@assets/rules/index.js';
import { SKILLS } from '@assets/skills/index.js';
import { AllowedToolId } from '@/constants/allowed-tools.js';
import { buildDeduplicatedDependencyPlan, validateRuleDependenciesPreflight } from '@/core/rule/dependencies.js';

describe('architecture rule dependencies', () => {
    it('references registered skills for supported targets', () => {
        const result = validateRuleDependenciesPreflight(
            ['next-architecture-stack', 'nest-architecture-stack'],
            [AllowedToolId.Antigravity],
        );
        expect(result).toEqual({ valid: true, errors: [] });
    });

    it('keeps Next dependencies scoped and expands all Nest framework skills', () => {
        expect(buildDeduplicatedDependencyPlan(['next-architecture-stack']).skills).toEqual(['only-one-nextjs-development']);

        const nestRule = RULES.find(({ id }) => id === 'nest-architecture-stack');
        const plan = buildDeduplicatedDependencyPlan(['nest-architecture-stack']);
        expect(plan.skills).toEqual(nestRule?.requiredSkills);
        expect(new Set(plan.skills).size).toBe(plan.skills.length);
        expect(plan.skills.every((name) => SKILLS.some((skill) => skill.name === name))).toBe(true);
    });

    it('removes the generic architecture rule ID', () => {
        expect(RULES.some(({ id }) => id === 'architecture-stack')).toBe(false);
    });
});
