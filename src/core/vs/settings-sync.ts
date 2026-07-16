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
    force?: boolean;
    fs?: VsFileSystem;
    libraryDir?: string;
    runner?: VsProcessRunner;
}

export interface VsSettingsSyncResponse {
    changed: number;
    results: Array<{
        editorName: string;
        newKeys: Record<string, unknown>;
        changedKeys: Record<string, { old: unknown; new: unknown }>;
    }>;
}

const flattenSettings = (obj: Record<string, unknown>, prefix = ''): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            Object.assign(result, flattenSettings(value as Record<string, unknown>, fullKey));
        } else {
            result[fullKey] = value;
        }
    }
    return result;
};

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

    const results: VsSettingsSyncResponse['results'] = [];

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

            const nextSettings = request.force ? manifest.settings : mergeSettings(target, manifest.settings);

            // Compute diff
            const oldFlat = flattenSettings(target);
            const newFlat = flattenSettings(nextSettings);
            const newKeys: Record<string, unknown> = {};
            const changedKeys: Record<string, { old: unknown; new: unknown }> = {};

            for (const [key, newValue] of Object.entries(newFlat)) {
                if (!(key in oldFlat)) {
                    newKeys[key] = newValue;
                } else {
                    const oldValue = oldFlat[key];
                    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                        changedKeys[key] = { old: oldValue, new: newValue };
                    }
                }
            }

            results.push({
                editorName: editor.name,
                newKeys,
                changedKeys,
            });

            await transaction.atomicWrite(targetPath, stringifySettings(nextSettings));
            progress.step(`${editor.name} settings synced`);
        }
        process.off('SIGINT', handleSignal);
        process.off('SIGTERM', handleSignal);
        await transaction.commit();
        progress.step('settings committed');
        return { changed: editors.length, results };
    } catch (error) {
        process.off('SIGINT', handleSignal);
        process.off('SIGTERM', handleSignal);
        await transaction.rollback();
        throw error;
    }
};
