---
description: Scope, implement, and verify a small or moderate task directly in the current workspace, using GitNexus for fast discovery and the IDE plan only when approval is needed.
---

## Input

```text
/only-one-implement-fast <task description>
```

## Purpose

Use this workflow for UI changes and straightforward logic changes that do not justify OpenSpec, Superpowers, worktrees, subagent orchestration, mandatory TDD, or a separate planning workflow.

Keep discovery, optional approval, implementation, and verification in this workflow.

## Execution location and prohibited workflows

1. Work only in the current project workspace and current Git branch.
2. Do not invoke `using-git-worktrees`.
3. Do not run `git worktree` commands or create, switch to, or delete any worktree.
4. Do not invoke OpenSpec or Superpowers skills or workflows.
5. Do not delegate implementation to subagents.
6. Do not create design specs, OpenSpec artifacts, Superpowers documents, or separate task files.
7. Do not create git commits.
8. A plan, when required, must use only the IDE's default `implementation_plan.md` artifact and approval flow.

## Dependency preflight

1. Check MCP `gitnexus` before codebase discovery.
2. Verify its index covers the current repository, checked-out branch, and current working-tree revision and is not `stale` or `incomplete`.
3. If the index is stale or incomplete, sync/reindex it using available GitNexus tooling, then repeat the query.
4. If GitNexus is unavailable or cannot be refreshed, report the exact limitation and ask whether to continue with direct code search. Do not silently replace it or claim complete impact coverage.

## Clarification gate

1. Determine the requested observable result before editing.
2. If behavior, UI outcome, affected area, or acceptance criteria are unclear, ask focused questions before planning or editing.
3. Ask only questions that affect implementation. Do not start a brainstorming, specification, or design-document workflow.
4. If UI details are sufficiently clear from the request and existing project patterns, proceed without additional design ceremony.

## Discovery and scope

1. Use GitNexus first to locate relevant symbols, callers, dependencies, routes, and likely tests.
2. Verify findings against current source files before relying on them.
3. State the intended change, expected observable result, affected files or symbols, and verification approach.
4. Confirm whether the change affects shared contracts, public APIs, database schema, migrations, configuration, authentication boundaries, or broad shared modules.
5. Keep changes focused. Do not include unrelated refactoring.

## Planning and approval gate

### Direct execution

Proceed directly after a short scope summary when all conditions hold:

- Expected behavior is clear.
- Impact is low and well understood.
- Change is limited to 1–3 files or a similarly small set of tightly related symbols.
- No shared contract, public API, schema, migration, configuration, or architectural decision is involved.

Do not create a written plan for this path.

### IDE plan required

Create or update only the IDE's default `implementation_plan.md`, request feedback, and wait for explicit approval when any condition holds:

- More than 3 files are likely to change.
- Exact impact is uncertain after discovery.
- Change crosses multiple components or layers.
- UI behavior requires a meaningful product or interaction decision.
- Regression risk is moderate or verification requires several coordinated steps.

The plan must stay concise: goal, affected files and symbols, proposed edits, risks, and verification. After approval, implement immediately in this workflow. Do not redirect through OpenSpec, Superpowers, another planning workflow, or subagents.

### Redirect only for unsuitable work

Stop and recommend an appropriate full workflow only when the task includes:

- Database schema migration or broad data migration.
- Breaking API or shared-contract change.
- Major architectural decision or cross-system redesign.
- Security-sensitive behavior requiring dedicated review.
- A complex or unreproduced bug needing evidence-driven diagnosis.
- Scope too large to review safely in one IDE plan.

Explain the concrete reason for redirecting. Do not redirect solely because tests need changes or more than 3 files are affected.

## Implementation

1. Apply the minimum coherent change needed to satisfy the approved scope.
2. Preserve existing comments, naming conventions, architecture, and code patterns.
3. For visible UI changes, reuse existing design tokens, components, accessibility conventions, responsive patterns, and i18n keys.
4. Do not introduce new dependencies, environment variables, configuration keys, public contracts, or unrelated abstractions without explicit approval.
5. Re-check GitNexus freshness before making a new impact-dependent decision after source changes. Refresh the index when needed.
6. If implementation reveals materially broader scope than approved, stop, update the IDE plan, and request approval again.

## Tests and verification

1. Choose verification proportional to the change. Mandatory TDD is not part of this workflow.
2. Run relevant existing focused tests when available.
3. Tests may be modified when intended behavior changes or existing expectations are no longer correct.
4. Add a new test when it provides meaningful regression protection for changed logic; do not add ceremonial tests for trivial presentation-only changes.
5. Never weaken or delete a valid test merely to make checks pass. Test changes must reflect approved behavior.
6. Run typecheck and lint when applicable and available.
7. For UI changes, perform a focused manual or browser check of affected states when practical, including relevant loading, error, empty, success, responsive, and interaction states.
8. If a check cannot run, report the blocker and exact manual verification needed. Do not claim unsupported verification.

## Completion impact gate

1. After source changes, sync/reindex GitNexus before final `detect_changes` or impact analysis.
2. Verify changed symbols do not reach unapproved shared/public surfaces or unrelated areas.
3. If final impact exceeds approved scope, stop and update the IDE plan rather than silently expanding the change.
4. If GitNexus cannot refresh, report the blocker and distinguish verified code checks from unverified graph impact.

## Completion report

1. List every changed file and important symbol modified.
2. Summarize observable behavior changed.
3. Report tests added, modified, and run, including pass/fail results.
4. Report typecheck, lint, and UI/manual verification performed.
5. Report GitNexus refresh and final impact result, or exact blocker.
6. State remaining risks or follow-up work.
7. Do not create a git commit.
