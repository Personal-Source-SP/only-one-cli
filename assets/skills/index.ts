import type { SkillManifest } from '../types.js';

export const SKILLS: SkillManifest[] = [
    {
        name: 'c4-diagrams',
        description: 'Use when explaining existing code architecture, visualizing a new system.',
    },
    {
        name: 'gherkin-authoring',
        description: 'Use when drafting, reviewing, or improving Gherkin scenarios.',
    },
    {
        name: 'grill-me',
        description: 'Interview the user relentlessly about a plan or design.',
    },
    {
        name: 'nestjs-development',
        description: 'Use when creating or modifying NestJS backend code.',
    },
    {
        name: 'react-development',
        description: 'Use when creating or modifying React frontend code.',
    },
    {
        name: 'nextjs-development',
        description: 'Use when creating or modifying Next.js routes or components.',
    },
    {
        name: 'only-one-next-dev-loop',
        description: 'Verify Next.js runtime behavior in a running application.',
    },
    {
        name: 'only-one-next-cache-components-adoption',
        description: 'Enable or migrate Next.js Cache Components safely.',
    },
    {
        name: 'only-one-next-cache-components-optimizer',
        description: 'Optimize Cache Components routes for verified instant navigation.',
    },
    {
        name: 'only-one-next-partial-prefetching-adoption',
        description: 'Enable or migrate Next.js Partial Prefetching safely.',
    },
    {
        name: 'ui-ux-development',
        description: 'Use when designing or materially changing user interfaces.',
    },
    {
        name: 'only-one-clockify-skill',
        description: 'Validate and log Clockify time entries from task lines.',
        associatedWorkflows: ['only-one-clockify'],
    },
    {
        name: 'only-one-pr-git-skill',
        description: 'Create or update a GitHub Pull Request from the current branch.',
        associatedWorkflows: ['only-one-pr-git'],
    },
];

