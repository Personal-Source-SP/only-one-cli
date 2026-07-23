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
        name: 'only-one-plan-skill',
        description: 'Perform grounded code discovery and draft an approved planning artifact using GitNexus MCP.',
        associatedWorkflows: ['only-one-plan'],
    },
];
