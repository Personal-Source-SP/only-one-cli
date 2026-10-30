import { isOversized } from '@src/core/indexing/git-archive.js';
import { describe, expect, it } from 'vitest';

describe('git-archive', () => {
    it('detects oversized archives', () => {
        expect(isOversized(50 * 1024 * 1024)).toBe(false);
        expect(isOversized(100 * 1024 * 1024)).toBe(false); // exactly 100MB is not over
        expect(isOversized(100 * 1024 * 1024 + 1)).toBe(true);
    });
});
