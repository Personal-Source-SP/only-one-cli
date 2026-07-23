import type { ProgramDeps } from '@/cli/deps.js';
import type { ExistingVsExtensionCheck, VsEditorId } from '@/core/vs/index.js';
import type { ExtensionsVsCommandOptions } from '../types.js';

export const confirmExtensionOverwriteStep = async (
    deps: ProgramDeps,
    selectedExtensions: string[],
    existingChecks: ExistingVsExtensionCheck[],
    editorIds: VsEditorId[],
    options: ExtensionsVsCommandOptions,
): Promise<Record<VsEditorId, string[]>> => {
    const extensionIdsPerEditor: Record<VsEditorId, string[]> = {} as Record<VsEditorId, string[]>;

    if (options.force) {
        for (const editorId of editorIds) {
            extensionIdsPerEditor[editorId] = [...selectedExtensions];
        }
        return extensionIdsPerEditor;
    }

    const alreadyExisting = existingChecks.filter(
        (c) => selectedExtensions.some((ext) => ext.toLowerCase() === c.extensionId.toLowerCase()) && c.exists,
    );

    let overwriteSelections: string[] = [];

    if (alreadyExisting.length > 0 && deps.prompts?.checkbox) {
        overwriteSelections = await deps.prompts.checkbox({
            message: 'The following extensions already exist. Select which ones you want to overwrite/reinstall:',
            choices: alreadyExisting.map((c) => ({
                checked: true,
                name: `${c.extensionId} in ${c.editorName}`,
                value: `${c.editorId}:${c.extensionId}`,
            })),
        });
    }

    const overwriteSet = new Set(overwriteSelections);

    for (const editorId of editorIds) {
        const toInstall: string[] = [];
        for (const ext of selectedExtensions) {
            const check = existingChecks.find((c) => c.editorId === editorId && c.extensionId.toLowerCase() === ext.toLowerCase());
            const exists = check?.exists ?? false;

            if (!exists || overwriteSet.has(`${editorId}:${ext}`)) {
                toInstall.push(ext);
            }
        }
        extensionIdsPerEditor[editorId] = toInstall;
    }

    return extensionIdsPerEditor;
};
