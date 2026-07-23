import { homedir } from 'node:os';
import type { ProgramDeps } from '@/cli/deps.js';
import { checkExistingComboComponents, type ComboManifest } from '@/core/combo/index.js';
import type { TargetSelectionOption } from '@/core/target-selection/types.js';
import { parseCsv } from '@/utils/index.js';

export const selectCombosStep = async (
    deps: ProgramDeps,
    projectDir: string,
    namesArg: string | undefined,
    availableCombos: ComboManifest[],
    targetTool: TargetSelectionOption,
    targetTools: TargetSelectionOption[],
): Promise<string[]> => {
    const comboChecks = await Promise.all(
        availableCombos.map(async (c) => {
            const checks = await checkExistingComboComponents({
                projectDir,
                homeDir: homedir(),
                platform: process.platform,
                selectedTools: targetTools,
                combo: c,
            });
            const hasExisting = checks.some((item) => item.exists);
            return { combo: c, hasExisting };
        }),
    );

    let selectedComboNames = parseCsv(namesArg);
    if (!selectedComboNames?.length) {
        if (!deps.prompts?.checkbox) {
            throw new Error('Combo selection is required in non-interactive mode. Pass combo names positionally.');
        } else {
            selectedComboNames = await deps.prompts.checkbox({
                message: `Select combos to install for ${targetTool.name}:`,
                choices: comboChecks.map(({ combo: c, hasExisting }) => ({
                    name: hasExisting
                        ? `${c.id} — ${c.description || c.name} (some components exist)`
                        : `${c.id} — ${c.description || c.name}`,
                    value: c.id,
                    checked: !hasExisting,
                })),
            });
        }
    }

    return selectedComboNames;
};
