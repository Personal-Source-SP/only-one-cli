import type { InitCategory, InitPlan, InitResult, PlannedItem } from './plan-types.js';

export const CATEGORY_ORDER: InitCategory[] = ['package', 'config', 'mcp', 'skill', 'workflow', 'plugin', 'rule', 'gitignore'];

/**
 * Deduplicates planned items by key.
 * If an item is present as both 'auto-required' and 'selected', it is promoted to 'selected'.
 */
export function deduplicatePlannedItems(items: PlannedItem[]): PlannedItem[] {
    const map = new Map<string, PlannedItem>();

    for (const item of items) {
        const existing = map.get(item.key);
        if (!existing) {
            map.set(item.key, { ...item });
        } else {
            // Promote to selected if any instance was explicitly selected
            const origin = existing.origin === 'selected' || item.origin === 'selected' ? 'selected' : 'auto-required';
            const reason = origin === 'selected' ? undefined : existing.reason || item.reason;
            map.set(item.key, {
                ...existing,
                origin,
                reason,
                meta: { ...existing.meta, ...item.meta },
            });
        }
    }

    // Sort deterministically by CATEGORY_ORDER then key
    return Array.from(map.values()).sort((a, b) => {
        const catA = CATEGORY_ORDER.indexOf(a.category);
        const catB = CATEGORY_ORDER.indexOf(b.category);
        if (catA !== catB) return catA - catB;
        return a.key.localeCompare(b.key);
    });
}

/**
 * Formats pre-execution plan summary string for prompt display
 */
export function renderPreExecutionSummary(plan: InitPlan): string {
    const lines: string[] = [];
    lines.push('==================================================');
    lines.push('              INITIALIZATION PLAN                 ');
    lines.push('==================================================');

    const selectedItems = plan.items.filter((i) => i.origin === 'selected');
    const autoRequired = plan.items.filter((i) => i.origin === 'auto-required');
    const existingItems = plan.items.filter((i) => i.state === 'existing');
    const actionOnlyItems = plan.items.filter((i) => i.state === 'action-only');

    if (selectedItems.length > 0) {
        lines.push('\nSelected Items:');
        for (const item of selectedItems) {
            const targetStr = item.target ? ` (${item.target})` : '';
            const stateStr = item.state === 'existing' ? ' [EXISTING - Will Overwrite/Reinstall]' : '';
            lines.push(`  - [${item.category.toUpperCase()}] ${item.name}${targetStr}${stateStr}`);
        }
    }

    if (autoRequired.length > 0) {
        lines.push('\nAuto-Required Dependencies:');
        for (const item of autoRequired) {
            const targetStr = item.target ? ` (${item.target})` : '';
            const reasonStr = item.reason ? ` (Required by: ${item.reason})` : '';
            const stateStr = item.state === 'existing' ? ' [EXISTING - Will Overwrite/Reinstall]' : '';
            lines.push(`  - [${item.category.toUpperCase()}] ${item.name}${targetStr}${reasonStr}${stateStr}`);
        }
    }

    if (actionOnlyItems.length > 0) {
        lines.push('\nPlanned Actions:');
        for (const item of actionOnlyItems) {
            lines.push(`  - [${item.category.toUpperCase()}] ${item.name}: ${item.reason || 'Action required'}`);
        }
    }

    lines.push('\n==================================================');
    return lines.join('\n');
}

/**
 * Formats final execution report string
 */
export function renderFinalReport(result: InitResult): string {
    const lines: string[] = [];
    lines.push('==================================================');
    lines.push('           INITIALIZATION EXECUTION REPORT        ');
    lines.push('==================================================');

    for (const cat of CATEGORY_ORDER) {
        const catResults = result.results.filter((r) => r.item.category === cat);
        if (catResults.length === 0) continue;

        lines.push(`\n${cat.toUpperCase()}S:`);
        for (const res of catResults) {
            const targetStr = res.item.target ? ` in ${res.item.target}` : '';
            const errStr = res.error ? ` (${res.error})` : '';
            lines.push(`  - ${res.item.name}${targetStr}: ${res.status}${errStr}`);
        }
    }

    lines.push('\nSummary:');
    lines.push(`  Installed: ${result.summary.installedCount}`);
    lines.push(`  Overwritten: ${result.summary.overwrittenCount}`);
    lines.push(`  Action Required: ${result.summary.actionRequiredCount}`);
    lines.push(`  Skipped: ${result.summary.skippedCount}`);
    lines.push(`  Failed: ${result.summary.failedCount}`);
    lines.push('==================================================');

    return lines.join('\n');
}
