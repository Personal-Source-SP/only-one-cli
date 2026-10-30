import type { ProgramDeps } from '@/cli/deps.js';
import { COLORS } from '@/constants/index.js';
import { type ExtendedComboManifest, readComboManifests } from '@/core/combo/index.js';
import { assertProjectDirectory, resolveProjectDir } from '@/core/runtime/globals.js';

export const loadComboManifestsStep = async (
    deps: ProgramDeps,
    pathArg?: string,
): Promise<{ projectDir: string; availableCombos: ExtendedComboManifest[] }> => {
    const projectDir = resolveProjectDir(deps, pathArg);
    assertProjectDirectory(projectDir);

    const availableCombos = await readComboManifests();

    if (!availableCombos?.length) {
        deps.stdout(COLORS.warning('No predefined combos available in assets/combos.'));
    }

    return { projectDir, availableCombos };
};
