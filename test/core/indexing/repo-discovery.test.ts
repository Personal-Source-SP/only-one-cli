import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { discoverRepos, matchesExclude } from '@src/core/indexing/repo-discovery.js';

describe('discoverRepos', () => {
    let scanRoot: string;

    beforeEach(async () => {
        scanRoot = await mkdtemp(join(tmpdir(), 'bulk-test-'));
    });

    afterEach(async () => {
        await rm(scanRoot, { recursive: true, force: true });
    });

    it('discovers repos at depth 1', async () => {
        await mkdir(join(scanRoot, 'repo-a', '.git'), { recursive: true });
        await mkdir(join(scanRoot, 'repo-b', '.git'), { recursive: true });

        const repos = discoverRepos({ scanRoot, maxDepth: 3, exclude: [] });
        expect(repos).toHaveLength(2);
        expect(repos.map((r) => r.name).sort()).toEqual(['repo-a', 'repo-b']);
    });

    it('resolves nested path-prefix names', async () => {
        await mkdir(join(scanRoot, 'org-a', 'api', '.git'), { recursive: true });
        await mkdir(join(scanRoot, 'org-b', 'api', '.git'), { recursive: true });

        const repos = discoverRepos({ scanRoot, maxDepth: 3, exclude: [] });
        expect(repos.map((r) => r.name).sort()).toEqual(['org-a/api', 'org-b/api']);
    });

    it('respects maxDepth', async () => {
        await mkdir(join(scanRoot, 'a', 'b', 'c', 'd', '.git'), {
            recursive: true,
        });

        const shallow = discoverRepos({ scanRoot, maxDepth: 2, exclude: [] });
        expect(shallow).toHaveLength(0);

        const deep = discoverRepos({ scanRoot, maxDepth: 5, exclude: [] });
        expect(deep).toHaveLength(1);
    });

    it('does not descend into discovered repos', async () => {
        await mkdir(join(scanRoot, 'mono', '.git'), { recursive: true });
        await mkdir(join(scanRoot, 'mono', 'packages', 'sub', '.git'), {
            recursive: true,
        });

        const repos = discoverRepos({ scanRoot, maxDepth: 5, exclude: [] });
        // Should find 'mono' but NOT 'mono/packages/sub'
        expect(repos).toHaveLength(1);
        expect(repos[0].name).toBe('mono');
    });

    it('auto-tags with group:<parent>', async () => {
        await mkdir(join(scanRoot, 'team-x', 'service', '.git'), {
            recursive: true,
        });

        const repos = discoverRepos({ scanRoot, maxDepth: 3, exclude: [] });
        expect(repos[0].tags).toContain('group:team-x');
    });

    it('applies manifest skip flag', async () => {
        await mkdir(join(scanRoot, 'skip-me', '.git'), { recursive: true });

        const repos = discoverRepos({
            scanRoot,
            maxDepth: 3,
            exclude: [],
            bulkConfig: { repos: { 'skip-me': { skip: true } } },
        });
        expect(repos[0].skip).toBe(true);
    });

    it('applies manifest name override', async () => {
        await mkdir(join(scanRoot, 'old-name', '.git'), { recursive: true });

        const repos = discoverRepos({
            scanRoot,
            maxDepth: 3,
            exclude: [],
            bulkConfig: { repos: { 'old-name': { name: 'new-name' } } },
        });
        expect(repos[0].name).toBe('new-name');
    });

    it('handles matchesExclude correctly', () => {
        expect(matchesExclude('repo-name', ['repo-*'])).toBe(true);
        expect(matchesExclude('some/path/repo-name', ['*/repo-*'])).toBe(true);
        expect(matchesExclude('other-repo', ['repo-*'])).toBe(false);
    });
});
