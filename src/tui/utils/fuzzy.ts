import type { CategoryGroup } from '../router/routes.js';
import type { RouteItem } from '../router/types.js';

export function filterRouteItems(items: RouteItem[], query: string): RouteItem[] {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return items;

    return items.filter((item) => {
        const idMatch = item.id.toLowerCase().includes(cleanQuery);
        const labelMatch = item.label.toLowerCase().includes(cleanQuery);
        const descMatch = item.description.toLowerCase().includes(cleanQuery);
        const tagMatch = item.tags.some((t) => t.toLowerCase().includes(cleanQuery));

        return idMatch || labelMatch || descMatch || tagMatch;
    });
}

export function filterRouteCategories(categories: CategoryGroup[], query: string): CategoryGroup[] {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return categories;

    return categories
        .map((category) => {
            const filteredItems = filterRouteItems(category.items, cleanQuery);
            return {
                ...category,
                items: filteredItems,
            };
        })
        .filter((category) => category.items.length > 0);
}
