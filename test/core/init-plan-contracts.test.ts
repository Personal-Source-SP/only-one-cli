import { describe, expect, it } from 'vitest';
import type { PlannedItem } from '@/core/init/plan-types.js';
import { deduplicatePlannedItems, renderFinalReport, renderPreExecutionSummary } from '@/core/init/plan-utils.js';

describe('Init Plan & Result Contracts (Tasks 1.1 - 1.5)', () => {
    it('deduplicates planned items and promotes auto-required to selected', () => {
        const items: PlannedItem[] = [
            {
                key: 'mcp:cursor:github',
                category: 'mcp',
                name: 'github',
                target: 'cursor',
                origin: 'auto-required',
                state: 'new',
                reason: 'pr-git workflow',
            },
            {
                key: 'mcp:cursor:github',
                category: 'mcp',
                name: 'github',
                target: 'cursor',
                origin: 'selected',
                state: 'new',
            },
        ];

        const deduplicated = deduplicatePlannedItems(items);
        expect(deduplicated.length).toBe(1);
        expect(deduplicated[0].origin).toBe('selected');
        expect(deduplicated[0].reason).toBeUndefined();
    });

    it('renders pre-execution plan summary cleanly', () => {
        const summary = renderPreExecutionSummary({
            projectDir: '/tmp/test',
            selectedTools: ['cursor'],
            items: [
                {
                    key: 'skill:cursor:grill-me',
                    category: 'skill',
                    name: 'grill-me',
                    target: 'cursor',
                    origin: 'selected',
                    state: 'existing',
                },
            ],
        });

        expect(summary).toContain('INITIALIZATION PLAN');
        expect(summary).toContain('[SKILL] grill-me (cursor) [EXISTING - Will Overwrite/Reinstall]');
    });

    it('renders final execution report cleanly', () => {
        const report = renderFinalReport({
            plan: { projectDir: '/tmp/test', selectedTools: ['cursor'], items: [] },
            results: [
                {
                    item: {
                        key: 'skill:cursor:grill-me',
                        category: 'skill',
                        name: 'grill-me',
                        target: 'cursor',
                        origin: 'selected',
                        state: 'new',
                    },
                    status: 'installed',
                },
            ],
            summary: {
                installedCount: 1,
                overwrittenCount: 0,
                actionRequiredCount: 0,
                skippedCount: 0,
                failedCount: 0,
            },
        });

        expect(report).toContain('SKILLS:');
        expect(report).toContain('- grill-me in cursor: installed');
        expect(report).toContain('Installed: 1');
    });
});
