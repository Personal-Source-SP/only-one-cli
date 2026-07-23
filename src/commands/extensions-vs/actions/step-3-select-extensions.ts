import type { ProgramDeps } from '@/cli/deps.js';
import { checkExistingVsExtensions, type ExistingVsExtensionCheck, type VsEditorId } from '@/core/vs/index.js';
import { parseCsv } from '@/utils/index.js';
import type { ExtensionsVsCommandOptions } from '../types.js';

export interface SelectExtensionsResult {
    existingChecks: ExistingVsExtensionCheck[];
    selectedExtensions: string[];
}

export const selectExtensionsStep = async (
    deps: ProgramDeps,
    extensionsArg: string | undefined,
    availableExtensions: string[],
    editorIds: VsEditorId[],
    options: ExtensionsVsCommandOptions,
): Promise<SelectExtensionsResult> => {
    const existingChecks = await checkExistingVsExtensions({
        editorIds,
        extensionIds: availableExtensions,
    });

    let selectedExtensions = parseCsv(extensionsArg || options.extensions);

    if (!selectedExtensions?.length) {
        if (!deps.prompts?.checkbox) {
            selectedExtensions = [...availableExtensions];
        } else {
            const choices = availableExtensions.map((ext) => {
                const editorChecks = existingChecks.filter((c) => c.extensionId.toLowerCase() === ext.toLowerCase());
                const allExist = editorChecks.length > 0 && editorChecks.every((c) => c.exists);
                const someExist = editorChecks.some((c) => c.exists);

                let name = ext;
                if (allExist) {
                    name = `${ext} (already exists)`;
                } else if (someExist) {
                    const existingEditors = editorChecks
                        .filter((c) => c.exists)
                        .map((c) => c.editorName)
                        .join(', ');
                    name = `${ext} (already exists in ${existingEditors})`;
                }

                return {
                    checked: !allExist,
                    name,
                    value: ext,
                    allExist,
                    someExist,
                };
            });
            choices.sort((a, b) => {
                if (a.allExist !== b.allExist) return Number(a.allExist) - Number(b.allExist);
                return Number(a.someExist) - Number(b.someExist);
            });

            selectedExtensions = await deps.prompts.checkbox({
                message: 'Select VS Code extensions to install:',
                choices: choices.map(({ allExist, someExist, ...choice }) => choice),
            });
        }
    }

    return { existingChecks, selectedExtensions };
};
