import type { ProgramDeps } from '@/cli/deps.js';
import type { ExtendedComboManifest } from '@/core/combo/index.js';
import { buildComboDependencyPlan } from '@/core/combo/index.js';

export const selectComboPluginsStep = async (deps: ProgramDeps, combo: ExtendedComboManifest): Promise<string[]> => {
    const plugins = buildComboDependencyPlan(combo).plugins;
    if (!plugins.length) return [];
    if (!deps.prompts?.checkbox) return plugins;

    return deps.prompts.checkbox({
        message: 'Select plugin actions to run (optional; plugin installation state cannot be detected):',
        choices: plugins.map((plugin) => ({
            name: `${plugin} (may reinstall or run an external command)`,
            value: plugin,
            checked: false,
        })),
    });
};
