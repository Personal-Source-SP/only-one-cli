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
    ...['next-dev-loop', 'next-cache-components-adoption', 'next-cache-components-optimizer', 'next-partial-prefetching-adoption'].map(
        (skillName): PackageManifest => ({
            id: skillName,
            description: `Official Next.js skill: ${skillName}`,
            installer: {
                kind: 'skills',
                source: 'https://github.com/vercel/next.js/tree/canary/skills',
                skillName,
                cliVersion: '1.4.0',
            },
            requirements: ['node', 'npm'],
        }),
    ),
];
