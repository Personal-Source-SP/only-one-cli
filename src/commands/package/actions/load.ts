import type { ProgramDeps } from '@/cli/deps.js';
import { assertProjectDirectory, resolveProjectDir } from '@/core/runtime/globals.js';
import { PACKAGES } from '@assets/packages/index.js';
import type { PackageManifest } from '@assets/types.js';

export interface LoadedPackagesResult {
    projectDir: string;
    availablePackages: PackageManifest[];
}

export const loadPackagesStep = (deps: ProgramDeps, pathArg?: string): LoadedPackagesResult => {
    const projectDir = resolveProjectDir(deps, pathArg);
    assertProjectDirectory(projectDir);

    return {
        projectDir,
        availablePackages: PACKAGES,
    };
};
