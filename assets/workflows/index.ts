import type { WorkflowManifest } from '../types.js';

export const WORKFLOWS: WorkflowManifest[] = [
    {
        name: 'only-one-ag-plan',
        description:
            'Research current code and create a focused implementation plan with design options, architecture, code examples, and test cases.',
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
    {
        name: 'only-one-implement-fast',
        description: 'Fix a small, evidenced issue with minimal context, inline patch review, and focused verification.',
    },
];
