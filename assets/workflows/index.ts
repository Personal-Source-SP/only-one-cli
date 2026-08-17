import type { WorkflowManifest } from '../types.js';

export const WORKFLOWS: WorkflowManifest[] = [
    {
        name: 'only-one-sync',
        description:
            'Check use cases against current codebase and sync: update changed, add new, mark deleted.',
    },
    {
        name: 'only-one-ag-plan',
        description:
            'Research current code and create a focused implementation plan with design options, architecture, code examples, and test cases.',
    },
    {
        name: 'only-one-apply',
        description: 'Implement tasks from an approved plan.html, working through each file change in order.',
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
