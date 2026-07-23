import { homedir } from 'node:os';
import type { ProgramDeps } from '@/cli/deps.js';
import { checkExistingComboComponents, type ComboManifest } from '@/core/combo/index.js';
import type { TargetSelectionOption } from '@/core/target-selection/types.js';

export const confirmComboOverwriteStep = async (
    deps: ProgramDeps,
    projectDir: string,
    combo: ComboManifest,
    targetTools: TargetSelectionOption[],
): Promise<string[]> => {
    const checks = await checkExistingComboComponents({
        projectDir,
        homeDir: homedir(),
        platform: process.platform,
        selectedTools: targetTools,
        combo,
    });

    const alreadyExisting = checks.filter((c) => c.exists);
    let overwriteList: string[] = [];

    if (alreadyExisting.length > 0 && deps.prompts?.checkbox) {
        overwriteList = await deps.prompts.checkbox({
            message: `The following components in combo '${combo.name}' already exist. Select which ones you want to overwrite/reinstall:`,
            choices: alreadyExisting.map((c) => ({
                name: c.label,
                value: c.id,
                checked: true,
            })),
        });
    }

    return overwriteList;
};
