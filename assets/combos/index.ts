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
        mcps: ['gitnexus', 'fetch', 'tavily', 'github'],
        plugins: ['superpowers'],
        skills: ['c4-diagrams', 'gherkin-authoring', 'grill-me'],
        configs: ['openspec'],
        rules: ['architecture-stack', 'context-and-tools'],
        workflows: ['only-one-plan-fe', 'only-one-implement-fe', 'only-one-implement-fast', 'only-one-bug'],
    },
    {
        id: 'backend-flow',
        name: 'Backend Flow Setup',
        description: 'NestJS backend development toolkit',
        packages: ['@fission-ai/openspec'],
        mcps: ['gitnexus', 'postgres', 'github'],
        plugins: ['superpowers'],
        skills: ['c4-diagrams', 'gherkin-authoring', 'grill-me'],
        configs: ['openspec'],
        rules: ['architecture-stack', 'context-and-tools'],
        workflows: ['only-one-plan-be', 'only-one-implement-be', 'only-one-implement-fast', 'only-one-bug'],
    },
];
