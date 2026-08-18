import type { WorkflowManifest } from '../types.js';

export const WORKFLOWS: WorkflowManifest[] = [
    {
        name: 'only-one-sync',
        description:
            'Sync domain use cases from tasks (if present) and current codebase for a specific domain, then clean up consolidated tasks.',
    },
    {
        name: 'only-one-ag-plan',
        description:
            'Research current code and create a focused implementation plan with design options, architecture, code examples, and test cases.',
    },
    {
        name: 'only-one-apply',
        description: 'Implement tasks from an approved plan.md, working through each file change in order.',
    },
    {
        name: 'only-one-clockify',
        description: 'Validate and log Clockify tasks using only-one-clockify-skill and Clockify MCP.',
        requiredMcps: ['clockify'],
    },
    {
        name: 'only-one-pr-git',
        description: 'Create or update a GitHub PR from current branch using only-one-pr-git-skill and GitHub MCP.',
        requiredMcps: ['github'],
    },
];
