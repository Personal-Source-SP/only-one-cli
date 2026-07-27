import type { ComboManifest } from '../types.js';

export const COMBOS: ComboManifest[] = [
    {
        id: 'idsd-flow',
        name: 'IDSD Flow Setup',
        description: 'Predefined Intent-Spec-Driven development flow combo',
        packages: ['@fission-ai/openspec'],
        mcps: ['gitnexus'],
        plugins: ['superpowers'],
        skills: ['architectural-decision-records', 'c4-diagrams', 'gherkin-authoring', 'grill-me'],
        configs: ['openspec'],
    },
    {
        id: 'frontend-flow',
        name: 'Frontend Flow Setup',
        description: 'Full frontend development combo for Next.js/React — includes UI/UX tooling, Next.js-specific skills, and shared planning skills',
        packages: ['ui-ux-pro-max-cli'],
        mcps: ['gitnexus', 'fetch', 'tavily', 'github'],
        plugins: ['superpowers'],
        skills: [
            'architectural-decision-records',
            'c4-diagrams',
            'gherkin-authoring',
            'grill-me',
            'next-dev-loop',
            'next-cache-components-adoption',
            'next-cache-components-optimizer',
            'next-partial-prefetching-adoption',
        ],
        rules: ['architecture-stack', 'context-and-tools'],
        workflows: [
            'only-one-plan-fe',
            'only-one-implement-fe',
            'only-one-implement-fast',
            'only-one-bug',
        ],
    },
    {
        id: 'backend-flow',
        name: 'Backend Flow Setup',
        description: 'Full backend development combo for NestJS — includes shared planning, architecture, and spec authoring skills',
        mcps: ['gitnexus', 'postgres', 'github'],
        plugins: ['superpowers'],
        skills: [
            'architectural-decision-records',
            'c4-diagrams',
            'gherkin-authoring',
            'grill-me',
        ],
        rules: ['architecture-stack', 'context-and-tools'],
        workflows: [
            'only-one-plan-be',
            'only-one-implement-be',
            'only-one-implement-fast',
            'only-one-bug',
        ],
    },
];
