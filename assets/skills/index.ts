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
    },
    {
        name: 'only-one-openspec-apply-gate',
        description: 'Resolve, apply, and validate an OpenSpec change before implementation. Reads contextFiles, verifies required plan artifacts, and enforces stop conditions.',
    },
    {
        name: 'only-one-bounded-discovery',
        description: 'Perform bounded codebase discovery using GitNexus within a 2-5% scope budget. Produces a blast-radius allowlist. Supports BE and FE variants.',
    },
    {
        name: 'only-one-openspec-phase-planning',
        description: 'Use when planning OpenSpec changes with approval-gated phases and implementation-ready tasks.',
    },
    {
        name: 'only-one-phase-implementation-loop',
        description: 'Use when implementing approved OpenSpec phases with task tracking, verification, user review, and feedback rework.',
    },
    {
        name: 'only-one-canonical-ref-gate',
        description: 'Validate and read the --ref canonical reference input, summarize its structure, and establish it as the immutable planning anchor for FE changes.',
    },
    {
        name: 'only-one-component-inventory',
        description: 'Build a component and design system inventory, then apply and enforce the reuse-first rule ([USE]/[EXTEND]/[NEW]) for every component decision in FE changes.',
    },
    {
        name: 'only-one-ui-design-direction',
        description: 'Lead the UI design phase: brainstorm, map UI state, evaluate with ux-ui-max, and produce the approved directory structure plan before OpenSpec authoring.',
    },
];

