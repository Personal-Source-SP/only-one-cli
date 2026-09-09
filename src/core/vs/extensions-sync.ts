import { loadVsLibraryManifest, normalizeExtensionIds } from './library.js';
import { PercentProgressReporter } from './progress.js';
import { nodeVsFileSystem, NodeVsProcessRunner } from './runtime.js';
import { resolveVsJournalPath, VsSyncTransaction } from './transaction.js';
import { findVsEditor } from './editors.js';
import type { VsEditorDescriptor, VsEditorId, VsFileSystem, VsProcessResult, VsProcessRunner } from './types.js';

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
    prune?: boolean;
    fs?: VsFileSystem;
    libraryDir?: string;
    runner?: VsProcessRunner;
    extensionIds?: string[];
    extensionIdsPerEditor?: Record<VsEditorId, string[]>;
    pruneExtensionIdsPerEditor?: Record<VsEditorId, string[]>;
}

export interface VsExtensionsSyncResponse {
    installed: number;
    pruned: number;
    results: Array<{
        editorName: string;
        installedExtensions: string[];
        prunedExtensions: string[];
    }>;
}

export const resolveVsEditorCommand = async (runner: VsProcessRunner, editor: VsEditorDescriptor): Promise<string> => {
    for (const candidate of editor.commandCandidates) {
        const check = await runner.run(candidate, ['--version']);
        if (check.code === 0) {
            return candidate;
        }
    }
    throw new Error(
        `Executable for "${editor.name}" not found in PATH (${editor.commandCandidates.join(', ')}). Please verify that ${editor.name} is installed and available in PATH.`,
    );
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

const extractProcessErrorMessage = (result: VsProcessResult, fallback: string): string => {
    const raw = `${result.stderr}\n${result.stdout}`
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.includes('extensionManagementService depends on antigravityAnalytics'))
        .join('\n');
    return raw || fallback;
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

    const plans: Array<{ command: string; editorName: string; extensionIds: string[]; pruneExtensionIds: string[] }> = [];
    for (const editor of editors) {
        if (!editor) continue;
        const command = await resolveVsEditorCommand(runner, editor);
        const targetExtensions = request.extensionIdsPerEditor?.[editor.id] ?? request.extensionIds ?? manifest.extensions;
        const targetSet = new Set(targetExtensions.map((id) => id.toLowerCase()));
        const installedList = await getVsInstalledExtensions(runner, command).catch(() => []);
        const installed = new Set(installedList.map((id) => id.toLowerCase()));

        const isExplicitSelection = Boolean(request.extensionIdsPerEditor || request.extensionIds);
        const pruneExtensionIds = request.prune
            ? (request.pruneExtensionIdsPerEditor?.[editor.id] ?? installedList.filter((id) => !targetSet.has(id.toLowerCase())))
            : [];

        if (request.force || isExplicitSelection) {
            plans.push({
                command,
                editorName: editor.name,
                extensionIds: targetExtensions,
                pruneExtensionIds,
            });
        } else {
            plans.push({
                command,
                editorName: editor.name,
                extensionIds: targetExtensions.filter((id) => !installed.has(id.toLowerCase())),
                pruneExtensionIds,
            });
        }
    }

    const total = plans.reduce((sum, plan) => sum + plan.extensionIds.length + plan.pruneExtensionIds.length, 0) + 2;
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
    let prunedCount = 0;
    const results: VsExtensionsSyncResponse['results'] = [];

    try {
        for (const plan of plans) {
            const installedExtensions: string[] = [];
            const prunedExtensions: string[] = [];
            for (const extensionId of plan.extensionIds) {
                const result = await runner.run(plan.command, ['--install-extension', extensionId]);
                if (result.code !== 0) {
                    throw new Error(extractProcessErrorMessage(result, `Failed to install ${extensionId}`));
                }
                await transaction.recordInstalledExtension(plan.command, extensionId);
                installedCount += 1;
                installedExtensions.push(extensionId);
                progress.step(`${plan.editorName}: ${extensionId}`);
            }
            for (const extensionId of plan.pruneExtensionIds) {
                const result = await runner.run(plan.command, ['--uninstall-extension', extensionId]);
                if (result.code !== 0) {
                    throw new Error(extractProcessErrorMessage(result, `Failed to uninstall ${extensionId}`));
                }
                prunedCount += 1;
                prunedExtensions.push(extensionId);
                progress.step(`${plan.editorName} (pruned): ${extensionId}`);
            }
            results.push({
                editorName: plan.editorName,
                installedExtensions,
                prunedExtensions,
            });
        }
        process.off('SIGINT', handleSignal);
        process.off('SIGTERM', handleSignal);
        await transaction.commit();
        progress.step('extensions committed');
        return { installed: installedCount, pruned: prunedCount, results };
    } catch (error) {
        process.off('SIGINT', handleSignal);
        process.off('SIGTERM', handleSignal);
        try {
            await transaction.rollback();
        } catch {
            // Preserve original install error as the primary thrown exception
        }
        throw error;
    }
};
