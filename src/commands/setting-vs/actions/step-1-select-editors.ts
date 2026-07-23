import type { ProgramDeps } from '@/cli/deps.js';
import { selectSingleAllowedVsSettingsTarget } from '@/core/target-selection/index.js';
import type { VsEditorId } from '@/core/vs/index.js';
import type { SettingVsCommandOptions } from '../types.js';

export const selectEditorsStep = async (deps: ProgramDeps, options: SettingVsCommandOptions): Promise<VsEditorId[]> => {
    const editor = await selectSingleAllowedVsSettingsTarget({
        automatic: false,
        explicit: options.editors,
        message: 'Select editors to sync settings',
        prompts: deps.prompts,
    });
    return [editor.id];
};
