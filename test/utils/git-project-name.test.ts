import { describe, expect, it } from 'vitest';
import { parseGitRemoteUrl } from '@src/utils/git-project-name.js';

describe('parseGitRemoteUrl', () => {
    it('parses github ssh remotes as organization/repository', () => {
        expect(parseGitRemoteUrl('git@github.com:acme/orien-trade-backend.git')).toBe('acme/orien-trade-backend');
    });

    it('parses github https remotes as organization/repository', () => {
        expect(parseGitRemoteUrl('https://github.com/acme/orien-trade-backend.git')).toBe('acme/orien-trade-backend');
    });

    it('returns null for invalid remotes', () => {
        expect(parseGitRemoteUrl('')).toBeNull();
        expect(parseGitRemoteUrl('not-a-remote')).toBeNull();
    });
});
