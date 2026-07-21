import type { ComboManifest } from '../types.js';

export const COMBOS: ComboManifest[] = [
    {
        id: 'idsd-flow',
        name: 'IDSD Flow Setup',
        description: 'Predefined Intent-Spec-Driven development flow combo',
        packages: ['@fission-ai/openspec'],
        skills: ['architectural-decision-records', 'c4-diagrams', 'gherkin-authoring', 'grill-me'],
        configs: ['openspec'],
    },
];
