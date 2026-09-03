import { describe, expect, it } from 'vitest';
import { bumpDecimalVersion, compareDecimalVersions, isValidDecimalVersion, DEFAULT_ASSET_VERSION } from '@/core/assets/version.js';

describe('Decimal Rollover Versioning Engine', () => {
    describe('isValidDecimalVersion', () => {
        it('accepts valid base-10 version strings', () => {
            expect(isValidDecimalVersion('0.0.1')).toBe(true);
            expect(isValidDecimalVersion('0.0.9')).toBe(true);
            expect(isValidDecimalVersion('0.1.0')).toBe(true);
            expect(isValidDecimalVersion('1.0.0')).toBe(true);
            expect(isValidDecimalVersion(' 0.0.1 ')).toBe(true);
        });

        it('rejects invalid or empty version strings', () => {
            expect(isValidDecimalVersion('')).toBe(false);
            expect(isValidDecimalVersion('1.0')).toBe(false);
            expect(isValidDecimalVersion('v1.0.0')).toBe(false);
            expect(isValidDecimalVersion('1.0.0.0')).toBe(false);
            expect(isValidDecimalVersion('alpha')).toBe(false);
        });
    });

    describe('bumpDecimalVersion', () => {
        it('increments patch within 0-9 range', () => {
            expect(bumpDecimalVersion('0.0.1')).toBe('0.0.2');
            expect(bumpDecimalVersion('0.0.8')).toBe('0.0.9');
        });

        it('rolls over patch 9 to 0 and increments minor', () => {
            expect(bumpDecimalVersion('0.0.9')).toBe('0.1.0');
            expect(bumpDecimalVersion('0.1.9')).toBe('0.2.0');
            expect(bumpDecimalVersion('0.8.9')).toBe('0.9.0');
        });

        it('rolls over minor 9 to 0 and increments major when patch is 9', () => {
            expect(bumpDecimalVersion('0.9.9')).toBe('1.0.0');
            expect(bumpDecimalVersion('1.9.9')).toBe('2.0.0');
            expect(bumpDecimalVersion('9.9.9')).toBe('10.0.0');
        });

        it('throws an error for invalid input strings', () => {
            expect(() => bumpDecimalVersion('invalid')).toThrowError(/Invalid decimal version/);
            expect(() => bumpDecimalVersion('1.0')).toThrowError(/Invalid decimal version/);
        });
    });

    describe('compareDecimalVersions', () => {
        it('correctly compares version precedence', () => {
            expect(compareDecimalVersions('0.0.1', '0.0.2')).toBe(-1);
            expect(compareDecimalVersions('0.0.2', '0.0.1')).toBe(1);
            expect(compareDecimalVersions('0.0.1', '0.0.1')).toBe(0);

            expect(compareDecimalVersions('0.0.9', '0.1.0')).toBe(-1);
            expect(compareDecimalVersions('0.1.0', '0.0.9')).toBe(1);

            expect(compareDecimalVersions('0.9.9', '1.0.0')).toBe(-1);
            expect(compareDecimalVersions('1.0.0', '0.9.9')).toBe(1);
        });

        it('throws an error when comparing malformed versions', () => {
            expect(() => compareDecimalVersions('bad', '0.0.1')).toThrowError(/Cannot compare/);
        });
    });

    it('has default asset version constant equal to 0.0.1', () => {
        expect(DEFAULT_ASSET_VERSION).toBe('0.0.1');
    });
});
