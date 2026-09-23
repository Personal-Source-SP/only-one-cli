import type { WorkflowManifest } from '../types.js';

export const WORKFLOWS: WorkflowManifest[] = [
    {
        name: 'only-one-idea',
        version: '0.0.6',
        description:
            'Clarify business problems, define strict scope boundaries, build domain models, update CONTEXT.md & ADRs, and produce a lean concept.md specification.',
        requiredSkills: [
            'i-have-adhd',
            'grill-with-docs',
            'grill-me',
            'domain-modeling',
            'interview-me',
            'idea-refine',
            'wait-what',
            'ponytail',
        ],
    },
    {
        name: 'only-one-plan',
        version: '0.0.9',
        description:
            'Research current code and create a focused, diff-centric implementation plan with Directory Structure, machine-readable File Changes, Unified Diffs, and Verification.',
        requiredSkills: [
            'i-have-adhd',
            'to-tickets',
            'codebase-design',
            'grill-me',
            'c4-diagrams',
            'api-and-interface-design',
            'frontend-ui-engineering',
            'source-driven-development',
            'doubt-driven-development',
            'ponytail',
        ],
    },
    {
        name: 'only-one-apply',
        version: '0.0.9',
        description:
            'Implement tasks from an approved plan.md or debug.md by parsing machine-readable file task blocks and applying changes in dependency order.',
        requiredSkills: [
            'i-have-adhd',
            'context-engineering',
            'incremental-implementation',
            'code-simplification',
            'test-driven-development',
            'diagnosing-bugs',
            'ponytail',
        ],
    },
    {
        name: 'only-one-debug',
        version: '0.0.7',
        description:
            'Perform systematic RCA in a three-section debug.md and formulate executable file-centric patch blocks with a red feedback loop.',
        requiredSkills: [
            'i-have-adhd',
            'diagnosing-bugs',
            'doubt-driven-development',
            'test-driven-development',
            'code-simplification',
            'ponytail',
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
        name: 'only-one-clean',
        version: '0.0.4',
        description:
            'Consolidate related archives, verify deep logic against codebase, and purge stale documents.',
        requiredSkills: [
            'task-lifecycle-resolution',
            'context-engineering',
            'source-driven-development',
            'doubt-driven-development',
            'code-simplification',
        ],
    },
    {
        name: 'only-one-flash',
        version: '0.0.6',
        description:
            'Execute small, rapid tasks with zero disk plan footprint, compact in-chat File Changes, a user confirmation review gate, and fast verification.',
        requiredSkills: [
            'i-have-adhd',
            'context-engineering',
            'incremental-implementation',
            'code-simplification',
            'test-driven-development',
            'diagnosing-bugs',
            'ponytail',
        ],
    },
];

