import { dirname, join } from 'node:path';
import { PercentProgressReporter } from '@/core/vs/progress.js';
import { nodeVsFileSystem, NodeVsProcessRunner } from '@/core/vs/runtime.js';
import { VsSyncTransaction } from '@/core/vs/transaction.js';
import type { VsFileSystem, VsPlatform, VsProcessRunner } from '@/core/vs/types.js';
import { findMcpIdeAdapter } from './adapters.js';
import { mergeMcpServers } from './merge.js';
import type { McpManifest, McpMergeResult } from './types.js';

export type SyncMcpGlobalConfigRequest = {
    cwd: string;
    homeDir: string;
    ideIds: string[];
    manifests: McpManifest[];
    platform: VsPlatform | NodeJS.Platform;
    write: (line: string) => void;
    fs?: VsFileSystem;
    runner?: VsProcessRunner;
    overwriteList?: string[];
};

export type SyncMcpGlobalConfigResult = {
    configPath: string;
    ideId: string;
    ideName: string;
    results: McpMergeResult[];
};

export type SyncMcpGlobalConfigResponse = {
    changed: number;
    results: SyncMcpGlobalConfigResult[];
};

export const resolveMcpJournalPath = (cwd: string): string => join(cwd, '.only-one', 'mcp-sync-journal.json');

export const syncMcpGlobalConfig = async (request: SyncMcpGlobalConfigRequest): Promise<SyncMcpGlobalConfigResponse> => {
    const fs = request.fs ?? nodeVsFileSystem;
    const runner = request.runner ?? new NodeVsProcessRunner();
    const progress = new PercentProgressReporter(request.write);
    const transaction = new VsSyncTransaction(fs, runner, progress, resolveMcpJournalPath(request.cwd));
    await transaction.recoverIfNeeded();

    const adapters = request.ideIds.map((id) => findMcpIdeAdapter(id));
    if (adapters.some((adapter) => !adapter)) {
        throw new Error('Unsupported MCP IDE selected');
    }

    progress.start(request.ideIds.length + 2, 'validate MCP sync');
    await transaction.begin();

    const handleSignal = async (): Promise<void> => {
        await transaction.rollback();
        process.exit(130);
    };
    process.once('SIGINT', handleSignal);
    process.once('SIGTERM', handleSignal);

    const results: SyncMcpGlobalConfigResult[] = [];

    try {
        for (const adapter of adapters) {
            if (!adapter) continue;
            const configPath = adapter.getConfigPath(request.homeDir, request.platform as NodeJS.Platform);
            await fs.mkdir(dirname(configPath));

            let config: Record<string, unknown> = {};
            try {
                config = adapter.codec.parse(await fs.readFile(configPath), configPath);
            } catch (error) {
                if (!(error instanceof Error) || !error.message.includes('ENOENT')) throw error;
            }

            const merge = mergeMcpServers(adapter.getMcpServers(config), request.manifests, adapter.id, request.overwriteList);
            const nextConfig = adapter.setMcpServers(config, merge.servers);
            results.push({ configPath, ideId: adapter.id, ideName: adapter.name, results: merge.results });

            if (merge.changed) {
                await transaction.backupFile(configPath);
                await transaction.atomicWrite(configPath, adapter.codec.stringify(nextConfig));
            }

            progress.step(`${adapter.name} MCP config synced`);
        }

        process.off('SIGINT', handleSignal);
        process.off('SIGTERM', handleSignal);
        await transaction.commit();
        progress.step('MCP config committed');
        return { changed: results.filter((result) => result.results.some((entry) => entry.status === 'added')).length, results };
    } catch (error) {
        process.off('SIGINT', handleSignal);
        process.off('SIGTERM', handleSignal);
        await transaction.rollback();
        throw error;
    }
};
