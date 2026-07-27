import type { SkillManifest } from '../types.js';

export const SKILLS: SkillManifest[] = [
    {
        name: 'c4-diagrams',
        description: 'Use when explaining existing code architecture, visualizing a new system.',
    },
    {
        name: 'gherkin-authoring',
        description: 'Use when drafting, reviewing, or improving Gherkin scenarios.',
    },
    {
        name: 'grill-me',
        description: 'Interview the user relentlessly about a plan or design.',
    },
    {
        name: 'only-one-clockify-skill',
        description: 'Validate and log Clockify time entries from task lines.',
        associatedWorkflows: ['only-one-clockify'],
    },
    {
        name: 'only-one-pr-git-skill',
        description: 'Create or update a GitHub Pull Request from the current branch.',
        associatedWorkflows: ['only-one-pr-git'],
    },
    {
        name: 'only-one-gitnexus-freshness',
        description: 'Apply GitNexus freshness gates — verify index currency, sync/reindex when stale, enforce preflight scope and public/shared boundary gates.',
        associatedWorkflows: ['only-one-implement-be', 'only-one-implement-fe'],
    },
    {
        name: 'only-one-worktree-handoff',
        description: 'Set up and tear down a single feature worktree for an OpenSpec change, then perform unstaged local handoff via squash merge and git reset.',
        associatedWorkflows: ['only-one-implement-be', 'only-one-implement-fe'],
    },
    {
        name: 'only-one-openspec-apply-gate',
        description: 'Resolve, apply, and validate an OpenSpec change before implementation. Reads contextFiles, verifies required plan artifacts, and enforces stop conditions.',
        associatedWorkflows: ['only-one-implement-be', 'only-one-implement-fe'],
    },
    {
        name: 'only-one-bounded-discovery',
        description: 'Perform bounded codebase discovery using GitNexus within a 2-5% scope budget. Produces a blast-radius allowlist. Supports BE and FE variants.',
        associatedWorkflows: ['only-one-plan-be', 'only-one-plan-fe'],
    },
    {
        name: 'only-one-canonical-ref-gate',
        description: 'Validate and read the --ref canonical reference input, summarize its structure, and establish it as the immutable planning anchor for FE changes.',
        associatedWorkflows: ['only-one-plan-fe'],
    },
    {
        name: 'only-one-component-inventory',
        description: 'Build a component and design system inventory, then apply and enforce the reuse-first rule ([USE]/[EXTEND]/[NEW]) for every component decision in FE changes.',
        associatedWorkflows: ['only-one-plan-fe', 'only-one-implement-fe'],
    },
    {
        name: 'only-one-ui-design-direction',
        description: 'Lead the UI design phase: brainstorm, map UI state, evaluate with ux-ui-max, and produce the approved directory structure plan before OpenSpec authoring.',
        associatedWorkflows: ['only-one-plan-fe'],
    },
];

