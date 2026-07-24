---
alwaysApply: true
---

# 01 - CONTEXT MINIMIZATION & TOOLING

## 1. Targeted Discovery, Not Blind Scanning

- NEVER perform an unbounded recursive scan without a concrete query and a scoped path.
- Start with the narrowest relevant directory and file patterns; expand only when results show the current scope is insufficient.
- Repository-wide exact-symbol searches are allowed when required to establish complete usage, compatibility, or removal safety.
- BEFORE any broad code discovery or multi-file change, **GitNexus MUST be used** to query symbol dependencies and determine blast radius. This is not optional.
- For explicit, isolated files or trivial edits (typos, comments, config), inspect the provided file directly — GitNexus is not required.
- **IF GitNexus is unavailable, stale, or returns no results:**
    1. State this explicitly to the user before proceeding.
    2. Fall back to targeted `grep`/symbol searches scoped to the narrowest relevant directory.
    3. Manually trace direct imports and exports from the entry point files.
    4. Treat blast radius as **unknown** — flag any file outside the directly confirmed scope as potentially affected.
    5. For high-risk changes (deletions, renames, contract changes): **stop and ask the user** whether to proceed without full dependency data.

## 2. Specification & Flow Boundaries

- Formal specs or design documents (e.g., OpenSpec or design proposals) are OPTIONAL.
- IF a formal spec exists:
    - Keep behavior and deliverables strictly within its defined scope.
    - Supporting changes required for correctness — tests, exports, migrations, type declarations, compatibility — are in scope when they do not expand product scope.
    - If the spec conflicts with active code or required behavior, **stop and surface the discrepancy** before proceeding.
- IF NO formal spec exists:
    - For trivial, localized, and reversible changes: derive scope directly from the request and proceed.
    - For ambiguous, multi-file, architectural, destructive, or contract-changing work: establish and confirm a flow description or implementation plan before modifying files.
- Do NOT infer business contracts from a single implementation alone.
    - Validate against available specs, API schemas, database constraints, tests, call sites, user-provided requirements, and runtime configuration.
    - If authoritative sources disagree or remain incomplete, state the ambiguity and ask for clarification before changing externally visible behavior.

## 3. Scope Control & Supporting Changes

- Do NOT modify files unrelated to the requested behavior.
- Required supporting files are **in scope** when directly caused by the approved change:
    - tests, type declarations, exports, index barrels, generated artifacts, snapshots, migrations, lockfiles.
- Disclose unexpected or broad supporting changes **before** applying them; get approval if they cross into new product scope.
- Do NOT edit files outside the confirmed flow/scope without explicit user approval.

## 4. Sub-task Isolation & Minimal Context

- For each sub-task, load only:
    - the target implementation files,
    - their direct dependencies and reverse dependencies (callers),
    - relevant tests, fixtures, contracts, and runtime wiring needed to understand and verify the change.
- IF explicit file paths are provided, use them as initial entry points.
    - Expand through direct dependencies, callers, tests, runtime registrations, configuration, and data contracts — only as needed by the task.
    - Include runtime wiring, dependency injection, event producers/consumers, dynamic imports, routes, and schemas when the task scope requires it.
- Prefer direct relationships first; expand when evidence indicates indirect impact.
- Keep agent working context clear, focused, and free of irrelevant codebase files.
