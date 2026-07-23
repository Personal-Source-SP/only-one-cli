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

    it('context-minimization rule manifest declares required dependencies correctly', () => {
        const rule = RULES.find((r) => r.id === 'context-minimization');
        expect(rule).toBeDefined();
        expect(rule?.requiredPackages).toEqual(['@fission-ai/openspec']);
        expect(rule?.requiredPlugins).toEqual(['superpowers']);
        expect(rule?.requiredMcps).toEqual(['gitnexus']);
        expect(rule?.supportedTargets).toEqual([AllowedToolId.Antigravity, AllowedToolId.Claude, AllowedToolId.Cursor]);
    });
});
