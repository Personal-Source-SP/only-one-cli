/** Parse a comma-separated string into a cleaned array of trimmed string tokens. */
export const parseCsv = (val?: string): string[] =>
    val
        ?.split(',')
        .map((s) => s.trim())
        .filter(Boolean) ?? [];
