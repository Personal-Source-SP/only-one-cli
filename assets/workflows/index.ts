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
        description: 'Plan and design a frontend feature for a Next.js/React repository, covering discovery, UI direction, implementation guidelines, and an approved micro-task plan.',
        requiredSkills: ['ux-ui-max', 'next-cache-components-adoption', 'next-partial-prefetching-adoption'],
        requiredMcps: ['gitnexus'],
    },
    {
        name: 'only-one-plan-be',
        description: 'Plan a backend feature for a NestJS repository, covering schema analysis, API contract design, and an approved micro-task plan.',
        requiredSkills: [],
        requiredMcps: ['gitnexus'],
    },
    {
        name: 'only-one-implement-fe',
        description: 'Execute an approved frontend plan (Next.js/React) directly with plan-local task tracking, mandatory TDD, review, and integration verification.',
        requiredSkills: ['ux-ui-max', 'next-cache-components-adoption', 'next-partial-prefetching-adoption', 'test-driven-development', 'requesting-code-review', 'verification-before-completion'],
        requiredMcps: ['gitnexus'],
    },
    {
        name: 'only-one-implement-be',
        description: 'Execute an approved backend plan (NestJS) directly with plan-local task tracking, mandatory TDD, review, and integration verification.',
        requiredSkills: ['test-driven-development', 'requesting-code-review', 'verification-before-completion'],
        requiredMcps: ['gitnexus'],
    },
    {
        name: 'only-one-implement-fast',
        description: 'Scope, implement, and verify a simple low-risk task directly — no subagent delegation, no written plan, no large skill requirements.',
        requiredSkills: [],
        requiredMcps: [],
    },
];
