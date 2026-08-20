import type { WorkflowManifest } from '../types.js';

export const WORKFLOWS: WorkflowManifest[] = [
    {
        name: 'only-one-idea',
        description: 'Explore, refine, and validate rough ideas or vague requirements before creating an implementation plan.',
        requiredSkills: ['interview-me', 'idea-refine', 'spec-driven-development', 'c4-diagrams'],
    },
    {
        name: 'only-one-plan',
        description:
            'Research current code and create a focused implementation plan with design options, architecture, code examples, and test cases.',
        requiredSkills: [
            'c4-diagrams',
            'api-and-interface-design',
            'frontend-ui-engineering',
            'source-driven-development',
            'doubt-driven-development',
            'gherkin-authoring',
        ],
    },
    {
        name: 'only-one-apply',
        description: 'Implement tasks from an approved plan.md, working through each file change in order.',
        requiredSkills: [
            'context-engineering',
            'incremental-implementation',
            'code-simplification',
            'test-driven-development',
            'debugging-and-error-recovery',
        ],
    },
    {
        name: 'only-one-debug',
        description: 'Perform systematic Root Cause Analysis (RCA) and deliver a minimal verified fix for a bug.',
        requiredSkills: [
            'debugging-and-error-recovery',
            'doubt-driven-development',
            'test-driven-development',
            'code-simplification',
        ],
    },
    {
        name: 'only-one-review',
        description: 'Perform comprehensive code health, security, and performance review before opening a PR.',
        requiredSkills: [
            'code-review-and-quality',
            'code-simplification',
            'security-and-hardening',
            'performance-optimization',
        ],
    },
    {
        name: 'only-one-clockify',
        description: 'Validate and log Clockify tasks using only-one-clockify-skill and Clockify MCP.',
        requiredSkills: ['only-one-clockify-skill'],
        requiredMcps: ['clockify'],
    },
    {
        name: 'only-one-intranet',
        description: 'Validate, log Intranet timesheet entries, and output monthly summary using only-one-intranet-skill and zodinet-timesheet MCP.',
        requiredSkills: ['only-one-intranet-skill'],
        requiredMcps: ['zodinet-timesheet'],
    },
    {
        name: 'only-one-pr-git',
        description: 'Create or update a GitHub PR from current branch using only-one-pr-git-skill and GitHub MCP.',
        requiredSkills: ['only-one-pr-git-skill'],
        requiredMcps: ['github'],
    },
    {
        name: 'only-one-archive',
        description: 'Distill completed tasks into concise single-file archives, sync rules, and clean task folders.',
        requiredSkills: ['spec-driven-development', 'code-simplification', 'context-engineering'],
    },
    {
        name: 'only-one-clean',
        description: 'Consolidate related archives, verify deep logic against codebase, and purge stale documents.',
        requiredSkills: ['source-driven-development', 'doubt-driven-development', 'code-simplification'],
    },
];

