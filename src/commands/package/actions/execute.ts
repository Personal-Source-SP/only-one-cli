import type { ProgramDeps } from '@/cli/deps.js';
import { executePackageActions } from '@/core/init/package-installer.js';
import type { PackageManifest } from '@assets/types.js';
import { isPackageInstalled } from '@/core/combo/index.js';

export const executePackagesStep = async (
    deps: ProgramDeps,
    projectDir: string,
    packageManifests: PackageManifest[],
    selectedPackageIds: string[],
    overwriteList: string[],
): Promise<void> => {
    // 1. Determine which selected packages are already installed
    const packageStatuses = await Promise.all(
        selectedPackageIds.map(async (id) => {
            const pkg = packageManifests.find((m) => m.id === id);
            if (!pkg) return { id, installed: false };
            const scope = pkg.installer.scope ?? 'global';
            const installed = await isPackageInstalled(pkg.installer.packageName, scope, projectDir);
            return { id, installed };
        }),
    );

    const installedIds = packageStatuses.filter((s) => s.installed).map((s) => s.id);

    // 2. We only install packages that are:
    //    - Not already installed, OR
    //    - Already installed but present in the overwriteList
    const packagesToInstall = selectedPackageIds.filter((id) => {
        if (installedIds.includes(id)) {
            return overwriteList.includes(id);
        }
        return true;
    });

    const skippedPackages = selectedPackageIds.filter((id) => !packagesToInstall.includes(id));

    deps.stdout('\nInstalling packages...');

    const result = await executePackageActions({
        deps,
        projectDir,
        packageManifests,
        selectedPackageIds: packagesToInstall,
        overwriteList: packagesToInstall, // Pass as overwriteList so that it doesn't skip them internally
    });

    // 3. Render Sync Report
    deps.stdout('\n==================================================');
    deps.stdout('               PACKAGES SYNC REPORT                    ');
    deps.stdout('==================================================');

    if (result.installedPackages.length > 0) {
        deps.stdout('\n✓ Successfully Installed (New/Reinstalled):');
        for (const pkgId of result.installedPackages) {
            deps.stdout(`  - ${pkgId}`);
        }
    }

    if (skippedPackages.length > 0) {
        deps.stdout('\n⚠ Skipped (Already Installed):');
        for (const pkgId of skippedPackages) {
            deps.stdout(`  - ${pkgId}`);
        }
    }

    if (result.summary.failed.length > 0) {
        deps.stdout('\n✗ Failed to Install:');
        for (const pkgId of result.summary.failed) {
            deps.stdout(`  - ${pkgId}`);
        }
    }

    deps.stdout('\n==================================================\n');
};
