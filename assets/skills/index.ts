import type { SkillManifest } from '../types.js';

export const SKILLS: SkillManifest[] = [
    {
        name: 'architectural-decision-records',
        description: 'Use when documenting, drafting, reviewing, or updating architectural decisions.',
    },
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
        name: 'next-dev-loop',
        description: 'Verify Next.js runtime behavior through the development server and browser.',
    },
    {
        name: 'next-cache-components-adoption',
        description: 'Enable Cache Components and resolve blocking routes in Next.js applications.',
    },
    {
        name: 'next-cache-components-optimizer',
        description: 'Optimize Next.js Cache Components boundaries and cache behavior.',
    },
    {
        name: 'next-partial-prefetching-adoption',
        description: 'Adopt partial prefetching in eligible Next.js applications.',
    },
    {
        name: 'subagent-driven-development',
        description: 'Execute implementation plans with isolated task agents and review gates.',
    },
    {
        name: 'test-driven-development',
        description: 'Use test-first red-green-refactor cycles for features and fixes.',
    },
    {
        name: 'requesting-code-review',
        description: 'Request rigorous code review before integration.',
    },
    {
        name: 'verification-before-completion',
        description: 'Require fresh verification evidence before completion claims.',
    },
    {
        name: 'systematic-debugging',
        description: 'Diagnose root causes before proposing fixes.',
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
