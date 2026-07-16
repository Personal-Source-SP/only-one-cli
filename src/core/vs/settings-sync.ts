import { dirname } from 'node:path';
import { mergeSettings, parseJsoncObject, stringifySettings } from './json.js';
import { loadVsLibraryManifest } from './library.js';
import { PercentProgressReporter } from './progress.js';
import { nodeVsFileSystem, NodeVsProcessRunner } from './runtime.js';
import { resolveVsJournalPath, VsSyncTransaction } from './transaction.js';
import { findVsEditor } from './editors.js';
import { VsPlatform, type VsEditorId, type VsFileSystem, type VsProcessRunner } from './types.js';

export interface VsSettingsSyncRequest {
    cwd: string;
    editorIds: VsEditorId[];
    homeDir: string;
    platform: VsPlatform;
    write: (line: string) => void;
    fs?: VsFileSystem;
    libraryDir?: string;
    runner?: VsProcessRunner;
}

export interface VsSettingsSyncResponse {
    changed: number;
}

export const syncVsSettings = async (request: VsSettingsSyncRequest): Promise<VsSettingsSyncResponse> => {
    const fs = request.fs ?? nodeVsFileSystem;
    const runner = request.runner ?? new NodeVsProcessRunner();
    const progress = new PercentProgressReporter(request.write);
    const transaction = new VsSyncTransaction(fs, runner, progress, resolveVsJournalPath(request.cwd));
    await transaction.recoverIfNeeded();
    const manifest = await loadVsLibraryManifest(fs, request.libraryDir);
    const editors = request.editorIds.map((id) => findVsEditor(id));
    if (editors.some((editor) => !editor)) throw new Error('Unsupported editor selected');

    progress.start(request.editorIds.length + 2, 'validate settings sync');
    await transaction.begin();
    const handleSignal = async (): Promise<void> => {
        await transaction.rollback();
        process.exit(130);
    };
    process.once('SIGINT', handleSignal);
    process.once('SIGTERM', handleSignal);
    progress.step('backup ready');

    try {
        for (const editor of editors) {
            if (!editor) continue;
            const targetPath = editor.resolveSettingsPath(request.homeDir, request.platform);
            await fs.mkdir(dirname(targetPath));
            let target: Record<string, unknown> = {};
            try {
                target = parseJsoncObject(await fs.readFile(targetPath));
            } catch {
                target = {};
            }
            await transaction.backupFile(targetPath);
            await transaction.atomicWrite(targetPath, stringifySettings(mergeSettings(target, manifest.settings)));
            progress.step(`${editor.name} settings`);
        }
        process.off('SIGINT', handleSignal);
        process.off('SIGTERM', handleSignal);
        await transaction.commit();
        progress.step('settings committed');
        return { changed: editors.length };
    } catch (error) {
        process.off('SIGINT', handleSignal);
        process.off('SIGTERM', handleSignal);
        await transaction.rollback();
        throw error;
    }
};
