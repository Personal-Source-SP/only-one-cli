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
        name: 'only-one-nestjs-development',
        description: 'Use for NestJS development with selectively loaded architecture references.',
    },
    {
        name: 'only-one-nextjs-development',
        description: 'Use for Next.js and React development with selectively loaded references.',
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
    {
        name: 'system-design',
        description:
            'High-scale distributed system design framework enforcing production-grade resilience, edge case handling, capacity estimation, and component deep dives.',
    },
    {
        name: 'ux-flow-designer',
        description:
            'Enforces strict UX standards, 5-state component matrix, WCAG accessibility, Mermaid flow diagrams, and AI Design System rules.',
    },
];
