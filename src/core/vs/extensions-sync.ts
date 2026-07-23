import { loadVsLibraryManifest, normalizeExtensionIds } from './library.js';
import { PercentProgressReporter } from './progress.js';
import { nodeVsFileSystem, NodeVsProcessRunner } from './runtime.js';
import { resolveVsJournalPath, VsSyncTransaction } from './transaction.js';
import { findVsEditor } from './editors.js';
import type { VsEditorDescriptor, VsEditorId, VsFileSystem, VsProcessRunner } from './types.js';

export interface ExistingVsExtensionCheck {
    editorId: VsEditorId;
    editorName: string;
    extensionId: string;
    exists: boolean;
}

export interface VsExtensionsSyncRequest {
    cwd: string;
    editorIds: VsEditorId[];
    write: (line: string) => void;
    force?: boolean;
    fs?: VsFileSystem;
    libraryDir?: string;
    runner?: VsProcessRunner;
    extensionIds?: string[];
    extensionIdsPerEditor?: Record<VsEditorId, string[]>;
}

export interface VsExtensionsSyncResponse {
    installed: number;
    results: Array<{
        editorName: string;
        installedExtensions: string[];
    }>;
}

export const resolveVsEditorCommand = async (runner: VsProcessRunner, editor: VsEditorDescriptor): Promise<string> => {
    for (const candidate of editor.commandCandidates) {
        const check = await runner.run(candidate, ['--version']);
        if (check.code === 0) {
            return candidate;
        }
    }
    return editor.commandCandidates[0];
};

export const getVsInstalledExtensions = async (runner: VsProcessRunner, command: string): Promise<string[]> => {
    const result = await runner.run(command, ['--list-extensions']);
    if (result.code !== 0) throw new Error(result.stderr || `Failed to list extensions with ${command}`);
    return normalizeExtensionIds(result.stdout.split(/\r?\n/));
};

export const checkExistingVsExtensions = async (options: {
    editorIds: VsEditorId[];
    extensionIds: string[];
    runner?: VsProcessRunner;
}): Promise<ExistingVsExtensionCheck[]> => {
    const runner = options.runner ?? new NodeVsProcessRunner();
    const checks: ExistingVsExtensionCheck[] = [];

    for (const editorId of options.editorIds) {
        const editor = findVsEditor(editorId);
        if (!editor) continue;
        const command = await resolveVsEditorCommand(runner, editor);
        let installedList: string[] = [];
        try {
            installedList = await getVsInstalledExtensions(runner, command);
        } catch {
            installedList = [];
        }
        const installedSet = new Set(installedList.map((id) => id.toLowerCase()));

        for (const extensionId of options.extensionIds) {
            checks.push({
                editorId,
                editorName: editor.name,
                extensionId,
                exists: installedSet.has(extensionId.toLowerCase()),
            });
        }
    }

    return checks;
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
        const command = await resolveVsEditorCommand(runner, editor);
        const targetExtensions = request.extensionIdsPerEditor?.[editor.id] ?? request.extensionIds ?? manifest.extensions;

        const isExplicitSelection = Boolean(request.extensionIdsPerEditor || request.extensionIds);

        if (request.force || isExplicitSelection) {
            plans.push({
                command,
                editorName: editor.name,
                extensionIds: targetExtensions,
            });
        } else {
            const installed = new Set((await getVsInstalledExtensions(runner, command)).map((id) => id.toLowerCase()));
            plans.push({
                command,
                editorName: editor.name,
                extensionIds: targetExtensions.filter((id) => !installed.has(id.toLowerCase())),
            });
        }
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
