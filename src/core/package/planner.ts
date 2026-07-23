import { PACKAGES } from '@assets/packages/index.js';
import type { PackageManifest } from '@assets/types.js';
import { isPackageInstalled } from '../combo/index.js';
import type { ItemOrigin, PlannedItem } from '../init/plan-types.js';

export interface PlanPackageOptions {
    projectDir: string;
    selectedPackageIds: string[];
    origin?: ItemOrigin;
    reason?: string;
    packageManifests?: PackageManifest[];
}

export async function planPackages(options: PlanPackageOptions): Promise<PlannedItem[]> {
    const { projectDir, selectedPackageIds, origin = 'selected', reason, packageManifests = PACKAGES } = options;
    const items: PlannedItem[] = [];

    for (const pkgId of selectedPackageIds) {
        const manifest = packageManifests.find((m) => m.id === pkgId);
        if (!manifest) continue;

        const { packageName, scope = 'global' } = manifest.installer;
        const installed = await isPackageInstalled(packageName, scope, projectDir);
        items.push({
            key: `package:${manifest.id}`,
            category: 'package',
            name: manifest.id,
            origin,
            state: installed ? 'existing' : 'new',
            reason,
            meta: { manifest },
        });
    }

    return items;
}
