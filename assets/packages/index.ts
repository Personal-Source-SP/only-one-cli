import type { PackageManifest } from '../types.js';

export const PACKAGES: PackageManifest[] = [
    {
        id: 'ui-ux-pro-max-cli',
        version: '0.0.1',
        description: 'UI/UX Pro Max — automated UI/UX auditing and design intelligence installer for agent tools',
        installer: {
            kind: 'npm',
            packageName: 'ui-ux-pro-max-cli',
            scope: 'global',
        },
        requirements: ['node', 'npm'],
    },
    {
        id: 'wondelai/skills/system-design',
        version: '0.0.1',
        description: 'System Design Interview & distributed architecture skill from wondelai/skills',
        installer: {
            kind: 'skills',
            source: 'wondelai/skills/system-design',
            skillName: 'system-design',
            cliVersion: 'latest',
        },
        requirements: ['node', 'npx'],
    },
    {
        id: 'ux-flow-designer',
        version: '0.0.1',
        description: 'UX Flow Designer & AI Design System skill from ThomasPraun/ux-flow-designer',
        installer: {
            kind: 'skills',
            source: 'ThomasPraun/ux-flow-designer',
            skillName: 'ux-flow-designer',
            cliVersion: 'latest',
        },
        requirements: ['node', 'npx'],
    },
];
