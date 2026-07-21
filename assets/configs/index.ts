import type { ConfigManifest } from '../types.js';

export const CONFIGS: Record<string, ConfigManifest> = {
    openspec: {
        name: 'openspec',
        description: 'OpenSpec default rules configuration',
        files: [
            {
                src: 'openspec',
                dest: 'openspec',
            },
        ],
    },
};
