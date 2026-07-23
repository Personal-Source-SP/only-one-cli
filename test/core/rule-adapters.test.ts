import { describe, expect, it } from 'vitest';
import { AllowedToolId } from '@/constants/allowed-tools.js';
import { getAllowedRuleTargets, ALLOWED_TARGETS } from '@/core/target-selection/catalog.js';

describe('Native Rule Adapters and Codex Exclusion (Task 2.4 & 2.5)', () => {
    it('returns only Antigravity, Claude, and Cursor for getAllowedRuleTargets', () => {
        const ruleTargets = getAllowedRuleTargets();
        const ids = ruleTargets.map((t) => t.id);

        expect(ids).toContain(AllowedToolId.Antigravity);
        expect(ids).toContain(AllowedToolId.Claude);
        expect(ids).toContain(AllowedToolId.Cursor);
        expect(ids).not.toContain(AllowedToolId.Codex);
        expect(ids.length).toBe(3);
    });

    it('Antigravity, Claude, and Cursor agents specify correct native rules directories', () => {
        const ruleTargets = getAllowedRuleTargets();

        const ag = ruleTargets.find((t) => t.id === AllowedToolId.Antigravity);
        expect(ag?.agent?.rulesDir).toBe('.agents/rules');

        const claude = ruleTargets.find((t) => t.id === AllowedToolId.Claude);
        expect(claude?.agent?.rulesDir).toBe('.claude/rules');

        const cursor = ruleTargets.find((t) => t.id === AllowedToolId.Cursor);
        expect(cursor?.agent?.rulesDir).toBe('.cursor/rules');
    });

    it('Codex target capability list does not contain Rules capability', () => {
        const codex = ALLOWED_TARGETS.find((t) => t.id === AllowedToolId.Codex);
        expect(codex).toBeDefined();
        expect(codex?.capabilities).not.toContain('rules');
    });
});
