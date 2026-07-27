import type { ComboManifest } from '../types.js';

export const COMBOS: ComboManifest[] = [
    {
        id: 'frontend-flow',
        name: 'Frontend Flow Setup',
        description:
            'Full frontend development combo for Next.js/React — includes OpenSpec, UI/UX tooling, Next.js-specific skills, and shared planning skills',
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
        workflows: ['only-one-plan-fe', 'only-one-implement-fe', 'only-one-implement-fast', 'only-one-bug', 'only-one-archive-cleanup'],
    },
    {
        id: 'backend-flow',
        name: 'Backend Flow Setup',
        description:
            'Full backend development combo for NestJS — includes OpenSpec and shared planning, architecture, and spec authoring skills',
        packages: ['@fission-ai/openspec'],
        mcps: ['gitnexus', 'postgres', 'github'],
        plugins: ['superpowers'],
        skills: ['c4-diagrams', 'gherkin-authoring', 'grill-me'],
        configs: ['openspec'],
        rules: ['architecture-stack', 'context-and-tools'],
        workflows: ['only-one-plan-be', 'only-one-implement-be', 'only-one-implement-fast', 'only-one-bug', 'only-one-archive-cleanup'],
    },
];
