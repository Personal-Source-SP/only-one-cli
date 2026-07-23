import type { ProgramDeps } from '@/cli/deps.js';
import { assertProjectDirectory, resolveProjectDir } from '@/core/runtime/globals.js';
import { COLORS } from '@/constants/index.js';
import { PLUGINS } from '@assets/plugins/index.js';

export const loadPluginManifestsStep = (deps: ProgramDeps, pathArg?: string): { projectDir: string; plugins: typeof PLUGINS } => {
    const projectDir = resolveProjectDir(deps, pathArg);
    assertProjectDirectory(projectDir);

    if (!PLUGINS?.length) {
        deps.stdout(COLORS.warning('No plugins available in assets/plugins.'));
    }

    return { projectDir, plugins: PLUGINS };
};
