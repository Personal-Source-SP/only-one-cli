import type { ConfigManifest } from '../types.js';

export const CONFIGS: Record<string, ConfigManifest> = {
    'openspec-fe': {
        name: 'openspec-fe',
        description: 'OpenSpec frontend planning and implementation profile',
        files: [{ src: 'openspec-fe', dest: 'openspec' }],
    },
    'openspec-be': {
        name: 'openspec-be',
        description: 'OpenSpec backend planning and implementation profile',
        files: [{ src: 'openspec-be', dest: 'openspec' }],
    },
};
