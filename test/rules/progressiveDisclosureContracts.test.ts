import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';

import { RULES } from '../../assets/agents/rules/index.js';

describe('Progressive Disclosure Rules Contracts', () => {
    it('should declare exactly 5 rules in RULES manifest with bumped versions', () => {
        expect(RULES).toHaveLength(5);
        expect(RULES.find((r) => r.id === 'next-architecture-stack')?.version).toBe('0.0.2');
        expect(RULES.find((r) => r.id === 'nest-architecture-stack')?.version).toBe('0.0.2');
        expect(RULES.find((r) => r.id === 'context-and-tools')?.version).toBe('0.0.2');
        expect(RULES.find((r) => r.id === 'execution-terminal')?.version).toBe('0.0.2');
        expect(RULES.find((r) => r.id === 'karpathy-ste100-discipline')?.version).toBe('0.0.3');
    });

    it('should configure Tier 1 core safety rules with alwaysApply true and trigger always_on', () => {
        const coreIds = ['context-and-tools', 'execution-terminal'];

        for (const id of coreIds) {
            const rule = RULES.find((r) => r.id === id);
            expect(rule).toBeDefined();
            expect(rule?.alwaysApply).toBe(true);
            expect(rule?.trigger).toBe('always_on');
        }
    });

    it('should configure Tier 2 stack and domain rules with alwaysApply false, trigger model_decision, and globs', () => {
        const tier2Ids = ['next-architecture-stack', 'nest-architecture-stack', 'karpathy-ste100-discipline'];

        for (const id of tier2Ids) {
            const rule = RULES.find((r) => r.id === id);
            expect(rule).toBeDefined();
            expect(rule?.alwaysApply).toBe(false);
            expect(rule?.trigger).toBe('model_decision');
            expect(rule?.globs).toBeDefined();
            expect(typeof rule?.globs).toBe('string');
        }
    });

    it('should verify physical markdown frontmatter matches manifest metadata on disk', () => {
        const rulesDir = resolve(process.cwd(), 'assets/agents/rules');

        for (const rule of RULES) {
            const filePath = resolve(rulesDir, rule.sourceFile);
            const content = readFileSync(filePath, 'utf8');
            const match = content.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/);
            expect(match).not.toBeNull();
            const fm: any = yaml.load(match![1]);
            expect(fm.alwaysApply).toBe(rule.alwaysApply);

            if (rule.trigger) {
                expect(fm.trigger).toBe(rule.trigger);
            }

            if (rule.globs) {
                expect(fm.globs).toBe(rule.globs);
            }

            if (rule.description) {
                expect(fm.description).toBe(rule.description);
            }
        }
    });
});
