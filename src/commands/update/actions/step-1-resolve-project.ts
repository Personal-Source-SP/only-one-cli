import type { ProgramDeps } from '@/cli/deps.js';
import { assertProjectDirectory, resolveProjectDir } from '@/core/runtime/globals.js';

export const resolveProjectStep = (deps: ProgramDeps, path?: string): string => {
    const projectDir = resolveProjectDir(deps, path);
    assertProjectDirectory(projectDir);
    return projectDir;
};
