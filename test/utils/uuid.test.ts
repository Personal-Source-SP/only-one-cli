import { describe, expect, it } from 'vitest';
import { isUuidV4 } from '@src/utils/uuid.js';

describe('isUuidV4', () => {
    it('accepts lowercase uuid v4 values', () => {
        expect(isUuidV4('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('rejects repo slugs', () => {
        expect(isUuidV4('payments-api')).toBe(false);
    });

    it('rejects empty values', () => {
        expect(isUuidV4(undefined)).toBe(false);
        expect(isUuidV4('')).toBe(false);
    });
});
