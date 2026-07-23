import type { ProgramDeps } from '@/cli/deps.js';
import type { ExistingVsSettingCheck, VsEditorId } from '@/core/vs/index.js';
import type { SettingVsCommandOptions } from '../types.js';

export const confirmSettingOverwriteStep = async (
    deps: ProgramDeps,
    selectedKeys: string[],
    existingChecks: ExistingVsSettingCheck[],
    editorIds: VsEditorId[],
    options: SettingVsCommandOptions,
): Promise<Record<VsEditorId, string[]>> => {
    const settingKeysPerEditor: Record<VsEditorId, string[]> = {} as Record<VsEditorId, string[]>;

    if (options.force) {
        for (const editorId of editorIds) {
            settingKeysPerEditor[editorId] = [...selectedKeys];
        }
        return settingKeysPerEditor;
    }

    const alreadyExisting = existingChecks.filter(
        (c) => selectedKeys.includes(c.key) && c.exists && JSON.stringify(c.currentValue) !== JSON.stringify(c.newValue),
    );

    let overwriteSelections: string[] = [];

    if (alreadyExisting.length > 0 && deps.prompts?.checkbox) {
        overwriteSelections = await deps.prompts.checkbox({
            message: 'The following settings already exist with different values. Select which ones you want to overwrite:',
            choices: alreadyExisting.map((c) => ({
                checked: true,
                name: `${c.key} in ${c.editorName} (${JSON.stringify(c.currentValue)} -> ${JSON.stringify(c.newValue)})`,
                value: `${c.editorId}:${c.key}`,
            })),
        });
    }

    const overwriteSet = new Set(overwriteSelections);

    for (const editorId of editorIds) {
        const keysToSync: string[] = [];
        for (const key of selectedKeys) {
            const check = existingChecks.find((c) => c.editorId === editorId && c.key === key);
            const exists = check?.exists ?? false;
            const isDifferent = exists && JSON.stringify(check?.currentValue) !== JSON.stringify(check?.newValue);

            if (!exists || !isDifferent || overwriteSet.has(`${editorId}:${key}`)) {
                keysToSync.push(key);
            }
        }
        settingKeysPerEditor[editorId] = keysToSync;
    }

    return settingKeysPerEditor;
};
