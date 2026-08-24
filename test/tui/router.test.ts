import { describe, expect, it } from 'vitest';
import { ALL_ROUTE_ITEMS, ROUTE_CATEGORIES } from '@/tui/router/routes.js';

describe('TUI Router & Route Catalog', () => {
    it('defines 4 core categories in catalogue', () => {
        expect(ROUTE_CATEGORIES.length).toBe(4);
        expect(ROUTE_CATEGORIES.map((c) => c.id)).toEqual(['setup', 'sync', 'system', 'diagnostics']);
    });

    it('contains all key actions in route items list', () => {
        const itemIds = ALL_ROUTE_ITEMS.map((item) => item.id);
        expect(itemIds).toContain('init');
        expect(itemIds).toContain('combo');
        expect(itemIds).toContain('skill');
        expect(itemIds).toContain('workflow');
        expect(itemIds).toContain('rule');
        expect(itemIds).toContain('mcp');
        expect(itemIds).toContain('setting-vs');
        expect(itemIds).toContain('extensions-vs');
        expect(itemIds).toContain('git');
        expect(itemIds).toContain('structure-generate');
        expect(itemIds).toContain('doctor');
        expect(itemIds).toContain('update');
    });

    it('ensures each route item has descriptions, tags, and quick summaries', () => {
        for (const item of ALL_ROUTE_ITEMS) {
            expect(item.description).toBeTruthy();
            expect(item.tags.length).toBeGreaterThan(0);
            expect(item.quickSummary.length).toBeGreaterThan(0);
        }
    });
});
