---
domain: workflow
version: 1.5.0
triggers:
  - ".agents/skills/only-one-*/**"
  - "assets/agents/skills/only-one-*/**"
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

### WF-008: Collapsible Hybrid Completion Report & Friction Check Gate
- **MUST_DO**: Present task completion in chat using the Collapsible Hybrid schema (2-line quantitative glance with status, files changed, tests passed, and core takeaway; collapsible `<details>` blocks for changed files and test outputs; and an interactive Friction Check prompt for `/only-one-evolve`) without extra disk files (`walkthrough.md`).
- **NEVER_DO**: Emit bloated ASCII directory trees, duplicate raw task lists, print obsolete "Next Steps" sections, or omit the interactive friction check question.
- **RATIONALE**: Minimizes cognitive overhead, eliminates token bloat in chat, and feeds actionable in-task friction notes into the automated skill evolution loop.

### WF-009: Dual-Engine Worktree Isolation & Rebase-First Guard
- **MUST_DO**: Execute branch implementations in isolated git worktrees (`.worktrees/<slug>`) with junction-synchronized dependencies, and verify against upstream using a Rebase-First Guard before merge.
- **NEVER_DO**: Perform multi-file destructive operations directly in the primary working tree without worktree isolation.
- **RATIONALE**: Protects the main working tree from unverified mutations and prevents downstream branch divergence.

### WF-010: Mermaid Subgraph and Node Lexer Shield
- **MUST_DO**: Quote all node and subgraph labels in double quotes (e.g. `subgraph Phase ["Title"]`), escape special characters, and replace `<` with `≤`.
- **NEVER_DO**: Use bare unquoted slashes after brackets (e.g. `[/only-one-idea]`) or unescaped angle brackets.
- **RATIONALE**: Bare bracket slashes trigger Mermaid trapezoid `TRAPSTART` lexer errors, and unescaped angle brackets break SVG rendering as unclosed HTML tags.

### WF-011: Pragmatic TDD Ordering Invariant
- **MUST_DO**: Position test task blocks strictly BEFORE companion implementation code blocks in Section 4 (`File Changes`), and enforce test verification per file pair in `/only-one-apply` with a 3-retry self-healing ceiling.
- **NEVER_DO**: Author code task blocks before their test blocks, or apply code changes without immediately executing companion fast test commands.
- **RATIONALE**: Guarantees test-driven rigor, prevents false-green regression, and stops cascading syntax/logic errors early.

### WF-012: Unified 4-Section Artifact Structure for Plan and Debug
- **MUST_DO**: Standardize `plan.md` and `debug.md` to 4 consecutive sections: Section 1 (Directory Structure & Diagnosis), Section 2 (Story Board & Reproduction Scenarios), Section 3 (Test Cases & Verification Matrix), Section 4 (File Changes & Git Diffs).
- **NEVER_DO**: Use fragmented section numbering (such as `Section 1.5`) or embed per-block `Fast Test Command` lines in Section 4 task blocks.
- **RATIONALE**: Ensures identical machine-parseable contracts across both feature planning and defect remediation workflows.

### WF-013: Centralized Improvement Staging for Skill Evolution
- **MUST_DO**: Stage skill improvement proposals targeting `only-one-*` in user-level central storage (`~/.only-one/improvements/<repo>/<slug>.md`) during `/only-one-clean`.
- **NEVER_DO**: Leave skill improvements trapped in local repository folders where `/only-one-evolve` cannot access them across projects.
- **RATIONALE**: Enables cross-project skill evolution and continuous refinement of developer agent tools.

### WF-014: Builder/Tester Separation and Red Feedback Loop Gate
- **MUST_DO**: Assign test authoring (`*.test.ts`) exclusively to `Track QA` (Tester) and implementation (`src/...`) to `Track Dev` (Coder) in multi-wave execution. During Red Feedback Loop, Coder MUST only edit implementation code, never tests, and retries MUST be capped at 3 (Circuit Breaker).
- **NEVER_DO**: Allow a single agent to author both implementation and verification tests for the same feature, or allow Coder agents to modify QA test files to force a green test.
- **RATIONALE**: Eliminates confirmation bias, prevents false-green regressions, and bounds retry loops against token exhaustion.

### WF-015: Single Source of Truth (SSOT) Plan Status Invariant
- **MUST_DO**: Restrict `plan.md` and `debug.md` task checkbox updates (`[x]`) exclusively to the primary Orchestrator agent.
- **NEVER_DO**: Permit delegated worker subagents (Coder, Tester, Scout) to directly mutate plan or debug task checkboxes.
- **RATIONALE**: Prevents concurrent file write race conditions and keeps execution DAG state deterministic.

### WF-016: Two-Tier Token Shield & Context Isolation for Code Reconnaissance
- **MUST_DO**: Delegate codebase scanning across > 2 files or AST queries to an isolated `codebase-scout` subagent using local `ast-grep`, returning only concise Technical Digests (signatures, line anchors, call sites, invariants).
- **NEVER_DO**: Read multi-file raw code into the primary orchestrator context or return monolithic function bodies (> 20 lines) from reconnaissance subagents.
- **RATIONALE**: Cuts context token usage by 75-85% and eliminates Lost-in-the-Middle degradation.

### WF-017: Zero-Raw-Dump Runtime Verification Digest
- **MUST_DO**: Isolate runtime verification (terminal, browser, API) in dedicated subagents (`terminal-runner`, `browser-tester`, `api-tester`), strip ANSI escape sequences, persist UI screenshots to disk, and return only structured Verification Digests.
- **NEVER_DO**: Stream raw terminal escape sequences, raw HTML/DOM trees, base64 image strings, or unbounded JSON payloads into the main orchestrator transcript.
- **RATIONALE**: Shields orchestrator context from token flooding and prevents context window exhaustion during integration testing.

