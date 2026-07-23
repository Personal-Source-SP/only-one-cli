import type { ProgramDeps } from '@/cli/deps.js';
import { syncVsExtensions, type VsEditorId } from '@/core/vs/index.js';
import { COLORS } from '@/constants/index.js';
import type { ExtensionsVsCommandOptions } from '../types.js';

export const syncExtensionsStep = async (
    deps: ProgramDeps,
    editorIds: VsEditorId[],
    options: ExtensionsVsCommandOptions,
): Promise<void> => {
    const result = await syncVsExtensions({ cwd: deps.cwd, editorIds, write: deps.stdout, force: options.force });

    deps.stdout(COLORS.cli.header('\nSync Summary:'));
    for (const res of result.results) {
        deps.stdout(COLORS.secondary(`${res.editorName}:`));
        if (!res.installedExtensions?.length) {
            deps.stdout(COLORS.dim(`  No new extensions installed.`));
        } else {
            deps.stdout(COLORS.success(`  Installed extensions:`));
            for (const ext of res.installedExtensions) {
                deps.stdout(`    - ${COLORS.cli.option(ext)}`);
            }
        }
    }
};
