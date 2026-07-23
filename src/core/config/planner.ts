import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ItemOrigin, PlannedItem } from '@/core/init/plan-types.js';

export interface PlanConfigOptions {
    projectDir: string;
    selectedConfigNames: string[];
    origin?: ItemOrigin;
    reason?: string;
    configFilesMap?: Record<string, { src: string; dest: string }>;
}

export const DEFAULT_CONFIG_MAP: Record<string, { src: string; dest: string }> = {
    openspec: { src: 'templates/openspec/config.yaml', dest: 'openspec/config.yaml' },
};

export async function planConfigs(options: PlanConfigOptions): Promise<PlannedItem[]> {
    const { projectDir, selectedConfigNames, origin = 'selected', reason, configFilesMap = DEFAULT_CONFIG_MAP } = options;
    const items: PlannedItem[] = [];

    for (const name of selectedConfigNames) {
        const mapping = configFilesMap[name.toLowerCase()];
        if (!mapping) continue;

        const destPath = join(projectDir, mapping.dest);
        const exists = existsSync(destPath);

        items.push({
            key: `config:${name.toLowerCase()}`,
            category: 'config',
            name: name.toLowerCase(),
            destination: mapping.dest,
            origin,
            state: exists ? 'existing' : 'new',
            reason,
            meta: { src: mapping.src, dest: mapping.dest, destPath },
        });
    }

    return items;
}
