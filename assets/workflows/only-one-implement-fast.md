---
description: Fix a small, evidenced issue with minimal context, inline patch review, and focused verification.
---

## Input

```text
/only-one-implement-fast <error evidence and task description>
```

## Purpose

Use for a small bug fix or bounded edit with clear evidence. Work fast: isolate only relevant context, make a narrow inline patch, and verify proportionally.

## Location and boundaries

1. Work only in current project workspace and current Git branch.
2. Do not run `git worktree`, create/switch/delete worktrees, delegate to subagents, create commits, or invoke OpenSpec.
3. Do not create an `implementation_plan.md`, task artifact, or tagged-task contract.
4. Preserve unrelated working-tree changes.

## 1. Receive evidence

1. Use provided selected code, named file, stack trace, test failure, or concise observed behavior as primary evidence.
2. Ask one focused question only when source location or evidence is insufficient to isolate likely cause.
3. Do not ask for profile `FE`/`BE`, invoke `grill-me`, or request broad product decisions for a clear minor task.

## 2. Isolate minimal context

1. Read only named/selected source and direct dependencies needed to prove cause or avoid a likely side effect.
2. Do not load unrelated docs, routes, callers, modules, or full-project context.
3. State concise finding: likely cause, affected file/symbol, assumption if any, and expected side effect.
4. Stop and escalate before editing if cause needs broad discovery or evidence remains ambiguous.

## 3. Patch and review inline

1. Apply smallest patch that fixes reported behavior in affected file(s), so user can review inline diff and accept it.
2. Keep naming, comments, architecture, design tokens, accessibility, responsive patterns, i18n, and public behavior intact unless fix requires otherwise.
3. Do not refactor unrelated code or introduce a dependency, environment/configuration change, public API/contract change, database mutation, schema change, migration, or new broad abstraction.
4. Report changed file/symbol, fix rationale, and known side effects.

## 4. Verify proportionally

1. Run focused relevant test, lint, typecheck, or manual/browser check when available and appropriate for changed source.
2. Do not weaken valid tests merely to pass checks.
3. Report command/result, checks not run, blockers, and short manual verification when automated check is unavailable.

## 5. Regression test — optional, encouraged

1. After patch, offer focused unit or regression test for bug fixed.
2. Write test only when user requests it.
3. Keep test scoped to reported behavior; do not expand unrelated coverage.

## 6. Stop and use planned workflow

Stop before editing and request a planned/bounded-change workflow when task affects or may affect:

- public API, shared contract, schema, migration, database mutation, authorization, or security behavior;
- shared module, broad callers/routes, dependency, environment, or configuration;
- unclear product/UI/compatibility decision; or
- scope beyond a narrow, evidenced fix.

Report exact reason for escalation. Do not claim complete impact coverage without inspecting necessary source.

## 7. Final report

Report concise result:

1. evidence and isolated cause;
2. changed files/symbols and observable fix;
3. verification evidence/results and checks not run;
4. final known impact or escalation reason; and
5. optional regression-test next step.
