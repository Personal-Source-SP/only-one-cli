---
domain: workflow
version: 1.2.0
triggers:
  - ".agents/workflows/**"
  - "assets/workflows/**"
  - "only-one/tasks/**"
---

# Rules: SDLC Workflows & Execution Discipline

### WF-001: Strict Lifecycle Isolation
- **MUST_DO**: Restrict `/only-one-idea` to `concept.md` creation and `/only-one-debug` to diagnosis and `debug.md`.
- **NEVER_DO**: Modify source code, tests, or configs during scoping (`/only-one-idea`) or diagnosis (`/only-one-debug`).
- **RATIONALE**: Prevents premature, unverified code modifications before architectural alignment.

### WF-002: Strict Task Directory Invariant & Clean Slug Directory
- **MUST_DO**: Store task documents in `only-one/tasks/<slug>/` containing only `concept.md`, `plan.md` (or `debug.md`), and optional `improvements.md`. Store `created_at` in frontmatter.
- **NEVER_DO**: Prefix task directory names with timestamps or create separate walkthrough files on disk.
- **RATIONALE**: Keeps directory structure readable and permalinks stable across branch switches.

### WF-003: 80% ASD-STE100 Specification Standard
- **MUST_DO**: Write concise technical prose with instructions <= 20 words and descriptions <= 25 words in active voice.
- **NEVER_DO**: Use passive voice or verbose conversational fillers.
- **RATIONALE**: Maximizes token density and ensures machine-executable clarity.

### WF-004: Andrej Karpathy Disciplines
- **MUST_DO**: Think before coding, prioritize simplicity, make surgical changes, and verify with automated commands.
- **NEVER_DO**: Introduce speculative abstractions or modify lines outside the approved task scope.
- **RATIONALE**: Ensures minimal blast radius and goal-driven execution.

### WF-005: Visual-First Domain Modeling
- **MUST_DO**: Include clean Mermaid or ASCII diagrams for multi-step flows and multi-module interactions.
- **NEVER_DO**: Substitute monolithic prose paragraphs for structural flow diagrams.
- **RATIONALE**: Enables immediate comprehension of state transitions and module boundaries.

### WF-006: Disjoint File Invariant in Parallel Apply
- **MUST_DO**: Assign parallel subagents to completely distinct target files during `/only-one-apply`.
- **NEVER_DO**: Allow two concurrent subagents to edit the same file simultaneously.
- **RATIONALE**: Prevents file write race conditions and git conflict corruption.

### WF-007: In-Workflow Persona & Authority Over Separate Agent Folders
- **MUST_DO**: Declare agent personas, authorities, and role boundaries directly inside each workflow under `## Role & Collaboration Model` -> `### Assigned Persona & Authority`.
- **NEVER_DO**: Create unstandardized subdirectories (such as `.agents/agents/` or `assets/agents/`) outside standard Antigravity customization roots (`workflows`, `skills`, `rules`, `plugins`).
- **RATIONALE**: Antigravity does not recognize `.agents/agents/`, risking discovery failure and maintenance fragmentation.

### WF-008: Crisp Completion Report Format in Chat
- **MUST_DO**: Present the final completion report in chat using the 4 crisp sections (Source Structure Changes, Work Processed, Acceptance & Tests, Next Steps) with zero extra disk files (`walkthrough.md`).
- **NEVER_DO**: Emit verbose per-file descriptions, raw unformatted diffs, or loose unstandardized chat summaries upon task completion.
- **RATIONALE**: Standardizes scanning speed, keeps context token-efficient, and guarantees instantaneous reviewer comprehension.

### WF-009: Dual-Engine Worktree Isolation & Rebase-First Guard
- **MUST_DO**: Execute branch implementations in isolated git worktrees (`.worktrees/<slug>`) with junction-synchronized dependencies, and verify against upstream using a Rebase-First Guard before merge.
- **NEVER_DO**: Perform multi-file destructive operations directly in the primary working tree without worktree isolation.
- **RATIONALE**: Protects the main working tree from unverified mutations and prevents downstream branch divergence.

