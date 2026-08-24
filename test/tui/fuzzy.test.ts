import { describe, expect, it } from 'vitest';
import { filterRouteCategories, filterRouteItems } from '@/tui/utils/fuzzy.js';
import { ROUTE_CATEGORIES } from '@/tui/router/routes.js';

describe('TUI Fuzzy Search Utility', () => {
    it('returns all categories and items when query is empty', () => {
        const filtered = filterRouteCategories(ROUTE_CATEGORIES, '');
        expect(filtered.length).toBe(ROUTE_CATEGORIES.length);
    });

    it('filters items by keyword matching id or label', () => {
        const filtered = filterRouteCategories(ROUTE_CATEGORIES, 'doctor');
        expect(filtered.length).toBe(1);
        expect(filtered[0]?.items.some((item) => item.id === 'doctor')).toBe(true);
    });

    it('filters items by tags or description keywords', () => {
        const filtered = filterRouteCategories(ROUTE_CATEGORIES, 'nestjs');
        expect(filtered.length).toBeGreaterThan(0);
        const comboItem = filtered[0]?.items.find((item) => item.id === 'combo');
        expect(comboItem).toBeDefined();
    });

    it('returns empty list when no matches exist', () => {
        const filtered = filterRouteCategories(ROUTE_CATEGORIES, 'non-existent-xyz-action');
        expect(filtered.length).toBe(0);
    });
});
