/** Type guard checking if a value is a non-null non-array object record. */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
    Boolean(value) && typeof value === 'object' && !Array.isArray(value);
