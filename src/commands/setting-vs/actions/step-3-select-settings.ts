import { homedir } from 'node:os';
import type { ProgramDeps } from '@/cli/deps.js';
import { checkExistingVsSettings, type ExistingVsSettingCheck, type VsEditorId } from '@/core/vs/index.js';
import { parseCsv, resolveVsPlatform } from '@/utils/index.js';
import type { SettingVsCommandOptions } from '../types.js';

export interface SelectSettingsResult {
    existingChecks: ExistingVsSettingCheck[];
    selectedKeys: string[];
}

export const selectSettingsStep = async (
    deps: ProgramDeps,
    settingsArg: string | undefined,
    availableSettingKeys: string[],
    editorIds: VsEditorId[],
    options: SettingVsCommandOptions,
): Promise<SelectSettingsResult> => {
    const existingChecks = await checkExistingVsSettings({
        editorIds,
        homeDir: homedir(),
        platform: resolveVsPlatform(),
    });

    let selectedKeys = parseCsv(settingsArg || options.settings);

    if (!selectedKeys?.length) {
        if (!deps.prompts?.checkbox) {
            selectedKeys = [...availableSettingKeys];
        } else {
            selectedKeys = await deps.prompts.checkbox({
                message: 'Select VS Code settings to sync:',
                choices: availableSettingKeys.map((key) => {
                    const editorChecks = existingChecks.filter((c) => c.key === key);
                    const allExistAndMatch =
                        editorChecks.length > 0 &&
                        editorChecks.every((c) => c.exists && JSON.stringify(c.currentValue) === JSON.stringify(c.newValue));
                    const someExistWithDiff = editorChecks.some(
                        (c) => c.exists && JSON.stringify(c.currentValue) !== JSON.stringify(c.newValue),
                    );

                    let name = key;
                    if (allExistAndMatch) {
                        name = `${key} (already up to date)`;
                    } else if (someExistWithDiff) {
                        const diffEditors = editorChecks
                            .filter((c) => c.exists && JSON.stringify(c.currentValue) !== JSON.stringify(c.newValue))
                            .map((c) => `${c.editorName}: ${JSON.stringify(c.currentValue)} -> ${JSON.stringify(c.newValue)}`)
                            .join(', ');
                        name = `${key} (exists: ${diffEditors})`;
                    }

                    return {
                        checked: !allExistAndMatch,
                        name,
                        value: key,
                    };
                }),
            });
        }
    }

    return { existingChecks, selectedKeys };
};
