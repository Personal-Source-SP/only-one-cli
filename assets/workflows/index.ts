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
        name: 'only-one-bug',
        description: 'Reproduce, diagnose, approve, fix, and verify a bug using evidence-driven debugging.',
        requiredMcps: ['gitnexus'],
    },
    {
        name: 'only-one-plan-fe',
        description: 'Shape and approve a frontend change through OpenSpec artifacts, UI system discovery, source organization, and implementation-ready phases.',
        requiredMcps: ['gitnexus'],
    },
    {
        name: 'only-one-plan-be',
        description: 'Shape and approve a NestJS backend change through OpenSpec artifacts, source organization, API contracts, and implementation-ready phases.',
        requiredMcps: ['gitnexus'],
    },
    {
        name: 'only-one-implement-fe',
        description: 'Apply an approved frontend OpenSpec change in the current workspace with tag-specific rules, phase approval, browser evidence, and no automatic commits.',
        requiredMcps: ['gitnexus'],
    },
    {
        name: 'only-one-implement-be',
        description: 'Apply an approved NestJS OpenSpec change in the current workspace with tag-specific rules, phase approval, full verification, and no automatic commits.',
        requiredMcps: ['gitnexus'],
    },
    {
        name: 'only-one-implement-fast',
        description: 'Scope, optionally plan, implement, and proportionally verify a small or moderate task directly in the current workspace.',
        requiredMcps: ['gitnexus'],
    },
];
