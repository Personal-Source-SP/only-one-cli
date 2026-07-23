import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { assertProjectDirectory, resolveProjectDir } from '@/core/runtime/globals.js';
import { readComboManifests, type ExtendedComboManifest } from '@/core/combo/index.js';

export const loadComboManifestsStep = async (
    deps: ProgramDeps,
    pathArg?: string,
): Promise<{ projectDir: string; availableCombos: ExtendedComboManifest[] }> => {
    const projectDir = resolveProjectDir(deps, pathArg);
    assertProjectDirectory(projectDir);

    const availableCombos = await readComboManifests();
    if (!availableCombos?.length) {
        deps.stdout(COLORS.warning('No predefined combos available in libraries/combos.'));
    }

    return { projectDir, availableCombos };
};
