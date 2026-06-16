import { Command } from 'commander';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ProgramDeps } from '@/cli/deps.js';
import { HybridApiClient } from '@/core/client/index.js';
import { loadConfig, resolveGlobals } from '@/core/config/index.js';

/** Resolve the project root from an optional path relative to the shell cwd. */
export const resolveProjectDir = (deps: ProgramDeps, path?: string): string => resolve(deps.cwd, path ?? '.');

export const assertProjectDirectory = (projectDir: string): void => {
    if (!existsSync(projectDir) || !statSync(projectDir).isDirectory()) {
        throw new Error(`Project directory not found: ${projectDir}`);
    }
};

/** Load merged config from `configCwd` (project root), not necessarily the shell cwd. */
export const globalsFor = async (command: Command, deps: ProgramDeps, configCwd = deps.cwd) => {
    const config = await loadConfig(configCwd);
    return resolveGlobals(command.optsWithGlobals(), config, deps.env);
};

export const clientFor = (globals: Awaited<ReturnType<typeof globalsFor>>, deps: ProgramDeps) =>
    new HybridApiClient(globals.server, globals.key, deps.fetcher);

export const inferName = (repoUrl: string) => {
    const last = repoUrl.split('/').filter(Boolean).at(-1) ?? 'remote-repo';
    return last.replace(/\.git$/i, '') || 'remote-repo';
};

export const inferArchiveName = (path: string) => {
    const last = path.split(/[\\/]/).filter(Boolean).at(-1) ?? 'uploaded-repo';
    return last.replace(/\.zip$/i, '') || 'uploaded-repo';
};

export const isHybridNotFoundError = (error: unknown): boolean => error instanceof Error && error.message.includes('HYBRID_NOT_FOUND');
