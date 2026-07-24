import type { ProgramDeps } from '@/cli/deps.js';
import { isPackageInstalled } from '@/core/combo/index.js';
import type { PackageManifest } from '@assets/types.js';
import { searchableMultiSelect } from '@/prompts/searchable-multi-select.js';

export interface SelectPackagesResult {
    selectedPackageIds: string[];
    overwriteList: string[];
}

export const selectPackagesStep = async (
    deps: ProgramDeps,
    projectDir: string,
    namesArg: string | undefined,
    availablePackages: PackageManifest[],
): Promise<SelectPackagesResult> => {
    // 1. Determine existing package statuses
    const packageStatuses = await Promise.all(
        availablePackages.map(async (pkg) => {
            const scope = pkg.installer.scope ?? 'global';
            const installed = await isPackageInstalled(pkg.installer.packageName, scope, projectDir);
            return { pkg, installed };
        }),
    );

    let selectedPackageIds: string[] = [];

    if (namesArg) {
        const inputNames = namesArg
            .split(',')
            .map((n) => n.trim())
            .filter(Boolean);
        for (const name of inputNames) {
            const found = availablePackages.find((p) => p.id === name || p.installer.packageName === name);
            if (!found) {
                throw new Error(`Package '${name}' not found in assets/packages.`);
            }
            selectedPackageIds.push(found.id);
        }
    } else {
        const choices = packageStatuses.map(({ pkg, installed }) => ({
            name: pkg.description ? `${pkg.id} — ${pkg.description}` : pkg.id,
            value: pkg.id,
            checked: !installed, // do not tick if already installed
        }));

        const checkbox = deps.prompts?.checkbox ?? searchableMultiSelect;
        selectedPackageIds = await checkbox({
            message: 'Select packages to install:',
            choices,
        });
    }

    // 2. Overwrite / Reinstall verification
    const installedSelected = packageStatuses.filter((s) => selectedPackageIds.includes(s.pkg.id) && s.installed);
    let overwriteList: string[] = [];

    if (installedSelected.length > 0 && deps.prompts?.checkbox) {
        overwriteList = await deps.prompts.checkbox({
            message: 'The following packages are already installed. Select which ones you want to overwrite/reinstall:',
            choices: installedSelected.map((s) => ({
                name: s.pkg.id,
                value: s.pkg.id,
                checked: false, // unchecked by default, wait for user confirmation
            })),
        });
    } else if (installedSelected.length > 0) {
        const confirmFn = deps.prompts?.confirm;
        if (confirmFn) {
            for (const s of installedSelected) {
                const proceed = await confirmFn({
                    message: `Package '${s.pkg.id}' is already installed. Reinstall/overwrite?`,
                    default: false,
                });
                if (proceed) {
                    overwriteList.push(s.pkg.id);
                }
            }
        } else {
            // non-interactive default
            overwriteList = installedSelected.map((s) => s.pkg.id);
        }
    }

    return {
        selectedPackageIds,
        overwriteList,
    };
};
