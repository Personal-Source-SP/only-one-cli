---
description: Scope, implement, and verify a simple low-risk task directly with GitNexus freshness gates — no subagent delegation, no written plan, no large skill requirements.
---

## Input

```text
/only-one-implement-fast <task description>
```

## Execution location

1. Work only in current project workspace and current Git branch.
2. Do not invoke `using-git-worktrees`.
3. Do not run `git worktree` commands or create, switch to, or delete any worktree.
4. Do not create git commits.
5. This workflow creates no plan and no `tasks.md`.

## Dependency and scope preflight

1. Check MCP `gitnexus`. Report unavailable dependency and stop. Do not silently replace it.
2. Before using GitNexus evidence, verify its index covers current repository, checked-out branch, and current working-tree revision, and is not `stale` or `incomplete`.
3. If the index is not current, stop, sync/reindex using available GitNexus tooling, then repeat the query.
4. Do not claim complete impact coverage from a stale or incomplete index.

## When to use this workflow

Use this workflow when the task:

- Affects 1–3 files and a small, well-understood set of symbols.
- Has a clear, unambiguous outcome that does not require brainstorming or UI design.
- Carries low regression risk (no schema changes, no contract modifications, no shared-module impact).
- Does not require a plan, `tasks.md`, subagent delegation, architectural decisions, or a written plan.

Stop and redirect to `/only-one-plan-be`, `/only-one-plan-fe`, or `/only-one-bug` if the task:

- Requires touching more than 3 files or unknown symbols.
- Involves a schema migration, API contract change, or shared type modification.
- Requires significant UI design decisions.
- Cannot be fully verified with a focused test or a narrow manual check.

## Scope definition

Before writing any code:

1. State the task in one sentence: what changes and what the observable result is.
2. List exact files and symbols that will change. Use current GitNexus evidence to inspect direct relationships. Stop if you cannot enumerate them.
3. Identify a single direct test file (colocated `*.spec.ts` or `*.test.tsx`) that covers behavior. If none exists, name file to create.
4. Confirm no shared contracts, public APIs, database schema, or config files are affected. If any are, stop and use appropriate full workflow.

## Relationship gate

1. Before changing a symbol with a relationship, public/shared surface, or unclear relationship, verify GitNexus index remains current.
2. Source change since latest successful index/sync expires GitNexus evidence. Stop, sync/reindex, and repeat query before another GitNexus-dependent decision.
3. Do not continue using old graph evidence for scope or impact decisions.

## Implementation

1. Apply minimum change required to satisfy task. Do not refactor unrelated code.
2. Preserve existing comments, naming conventions, and code patterns in touched files.
3. If task produces visible UI change: use existing design tokens, components, and i18n keys. Do not introduce new colors, fonts, or hardcoded strings.
4. If task touches NestJS endpoint: keep existing HTTP method, path, DTO shape, status codes, and guard chain unchanged unless task explicitly requires modifying them.
5. Do not add dependencies, environment variables, or configuration keys without explicit user approval.

## Verification

1. Run focused test or spec for changed file(s) and capture result.
2. Run project typecheck (`tsc --noEmit` or equivalent) if TypeScript file changed.
3. Run project lint check if linting script is available.
4. If task changed component, confirm relevant UI state (loading, error, empty, success) still renders correctly.
5. If any check cannot run, report blocker and exact manual verification step needed. Do not claim task done without evidence.

## Completion impact gate

1. After source change, sync/reindex GitNexus before running `detect_changes` or impact analysis for changed symbols.
2. If sync/reindex cannot run, report blocker and do not claim task complete using stale evidence.
3. Stop and redirect to `/only-one-plan-fe`, `/only-one-plan-be`, or `/only-one-bug` if impact exceeds 1–3 files or reaches shared/public API, contract, schema, config, or relationships outside scoped symbols.

## Completion report

1. List every changed file and symbols modified within it.
2. Provide test command run and output (pass/fail).
3. Provide typecheck and lint results.
4. Provide GitNexus refresh and impact-analysis result, or exact blocker.
5. State remaining risks or follow-up items explicitly.
6. Do not create a git commit.
