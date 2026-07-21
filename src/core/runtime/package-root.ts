import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const resolvePackageRoot = (metaUrl: string): string => {
    const startDir = dirname(fileURLToPath(metaUrl));
    let dir = startDir;
    while (true) {
        if (existsSync(join(dir, 'package.json'))) {
            return dir;
        }
        const parent = dirname(dir);
        if (parent === dir) {
            break;
        }
        dir = parent;
    }
    // Fallback
    return join(startDir, '../../..');
};
