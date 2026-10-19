---
domain: workflow
version: 1.0.0
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

### WF-002: Strict Two-File Task Invariant & Clean Slug Directory
- **MUST_DO**: Store task documents in `only-one/tasks/<slug>/` containing only `concept.md` and `plan.md` (or `debug.md`). Store `created_at` in frontmatter.
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
