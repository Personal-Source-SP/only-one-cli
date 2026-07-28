import type { ComboManifest } from '../types.js';

export const COMBOS: ComboManifest[] = [
    {
        id: 'frontend-flow',
        name: 'Frontend Flow Setup',
        description: 'Next.js and React frontend development toolkit',
        packages: [
            '@fission-ai/openspec',
            'ui-ux-pro-max-cli',
            'next-dev-loop',
            'next-cache-components-adoption',
            'next-cache-components-optimizer',
            'next-partial-prefetching-adoption',
        ],
        mcps: ['fetch', 'tavily', 'github', 'clockify'],
        skills: [
            'c4-diagrams',
            'gherkin-authoring',
            'grill-me',
            'only-one-clockify-skill',
            'only-one-pr-git-skill',
        ],
        configs: ['openspec'],
        rules: ['architecture-stack', 'context-and-tools'],
        workflows: [
            'only-one-implement-fast',
            'only-one-clockify',
            'only-one-pr-git',
        ],
    },
    {
        id: 'backend-flow',
        name: 'Backend Flow Setup',
        description: 'NestJS backend development toolkit',
        packages: ['@fission-ai/openspec'],
        mcps: ['postgres', 'github', 'clockify'],
        skills: [
            'c4-diagrams',
            'gherkin-authoring',
            'grill-me',
            'only-one-clockify-skill',
            'only-one-pr-git-skill',
        ],
        configs: ['openspec'],
        rules: ['architecture-stack', 'context-and-tools'],
        workflows: [
            'only-one-implement-fast',
            'only-one-clockify',
            'only-one-pr-git',
        ],
    },
];
