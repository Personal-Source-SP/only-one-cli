import type { SkillManifest } from '../types.js';

export const SKILLS: SkillManifest[] = [
    // --- 1. Define Phase Skills (Clarify what to build) ---
    {
        name: 'interview-me',
        description: 'Conduct a one-question-at-a-time interview extracting root needs until ~95% confidence.',
        source: 'addyosmani/agent-skills',
        sourceType: 'github',
        skillPath: 'skills/interview-me/SKILL.md',
    },
    {
        name: 'idea-refine',
        description: 'Refine rough ideas through structured divergent and convergent thinking.',
        source: 'addyosmani/agent-skills',
        sourceType: 'github',
        skillPath: 'skills/idea-refine/SKILL.md',
    },
    {
        name: 'spec-driven-development',
        description: 'Author comprehensive technical specifications and PRDs before writing any code.',
        source: 'addyosmani/agent-skills',
        sourceType: 'github',
        skillPath: 'skills/spec-driven-development/SKILL.md',
    },
    {
        name: 'grill-me',
        description: 'Interview the user relentlessly about a plan or design until reaching shared understanding.',
        source: 'mattpocock/skills',
        sourceType: 'github',
        skillPath: 'skills/productivity/grill-me/SKILL.md',
    },

    // --- 2. Architecture & Design Skills (Structure, Interfaces, and Contracts) ---
    {
        name: 'c4-diagrams',
        description: 'Use when explaining existing code architecture, visualizing a new system, or creating C4-style diagrams in ASCII/Mermaid.',
        source: 'bdfinst/agentic-dev-team',
        sourceType: 'github',
        skillPath: '.agents/skills/c4-diagrams/SKILL.md',
    },
    {
        name: 'api-and-interface-design',
        description: 'Design robust, ergonomic REST/GraphQL APIs, DTOs, and boundary validation.',
        source: 'addyosmani/agent-skills',
        sourceType: 'github',
        skillPath: 'skills/api-and-interface-design/SKILL.md',
    },
    {
        name: 'frontend-ui-engineering',
        description: 'Component architecture, design systems, 5-state matrix, and WCAG accessibility.',
        source: 'addyosmani/agent-skills',
        sourceType: 'github',
        skillPath: 'skills/frontend-ui-engineering/SKILL.md',
    },
    {
        name: 'source-driven-development',
        description: 'Enforce source-verified APIs and grounded documentation.',
        source: 'addyosmani/agent-skills',
        sourceType: 'github',
        skillPath: 'skills/source-driven-development/SKILL.md',
    },
    {
        name: 'doubt-driven-development',
        description: 'Stress-test code designs by questioning assumptions and identifying edge cases.',
        source: 'addyosmani/agent-skills',
        sourceType: 'github',
        skillPath: 'skills/doubt-driven-development/SKILL.md',
    },
    {
        name: 'gherkin-authoring',
        description: 'Use when drafting, reviewing, or improving Gherkin BDD scenarios.',
        source: 'bdfinst/agentic-dev-team',
        sourceType: 'github',
        skillPath: '.agents/skills/gherkin-authoring/SKILL.md',
    },

    // --- 3. Build & Implementation Skills (Write the code) ---
    {
        name: 'context-engineering',
        description: 'Feed agents high-signal minimal context, negative rules, and tech skills.',
        source: 'addyosmani/agent-skills',
        sourceType: 'github',
        skillPath: 'skills/context-engineering/SKILL.md',
    },
    {
        name: 'incremental-implementation',
        description: 'Implement thin vertical slices with safe defaults and rollback-friendly changes.',
        source: 'addyosmani/agent-skills',
        sourceType: 'github',
        skillPath: 'skills/incremental-implementation/SKILL.md',
    },
    {
        name: 'test-driven-development',
        description: 'Enforce Beyoncé Rule, Red-Green-Refactor, DAMP tests, and regression guards.',
        source: 'addyosmani/agent-skills',
        sourceType: 'github',
        skillPath: 'skills/test-driven-development/SKILL.md',
    },
    {
        name: 'debugging-and-error-recovery',
        description: 'Perform systematic 5-step Root Cause Analysis for bugs and failures.',
        source: 'addyosmani/agent-skills',
        sourceType: 'github',
        skillPath: 'skills/debugging-and-error-recovery/SKILL.md',
    },

    // --- 4. Review & Quality Gates Skills (Audit before merge) ---
    {
        name: 'code-review-and-quality',
        description: 'Perform 5-axis code review, change sizing evaluation, and PR quality gating.',
        source: 'addyosmani/agent-skills',
        sourceType: 'github',
        skillPath: 'skills/code-review-and-quality/SKILL.md',
    },
    {
        name: 'code-simplification',
        description: 'Simplify code, apply Chesterton Fence and Rule of 500, eliminate dead code.',
        source: 'addyosmani/agent-skills',
        sourceType: 'github',
        skillPath: 'skills/code-simplification/SKILL.md',
    },
    {
        name: 'security-and-hardening',
        description: 'Audit code for OWASP Top 10, auth patterns, secrets, and 3-tier boundary validation.',
        source: 'addyosmani/agent-skills',
        sourceType: 'github',
        skillPath: 'skills/security-and-hardening/SKILL.md',
    },
    {
        name: 'performance-optimization',
        description: 'Optimize web performance, Core Web Vitals, N+1 query detection, and caching.',
        source: 'addyosmani/agent-skills',
        sourceType: 'github',
        skillPath: 'skills/performance-optimization/SKILL.md',
    },

    // --- 5. Local Custom Only-One Skills ---
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
        description: 'Validate and log Intranet timesheet entries from task lines using the zodinet-timesheet MCP.',
        sourceType: 'local',
    },
    {
        name: 'only-one-pr-git-skill',
        description: 'Create or update a GitHub Pull Request from the current branch.',
        sourceType: 'local',
    },
];

