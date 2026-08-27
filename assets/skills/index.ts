import type { SkillManifest } from '../types.js';

export const SKILLS: SkillManifest[] = [
    // --- 1. Define Phase: Discovery, Grilling & Domain Modeling ---
    {
        name: 'grill-with-docs',
        description: 'Conduct a grilling session that sharpens domain terminology and updates CONTEXT.md and ADRs inline.',
        source: 'mattpocock/skills',
        sourceType: 'github',
        skillPath: 'skills/engineering/grill-with-docs/SKILL.md',
    },
    {
        name: 'grill-me',
        description: 'Interview the user relentlessly about a plan or design until reaching shared understanding (zero file footprint).',
        source: 'mattpocock/skills',
        sourceType: 'github',
        skillPath: 'skills/productivity/grill-me/SKILL.md',
    },
    {
        name: 'interview-me',
        description: 'Conduct a one-question-at-a-time interview extracting root needs until ~95% confidence.',
        source: 'addyosmani/agent-skills',
        sourceType: 'github',
        skillPath: 'skills/interview-me/SKILL.md',
    },
    {
        name: 'idea-refine',
        description: 'Refine rough ideas and establish strict In-Scope vs Explicit Out-of-Scope boundaries.',
        source: 'addyosmani/agent-skills',
        sourceType: 'github',
        skillPath: 'skills/idea-refine/SKILL.md',
    },
    {
        name: 'domain-modeling',
        description: 'Actively build and sharpen domain models, challenge glossary terms, and maintain CONTEXT.md.',
        source: 'mattpocock/skills',
        sourceType: 'github',
        skillPath: 'skills/engineering/domain-modeling/SKILL.md',
    },
    {
        name: 'wait-what',
        description: 'Re-pitch complex explanations in plain English using the project domain glossary.',
        source: 'mattpocock/skills',
        sourceType: 'github',
        skillPath: 'skills/productivity/wait-what/SKILL.md',
    },

    // --- 2. Plan Phase: Architecture, Contracts & Task Graph ---
    {
        name: 'to-tickets',
        description: 'Break plan into tracer-bullet tickets with explicit dependency blocking edges.',
        source: 'mattpocock/skills',
        sourceType: 'github',
        skillPath: 'skills/engineering/to-tickets/SKILL.md',
    },
    {
        name: 'codebase-design',
        description: 'Design deep modules with small interfaces at clean seams, testable through that interface.',
        source: 'mattpocock/skills',
        sourceType: 'github',
        skillPath: 'skills/engineering/codebase-design/SKILL.md',
    },
    {
        name: 'api-and-interface-design',
        description: 'Contract-first design, Hyrum\'s Law, error semantics, and boundary validation.',
        source: 'addyosmani/agent-skills',
        sourceType: 'github',
        skillPath: 'skills/api-and-interface-design/SKILL.md',
    },
    {
        name: 'doubt-driven-development',
        description: 'Stress-test high-stakes design choices via CLAIM -> DOUBT -> RECONCILE loops.',
        source: 'addyosmani/agent-skills',
        sourceType: 'github',
        skillPath: 'skills/doubt-driven-development/SKILL.md',
    },
    {
        name: 'c4-diagrams',
        description: 'Architecture diagrams in C4/Mermaid.',
        sourceType: 'local',
    },
    {
        name: 'gherkin-authoring',
        description: 'Draft BDD Gherkin acceptance scenarios for success metrics verification.',
        sourceType: 'local',
    },

    // --- 3. Build Phase: Incremental Implementation & Safety ---
    {
        name: 'incremental-implementation',
        description: 'Implement thin vertical slices with safe defaults and rollback-friendly commits.',
        source: 'addyosmani/agent-skills',
        sourceType: 'github',
        skillPath: 'skills/incremental-implementation/SKILL.md',
    },
    {
        name: 'test-driven-development',
        description: 'Beyoncé Rule, Red-Green-Refactor loop, DAMP tests, and regression guards.',
        source: 'addyosmani/agent-skills',
        sourceType: 'github',
        skillPath: 'skills/test-driven-development/SKILL.md',
    },
    {
        name: 'context-engineering',
        description: 'Feed agents high-signal minimal context, negative rules, and tech skills.',
        source: 'addyosmani/agent-skills',
        sourceType: 'github',
        skillPath: 'skills/context-engineering/SKILL.md',
    },
    {
        name: 'prototype',
        description: 'Build a throwaway prototype to answer an uncertain design or UI question.',
        source: 'mattpocock/skills',
        sourceType: 'github',
        skillPath: 'skills/engineering/prototype/SKILL.md',
    },
    {
        name: 'wizard',
        description: 'Generate interactive bash wizard for steps only humans can perform.',
        source: 'mattpocock/skills',
        sourceType: 'github',
        skillPath: 'skills/engineering/wizard/SKILL.md',
    },

    // --- 4. Verify & Debug Phase: RCA & Recovery ---
    {
        name: 'diagnosing-bugs',
        description: 'Disciplined diagnosis loop: build red test loop -> minimize -> hypothesize -> fix.',
        source: 'mattpocock/skills',
        sourceType: 'github',
        skillPath: 'skills/engineering/diagnosing-bugs/SKILL.md',
    },
    {
        name: 'resolving-merge-conflicts',
        description: 'Resolve git merge/rebase conflicts hunk by hunk based on intent.',
        source: 'mattpocock/skills',
        sourceType: 'github',
        skillPath: 'skills/engineering/resolving-merge-conflicts/SKILL.md',
    },
    {
        name: 'handoff',
        description: 'Compact current conversation state into a seamless handoff document.',
        source: 'mattpocock/skills',
        sourceType: 'github',
        skillPath: 'skills/productivity/handoff/SKILL.md',
    },

    // --- 5. Review & Quality Gates Phase ---
    {
        name: 'code-review-and-quality',
        description: '5-axis code review, change sizing (~100 lines), and PR quality gating.',
        source: 'addyosmani/agent-skills',
        sourceType: 'github',
        skillPath: 'skills/code-review-and-quality/SKILL.md',
    },
    {
        name: 'code-simplification',
        description: 'Chesterton\'s Fence, Rule of 500, eliminate dead code and speculative wrappers.',
        source: 'addyosmani/agent-skills',
        sourceType: 'github',
        skillPath: 'skills/code-simplification/SKILL.md',
    },
    {
        name: 'security-and-hardening',
        description: 'OWASP Top 10 prevention, auth guards, secrets audit, and 3-tier boundary validation.',
        source: 'addyosmani/agent-skills',
        sourceType: 'github',
        skillPath: 'skills/security-and-hardening/SKILL.md',
    },
    {
        name: 'performance-optimization',
        description: 'Core Web Vitals, N+1 database queries, bundle budgets, and memoization.',
        source: 'addyosmani/agent-skills',
        sourceType: 'github',
        skillPath: 'skills/performance-optimization/SKILL.md',
    },

    // --- 6. Local Project Specific Skills ---
    {
        name: 'only-one-nestjs-development',
        description: 'Use for NestJS development with selectively loaded architecture references.',
        sourceType: 'local',
    },
    {
        name: 'only-one-nextjs-development',
        description: 'Use for Next.js and React development with selectively loaded references.',
        sourceType: 'local',
    },
    {
        name: 'only-one-clockify-skill',
        description: 'Validate and log Clockify time entries from task lines.',
        sourceType: 'local',
    },
    {
        name: 'only-one-intranet-skill',
        description: 'Validate and log Intranet timesheet entries from task lines using zodinet-timesheet MCP.',
        sourceType: 'local',
    },
    {
        name: 'only-one-pr-git-skill',
        description: 'Create or update a GitHub Pull Request from current branch.',
        sourceType: 'local',
    },
];
