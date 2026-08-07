/**
 * Truncate long text with ellipsis for terminal display
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Format menu item label with icon
 */
export function formatMenuLabel(label: string, icon?: string): string {
    return icon ? `${icon} ${label}` : label;
}
