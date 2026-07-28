---
description: Clarify, plan, approve, implement, and verify a bounded change in current workspace.
---

## Input

```text
/only-one-implement-fast <task description>
```

## Purpose

Use for a bounded UI or logic change that does not need an OpenSpec change. Always clarify unknown decisions, always create an IDE plan, and implement only after explicit user approval.

## Location and boundaries

1. Work only in current project workspace and current Git branch.
2. Do not run `git worktree`, create/switch/delete worktrees, delegate to subagents, create commits, or invoke OpenSpec.
3. Use only IDE default `implementation_plan.md` artifact and its approval flow. Do not create separate task files.
4. Preserve unrelated working-tree changes.

## 1. Clarify first

1. Determine requested observable result before discovery or planning.
2. Ask focused questions before proceeding when profile, behavior, UI outcome, affected area, API/compatibility, constraints, acceptance, or verification is unknown.
3. Never infer product, UI, API, compatibility, or migration decisions.
4. Invoke `grill-me` whenever any implementation decision remains uncertain. Ask one question at a time and provide recommended answer.
5. State confirmed facts separately from unanswered questions. Stop until answers resolve decisions that change scope or implementation.

## 2. Discover and bound scope

2. If unavailable or stale, report exact limitation and ask whether direct source search is acceptable. Do not claim complete impact coverage.
3. Inspect targeted source for symbols, callers, dependencies, routes, and likely tests.
4. Identify shared contracts, public APIs, schema/migrations, configuration, authorization, and broad shared modules. Keep unrelated refactors out of scope.

## 3. Always plan and wait for approval

1. Always create or update the IDE default `implementation_plan.md` artifact.
2. Plan must contain:
    - **Work description**: requested change and confirmed observable result.
    - **Why**: user problem or value.
    - **Profile**: `FE` or `BE`; ask if not clear.
    - **Scope and non-goals**: approved files/symbols and exclusions.
    - **Risks and decisions**: contracts, compatibility, migrations, UI/accessibility, or unknowns.
    - **Verification**: commands, tests, browser/manual evidence, and final impact check.
3. Organize work into dependency-ordered phases. Every phase has goal, acceptance requirements, and verification.
4. Request feedback on plan. Wait for explicit user approval before modifying source.

## 4. Tagged task contract

Every task uses checkbox format and declares Files/tags, Allowed scope, Dependencies and constraints, Acceptance requirements, and Verification:

```md
- [ ] 1.1 Task description
    - **Files:** `path` `[TAG]`
    - **Allowed scope:** bounded files and sections only
    - **Dependencies and constraints:** ownership, contracts, reuse, compatibility
    - **Acceptance requirements:** observable outcome
    - **Verification:** tests, commands, or browser/manual evidence
```

Choose profile tags exactly:

- **FE:** `[NEW]`, `[MODIFY]`, `[DELETE]`, `[TEST]`, `[WIRE]`, `[EXISTING]`.
- **BE:** `[NEW]`, `[MODIFY]`, `[DELETE]`, `[TEST]`, `[MIGRATE]`, `[WIRE]`.
- `[EXISTING]` is reference/reuse only. Do not modify it; stop and update plan if modification becomes needed.
- `[MIGRATE]` creates or modifies a migration only. Do not execute migration apply/up/run, revert/down, schema sync, seeds, or backfills without separate explicit approval.

## 5. Implement after approval

1. Apply only approved task scope and tags. Recheck targeted source before impact-dependent decisions after source changes.
2. Preserve comments, naming, architecture, design tokens, components, accessibility, responsive patterns, i18n, and public behavior unless plan approves change.
3. Do not introduce dependency, environment, configuration, public contract, database mutation, or unrelated abstraction without explicit approval.
4. If discovery or implementation expands scope, conflicts with plan, or violates tag contract, stop. Update plan and request approval again.
5. Tick a task only after its declared acceptance requirements and verification pass.

## 6. Verify and report

1. Run every declared verification. Run relevant focused tests, typecheck/lint when available, and focused browser/manual checks for UI states when applicable.
2. Do not weaken valid tests merely to pass checks. Report unavailable checks, blockers, and exact manual verification.
3. Inspect targeted source before final impact analysis. Stop and re-plan if impact reaches unapproved public/shared surfaces.
4. Report changed files/symbols, completed task checkboxes, observable behavior, verification evidence/results, final impact, remaining risks, and checks not run.
5. Do not create a git commit.
