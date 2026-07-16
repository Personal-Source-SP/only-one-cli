import { loadVsLibraryManifest, normalizeExtensionIds } from './library.js';
import { PercentProgressReporter } from './progress.js';
import { nodeVsFileSystem, NodeVsProcessRunner } from './runtime.js';
import { resolveVsJournalPath, VsSyncTransaction } from './transaction.js';
import { findVsEditor } from './editors.js';
import type { VsEditorId, VsFileSystem, VsProcessRunner } from './types.js';

export interface VsExtensionsSyncRequest {
    cwd: string;
    editorIds: VsEditorId[];
    write: (line: string) => void;
    force?: boolean;
    fs?: VsFileSystem;
    libraryDir?: string;
    runner?: VsProcessRunner;
}

export interface VsExtensionsSyncResponse {
    installed: number;
    results: Array<{
        editorName: string;
        installedExtensions: string[];
    }>;
}

const listInstalledExtensions = async (runner: VsProcessRunner, command: string): Promise<string[]> => {
    const result = await runner.run(command, ['--list-extensions']);
    if (result.code !== 0) throw new Error(result.stderr || `Failed to list extensions with ${command}`);
    return normalizeExtensionIds(result.stdout.split(/\r?\n/));
};

export const syncVsExtensions = async (request: VsExtensionsSyncRequest): Promise<VsExtensionsSyncResponse> => {
    const fs = request.fs ?? nodeVsFileSystem;
    const runner = request.runner ?? new NodeVsProcessRunner();
    const progress = new PercentProgressReporter(request.write);
    const transaction = new VsSyncTransaction(fs, runner, progress, resolveVsJournalPath(request.cwd));
    await transaction.recoverIfNeeded();
    const manifest = await loadVsLibraryManifest(fs, request.libraryDir);
    const editors = request.editorIds.map((id) => findVsEditor(id));
    if (editors.some((editor) => !editor)) throw new Error('Unsupported editor selected');

    const plans: Array<{ command: string; editorName: string; extensionIds: string[] }> = [];
    for (const editor of editors) {
        if (!editor) continue;
        const command = editor.commandCandidates[0];
        const installed = new Set((await listInstalledExtensions(runner, command)).map((id) => id.toLowerCase()));
        plans.push({
            command,
            editorName: editor.name,
            extensionIds: request.force ? manifest.extensions : manifest.extensions.filter((id) => !installed.has(id.toLowerCase())),
        });
    }

    const total = plans.reduce((sum, plan) => sum + plan.extensionIds.length, 0) + 2;
    progress.start(total, 'validate extensions sync');
    await transaction.begin();
    const handleSignal = async (): Promise<void> => {
        await transaction.rollback();
        process.exit(130);
    };
    process.once('SIGINT', handleSignal);
    process.once('SIGTERM', handleSignal);
    progress.step('backup ready');
    let installedCount = 0;
    const results: VsExtensionsSyncResponse['results'] = [];

    try {
        for (const plan of plans) {
            const installedExtensions: string[] = [];
            for (const extensionId of plan.extensionIds) {
                const result = await runner.run(plan.command, ['--install-extension', extensionId]);
                if (result.code !== 0) throw new Error(result.stderr || `Failed to install ${extensionId}`);
                await transaction.recordInstalledExtension(plan.command, extensionId);
                installedCount += 1;
                installedExtensions.push(extensionId);
                progress.step(`${plan.editorName}: ${extensionId}`);
            }
            results.push({
                editorName: plan.editorName,
                installedExtensions,
            });
        }
        process.off('SIGINT', handleSignal);
        process.off('SIGTERM', handleSignal);
        await transaction.commit();
        progress.step('extensions committed');
        return { installed: installedCount, results };
    } catch (error) {
        process.off('SIGINT', handleSignal);
        process.off('SIGTERM', handleSignal);
        await transaction.rollback();
        throw error;
    }
};
