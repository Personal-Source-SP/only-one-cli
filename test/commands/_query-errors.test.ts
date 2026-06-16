import { describe, expect, it } from 'vitest';
import {
    assertCrossProjectTags,
    assertQueryProjectId,
    assertStructuralScope,
    formatQueryApiError,
    formatQueryValidationError,
    parseApiErrorMessage,
    validateCallGraphDirection,
    validatePositiveInteger,
    validateSearchScope,
} from '@src/core/query/errors.js';

describe('query errors', () => {
    it('formats validation errors with command, cause, and fixes', () => {
        const message = formatQueryValidationError('search', {
            summary: 'Project id is required',
            cause: 'No project id was resolved',
            fixes: ['Pass --project <id>', 'Run only-one list'],
        });

        expect(message).toContain('[search] Project id is required');
        expect(message).toContain('Cause: No project id was resolved');
        expect(message).toContain('Pass --project <id>');
    });

    it('detects missing project id', () => {
        expect(assertQueryProjectId(undefined, 'impact')).toMatchObject({
            summary: 'Project id is required',
        });
        expect(assertQueryProjectId('proj-1', 'impact')).toBeNull();
    });

    it('requires tags for cross-project search', () => {
        expect(assertCrossProjectTags(undefined)).toMatchObject({
            summary: 'Cross-project search requires tags',
        });
        expect(assertCrossProjectTags(['group:platform'])).toBeNull();
    });

    it('rejects structural search in cross-project mode', () => {
        expect(assertStructuralScope(true, true)).toMatchObject({
            summary: 'Structural search requires a single project',
        });
        expect(assertStructuralScope(false, true)).toBeNull();
    });

    it('validates search scope values', () => {
        expect(validateSearchScope('per-project')).toEqual({ scope: 'per-project' });
        expect(validateSearchScope('cross-project')).toEqual({ scope: 'cross-project' });
        expect(validateSearchScope('invalid')).toMatchObject({ summary: 'Invalid --scope value' });
    });

    it('validates call graph direction values', () => {
        expect(validateCallGraphDirection('callers')).toEqual({ direction: 'callers' });
        expect(validateCallGraphDirection('invalid')).toMatchObject({ summary: 'Invalid --direction value' });
    });

    it('validates positive integers', () => {
        expect(validatePositiveInteger('5', '--top-k', 10)).toEqual({ value: 5 });
        expect(validatePositiveInteger('0', '--top-k', 10)).toMatchObject({ summary: 'Invalid --top-k value' });
        expect(validatePositiveInteger('abc', '--depth', 3)).toMatchObject({ summary: 'Invalid --depth value' });
    });

    it('parses API error envelopes', () => {
        expect(parseApiErrorMessage(new Error('HYBRID_NOT_FOUND: Project missing'))).toEqual({
            code: 'HYBRID_NOT_FOUND',
            message: 'Project missing',
        });
    });

    it('maps API errors to remediation hints', () => {
        const message = formatQueryApiError('search', { server: 'http://api', json: false }, new Error('HYBRID_UNAUTHORIZED: Invalid key'));

        expect(message).toContain('[search] Query request failed');
        expect(message).toContain('HYBRID_UNAUTHORIZED: Invalid key');
        expect(message).toContain('credentials.ts');
    });

    it('maps missing documents.json errors to remediation hints', () => {
        const message = formatQueryApiError(
            'search',
            { server: 'http://api', json: false },
            new Error(
                "HYBRID_INTERNAL_ERROR: Command failed: python3 ... FileNotFoundError: [Errno 2] No such file or directory: '.../.cocoindex/documents.json'",
            ),
        );

        expect(message).toContain('GitNexus-only');
        expect(message).toContain('index:create');
        expect(message).toContain('push-index');
    });
});
