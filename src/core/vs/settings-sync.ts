import { dirname } from 'node:path';
import { mergeSettings, parseJsoncObject, stringifySettings } from './json.js';
import { loadVsLibraryManifest } from './library.js';
import { PercentProgressReporter } from './progress.js';
import { nodeVsFileSystem, NodeVsProcessRunner } from './runtime.js';
import { resolveVsJournalPath, VsSyncTransaction } from './transaction.js';
import { findVsEditor } from './editors.js';
import { VsPlatform, type VsEditorId, type VsFileSystem, type VsProcessRunner } from './types.js';

export interface ExistingVsSettingCheck {
    editorId: VsEditorId;
    editorName: string;
    key: string;
    exists: boolean;
    currentValue?: unknown;
    newValue?: unknown;
}

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
    settingKeys?: string[];
    settingKeysPerEditor?: Record<VsEditorId, string[]>;
}

export interface VsSettingsSyncResponse {
    changed: number;
    results: Array<{
        editorName: string;
        newKeys: Record<string, unknown>;
        changedKeys: Record<string, { old: unknown; new: unknown }>;
    }>;
}

export const flattenSettings = (obj: Record<string, unknown>, prefix = ''): Record<string, unknown> => {
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

export const filterSettingsByKeyList = (settingsObj: Record<string, unknown>, allowedKeys: string[]): Record<string, unknown> => {
    const flat = flattenSettings(settingsObj);
    const allowedSet = new Set(allowedKeys);
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(flat)) {
        if (!allowedSet.has(key)) continue;

        const parts = key.split('.');
        let current = result;
        for (let i = 0; i < parts.length - 1; i += 1) {
            const part = parts[i];
            if (!current[part] || typeof current[part] !== 'object') {
                current[part] = {};
            }
            current = current[part] as Record<string, unknown>;
        }
        current[parts[parts.length - 1]] = value;
    }

    return result;
};

export const checkExistingVsSettings = async (options: {
    editorIds: VsEditorId[];
    homeDir: string;
    platform: VsPlatform;
    fs?: VsFileSystem;
    libraryDir?: string;
}): Promise<ExistingVsSettingCheck[]> => {
    const fs = options.fs ?? nodeVsFileSystem;
    const manifest = await loadVsLibraryManifest(fs, options.libraryDir);
    const manifestFlat = flattenSettings(manifest.settings);
    const manifestKeys = Object.keys(manifestFlat);
    const checks: ExistingVsSettingCheck[] = [];

    for (const editorId of options.editorIds) {
        const editor = findVsEditor(editorId);
        if (!editor) continue;

        const targetPath = editor.resolveSettingsPath(options.homeDir, options.platform);
        let target: Record<string, unknown> = {};
        try {
            target = parseJsoncObject(await fs.readFile(targetPath));
        } catch {
            target = {};
        }

        const targetFlat = flattenSettings(target);

        for (const key of manifestKeys) {
            const exists = key in targetFlat;
            checks.push({
                currentValue: targetFlat[key],
                editorId,
                editorName: editor.name,
                exists,
                key,
                newValue: manifestFlat[key],
            });
        }
    }

    return checks;
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

            const allowedKeys = request.settingKeysPerEditor?.[editor.id] ?? request.settingKeys;
            const settingsToMerge = allowedKeys ? filterSettingsByKeyList(manifest.settings, allowedKeys) : manifest.settings;

            const nextSettings = request.force ? settingsToMerge : mergeSettings(target, settingsToMerge);

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
                changedKeys,
                editorName: editor.name,
                newKeys,
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
