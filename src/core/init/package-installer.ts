import type { ProgramDeps } from '@/cli/deps.js';
import type { PackageManifest } from './types.js';

export interface PackageActionResult {
    installed: string[];
    actionRequired: string[];
    skipped: string[];
    failed: string[];
}

export interface ExecutePackageActionsOptions {
    deps: ProgramDeps;
    projectDir: string;
    packageManifests: PackageManifest[];
    selectedPackageIds: string[];
    overwriteList?: string[];
    execFileAsync?: (file: string, args: string[], options: any) => Promise<{ stdout: string; stderr: string }>;
}

export const executePackageActions = async (
    options: ExecutePackageActionsOptions,
): Promise<{
    installedPackages: string[];
    summary: PackageActionResult;
}> => {
    const { deps, projectDir, packageManifests, selectedPackageIds, overwriteList } = options;

    const selectedManifests = selectedPackageIds
        .map((id) => packageManifests.find((m) => m.id === id))
        .filter((m): m is PackageManifest => m !== undefined);

    const installed: string[] = [];
    const actionRequired: string[] = [];
    const skipped: string[] = [];
    const failed: string[] = [];

    const { execFile } = await import('node:child_process');
    const { promisify } = await import('node:util');
    const runExecFile = options.execFileAsync ?? promisify(execFile);

    for (const pkg of selectedManifests) {
        if (overwriteList && !overwriteList.includes(pkg.id)) {
            skipped.push(pkg.id);
            deps.stdout(`  - Skipped ${pkg.id} (already installed)`);
            continue;
        }
        const { packageName, scope = 'global' } = pkg.installer;
        deps.stdout(`  Installing ${pkg.id}...`);
        const args = ['install', packageName];
        if (scope === 'global') args.push('-g');
        if (overwriteList && overwriteList.includes(pkg.id)) {
            args.push('--force');
        }
        try {
            await runExecFile('npm', args, { cwd: projectDir, timeout: 120000, shell: true });
            installed.push(pkg.id);
            deps.stdout(`    ✓ Installed ${pkg.id}`);
        } catch (error) {
            failed.push(pkg.id);
            deps.stdout(`    ✗ Failed to install ${pkg.id}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    return {
        installedPackages: installed,
        summary: { installed, actionRequired, skipped, failed },
    };
};
