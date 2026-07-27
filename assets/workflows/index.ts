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
        name: 'only-one-plan-fe',
        description: 'Shape and approve a Next.js or React change through OpenSpec artifacts, bounded UI discovery, framework constraints, and TDD-ready micro-tasks.',
        requiredSkills: ['ux-ui-max', 'next-dev-loop', 'next-cache-components-adoption', 'next-cache-components-optimizer', 'next-partial-prefetching-adoption', 'gherkin-authoring'],
        requiredMcps: ['gitnexus'],
    },
    {
        name: 'only-one-plan-be',
        description: 'Shape and approve a NestJS backend change through OpenSpec artifacts, bounded discovery, schema analysis, API contracts, and TDD-ready micro-tasks.',
        requiredSkills: ['gherkin-authoring'],
        requiredMcps: ['gitnexus'],
    },
    {
        name: 'only-one-implement-fe',
        description: 'Apply an approved frontend OpenSpec change in one feature worktree with TDD, browser evidence, checkpoint commits, full verification, and unstaged local handoff.',
        requiredSkills: ['ux-ui-max', 'next-dev-loop', 'next-cache-components-adoption', 'next-cache-components-optimizer', 'next-partial-prefetching-adoption', 'test-driven-development', 'requesting-code-review', 'verification-before-completion'],
        requiredMcps: ['gitnexus'],
    },
    {
        name: 'only-one-implement-be',
        description: 'Apply an approved NestJS OpenSpec change in one feature worktree with strict TDD, checkpoint commits, full verification, and unstaged local handoff.',
        requiredSkills: ['test-driven-development', 'requesting-code-review', 'verification-before-completion'],
        requiredMcps: ['gitnexus'],
    },
    {
        name: 'only-one-archive-cleanup',
        description: 'Sync and archive a completed OpenSpec change, safely clean current and stale AI worktrees and branches, then refresh GitNexus.',
        requiredSkills: [],
        requiredMcps: ['gitnexus'],
    },
    {
        name: 'only-one-implement-fast',
        description: 'Scope, optionally plan, implement, and proportionally verify a small or moderate task directly in the current workspace.',
        requiredSkills: [],
        requiredMcps: ['gitnexus'],
    },
];
