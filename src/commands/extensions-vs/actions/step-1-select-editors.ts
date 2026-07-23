import type { ProgramDeps } from '@/cli/deps.js';
import { selectSingleAllowedVsExtensionsTarget } from '@/core/target-selection/index.js';
import type { VsEditorId } from '@/core/vs/index.js';
import type { ExtensionsVsCommandOptions } from '../types.js';

export const selectEditorsStep = async (deps: ProgramDeps, options: ExtensionsVsCommandOptions): Promise<VsEditorId[]> => {
    const editor = await selectSingleAllowedVsExtensionsTarget({
        automatic: false,
        explicit: options.editors,
        message: 'Select editors to sync extensions',
        prompts: deps.prompts,
    });
    return [editor.id];
};
