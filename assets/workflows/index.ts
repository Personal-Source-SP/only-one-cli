import type { WorkflowManifest } from '../types.js';

export const WORKFLOWS: WorkflowManifest[] = [
    {
        name: 'only-one-clockify',
        description: 'Validate and log Clockify tasks using only-one-clockify-skill and Clockify MCP.',
        requiredSkills: ['only-one-clockify-skill'],
        requiredMcps: ['clockify'],
    },
    {
        name: 'only-one-pr-git',
        description: 'Create or update a GitHub PR from current branch using only-one-pr-git-skill and GitHub MCP.',
        requiredSkills: ['only-one-pr-git-skill'],
        requiredMcps: ['github'],
    },
    {
        name: 'only-one-bug',
        description: 'Reproduce, diagnose, approve, fix, and verify a bug using evidence-driven debugging.',
        requiredSkills: ['systematic-debugging', 'test-driven-development', 'verification-before-completion'],
        requiredMcps: ['gitnexus'],
    },
    {
        name: 'only-one-ui',
        description: 'Design and implement approved, responsive, accessible UI using existing project patterns.',
        requiredSkills: ['ux-ui-max'],
    },
    {
        name: 'only-one-plan',
        description: 'Discover a bounded feature scope, design affected UI, and produce an approved micro-task plan.',
        requiredSkills: [],
        requiredMcps: ['gitnexus'],
    },
    {
        name: 'only-one-implement',
        description: 'Execute an approved feature plan through isolated subagents, mandatory TDD, review, and integration verification.',
        requiredSkills: [],
        requiredMcps: ['gitnexus'],
    },
];
