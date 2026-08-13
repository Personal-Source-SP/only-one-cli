import type { ComboManifest } from '../types.js';

export const COMBOS: ComboManifest[] = [
    {
        id: 'frontend-flow',
        name: 'Frontend Flow Setup',
        description: 'Next.js and React frontend development toolkit',
        packages: ['ui-ux-pro-max-cli'],
        skills: ['c4-diagrams', 'gherkin-authoring', 'grill-me', 'only-one-nextjs-development'],
        rules: ['next-architecture-stack', 'context-and-tools'],
        workflows: ['only-one-sync', 'only-one-ag-plan', 'only-one-apply'],
    },
    {
        id: 'backend-flow',
        name: 'Backend Flow Setup',
        description: 'NestJS backend development toolkit',
        skills: ['c4-diagrams', 'gherkin-authoring', 'grill-me', 'only-one-nestjs-development'],
        rules: ['nest-architecture-stack', 'context-and-tools'],
        workflows: ['only-one-sync', 'only-one-ag-plan', 'only-one-apply'],
    },
    {
        id: 'mcp-flow',
        name: 'MCP Flow Setup',
        description: 'Model Context Protocol (MCP) servers toolkit',
        mcps: ['fetch', 'tavily', 'github', 'clockify', 'postgres'],
    },
    {
        id: 'git-clockify-flow',
        name: 'Git & Clockify Flow Setup',
        description: 'GitHub PR and Clockify time logging integration toolkit',
        skills: ['only-one-clockify-skill', 'only-one-pr-git-skill'],
        workflows: ['only-one-clockify', 'only-one-pr-git'],
    },
];
