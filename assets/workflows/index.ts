import type { WorkflowManifest } from '../types.js';

export const WORKFLOWS: WorkflowManifest[] = [
    {
        name: 'only-one-idea',
        version: '0.0.2',
        description:
            'Clarify business problems, define strict scope boundaries, build domain models, update CONTEXT.md & ADRs, and produce a lean concept.md specification.',
        requiredSkills: [
            'grill-with-docs',
            'grill-me',
            'domain-modeling',
            'interview-me',
            'idea-refine',
            'wait-what',
            'conversational-english-coaching',
            'english-learning-extraction',
        ],
    },
    {
        name: 'only-one-plan',
        version: '0.0.2',
        description:
            'Research current code and create a focused, diff-centric implementation plan with Current State, Detailed Design, Task Matrix, Unified Diffs, and Verification.',
        requiredSkills: [
            'to-tickets',
            'codebase-design',
            'grill-me',
            'c4-diagrams',
            'api-and-interface-design',
            'frontend-ui-engineering',
            'source-driven-development',
            'doubt-driven-development',
            'conversational-english-coaching',
        ],
    },
    {
        name: 'only-one-apply',
        version: '0.0.2',
        description:
            'Implement tasks from an approved plan.md by parsing the Machine-Readable Task Matrix and applying changes in dependency order.',
        requiredSkills: [
            'context-engineering',
            'incremental-implementation',
            'code-simplification',
            'test-driven-development',
            'diagnosing-bugs',
        ],
    },
    {
        name: 'only-one-debug',
        version: '0.0.1',
        description:
            'Perform systematic Root Cause Analysis (RCA) and deliver a minimal verified fix using disciplined red feedback loops.',
        requiredSkills: [
            'diagnosing-bugs',
            'doubt-driven-development',
            'test-driven-development',
            'code-simplification',
        ],
    },
    {
        name: 'only-one-review',
        version: '0.0.1',
        description:
            'Perform comprehensive 5-axis code health, security, simplicity, and performance review using dual-perspective audit.',
        requiredSkills: [
            'code-review-and-quality',
            'code-simplification',
            'security-and-hardening',
            'performance-optimization',
        ],
    },
    {
        name: 'only-one-handoff',
        version: '0.0.1',
        description:
            'Compact current conversation and task state into a seamless handoff document for agent switching or context refreshment.',
        requiredSkills: ['handoff'],
    },
    {
        name: 'only-one-conflict',
        version: '0.0.1',
        description:
            'Resolve in-progress git merge or rebase conflicts hunk by hunk based on intent without aborting.',
        requiredSkills: ['resolving-merge-conflicts'],
    },
    {
        name: 'only-one-clockify',
        version: '0.0.1',
        description: 'Validate and log Clockify tasks using only-one-clockify-skill and Clockify MCP.',
        requiredSkills: ['only-one-clockify-skill'],
        requiredMcps: ['clockify'],
    },
    {
        name: 'only-one-intranet',
        version: '0.0.1',
        description:
            'Validate, log Intranet timesheet entries, and output monthly summary using only-one-intranet-skill and zodinet-timesheet MCP.',
        requiredSkills: ['only-one-intranet-skill'],
        requiredMcps: ['zodinet-timesheet'],
    },
    {
        name: 'only-one-pr-git',
        version: '0.0.1',
        description:
            'Create or update a GitHub PR from current branch with mandatory 5-axis pre-review quality gate using GitHub MCP.',
        requiredSkills: ['only-one-pr-git-skill'],
        requiredMcps: ['github'],
    },
    {
        name: 'only-one-archive',
        version: '0.0.1',
        description:
            'Distill completed tasks into concise single-file archives, sync rules, extract technical English notes, and clean task folders.',
        requiredSkills: ['handoff', 'code-simplification', 'context-engineering', 'english-learning-extraction'],
    },
    {
        name: 'only-one-clean',
        version: '0.0.1',
        description:
            'Consolidate related archives, verify deep logic against codebase, and purge stale documents.',
        requiredSkills: [
            'task-lifecycle-resolution',
            'source-driven-development',
            'doubt-driven-development',
            'code-simplification',
        ],
    },
];
