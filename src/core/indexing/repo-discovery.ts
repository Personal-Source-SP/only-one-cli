import { readdirSync } from 'node:fs';
import { join, relative, basename, dirname } from 'node:path';
import type { BulkConfig } from '@/core/config/index.js';

export interface DiscoveredRepo {
    /** Absolute path to repo root (parent of .git) */
    path: string;
    /** Resolved project name (relative path from scan root) */
    name: string;
    /** Auto-generated tags including group:<parent> */
    tags: string[];
    /** Whether manifest says to skip */
    skip: boolean;
    /** Name override from manifest */
    nameOverride?: string;
}

export interface DiscoverOptions {
    scanRoot: string;
    maxDepth: number;
    exclude: string[];
    bulkConfig?: BulkConfig;
}

export function discoverRepos(options: DiscoverOptions): DiscoveredRepo[] {
    const repos: DiscoveredRepo[] = [];

    // Check if scanRoot itself is a git repo
    let isRootGit = false;
    try {
        const entries = readdirSync(options.scanRoot, { withFileTypes: true });
        isRootGit = entries.some((e) => e.isDirectory() && e.name === '.git');
    } catch {
        // ignore
    }

    if (isRootGit) {
        repos.push(buildRepoEntry(options.scanRoot, options));
        return repos;
    }

    walk(options.scanRoot, 1, options.maxDepth, repos, options);
    return repos;
}

function walk(dir: string, depth: number, maxDepth: number, repos: DiscoveredRepo[], options: DiscoverOptions) {
    if (depth > maxDepth) return;

    let entries;
    try {
        entries = readdirSync(dir, { withFileTypes: true });
    } catch {
        return; // ignore unreadable directories
    }

    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (entry.name === '.git') {
            repos.push(buildRepoEntry(dir, options));
            return; // Don't descend into this repo's subdirs
        }
    }

    // No .git here, descend into subdirs
    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (entry.name === 'node_modules' || entry.name === '.git') continue;
        walk(join(dir, entry.name), depth + 1, maxDepth, repos, options);
    }
}

function buildRepoEntry(repoPath: string, options: DiscoverOptions): DiscoveredRepo {
    // Normalize Windows paths if any
    const normalizedScanRoot = options.scanRoot.replace(/\\/g, '/');
    const normalizedRepoPath = repoPath.replace(/\\/g, '/');
    const relPath = relative(normalizedScanRoot, normalizedRepoPath).replace(/\\/g, '/');
    const name = relPath || basename(repoPath);

    const parentSegment = relPath.includes('/') ? (relPath.split('/').at(-2) ?? '') : basename(dirname(repoPath));

    // Check manifest overrides
    const repoConfig = options.bulkConfig?.repos?.[name];

    return {
        path: repoPath,
        name: repoConfig?.name ?? name,
        tags: buildTags(parentSegment, options.bulkConfig?.tags, repoConfig?.tags),
        skip: repoConfig?.skip ?? false,
        nameOverride: repoConfig?.name,
    };
}

function buildTags(parentSegment: string, globalTags?: string[], repoTags?: string[]): string[] {
    const tagsSet = new Set<string>();
    if (parentSegment) {
        tagsSet.add(`group:${parentSegment}`);
    }
    globalTags?.forEach((t) => tagsSet.add(t));
    repoTags?.forEach((t) => tagsSet.add(t));
    return Array.from(tagsSet);
}

export function matchesExclude(relPath: string, patterns: string[]): boolean {
    const normalizedPath = relPath.replace(/\\/g, '/');
    return patterns.some((pattern) => {
        const normalizedPattern = pattern.replace(/\\/g, '/');
        const regexStr = '^' + normalizedPattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$';
        const regex = new RegExp(regexStr);
        return regex.test(normalizedPath) || regex.test(basename(normalizedPath));
    });
}
