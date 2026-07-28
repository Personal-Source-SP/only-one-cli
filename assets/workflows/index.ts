import type { WorkflowManifest } from '../types.js';

export const WORKFLOWS: WorkflowManifest[] = [
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
        description: 'Scope, optionally plan, implement, and proportionally verify a small or moderate task directly in the current workspace.',
        requiredMcps: ['gitnexus'],
    },
];
