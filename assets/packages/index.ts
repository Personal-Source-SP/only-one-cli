import type { PackageManifest } from '../types.js';

export const PACKAGES: PackageManifest[] = [
    {
        id: '@fission-ai/openspec',
        description: 'OpenSpec CLI — project setup, tool selection, and agent skill management',
        installer: {
            kind: 'npm',
            packageName: '@fission-ai/openspec',
            scope: 'global',
        },
        requirements: ['node', 'npm'],
    },
    {
        id: 'ui-ux-pro-max-cli',
        description: 'UI/UX Pro Max — automated UI/UX auditing and design intelligence installer for agent tools',
        installer: {
            kind: 'npm',
            packageName: 'ui-ux-pro-max-cli',
            scope: 'global',
        },
        requirements: ['node', 'npm'],
    },
];
