---
description: Scope, implement, and verify a simple low-risk task directly — no subagent delegation, no written plan, no large skill requirements.
---

## Input

```text
/only-one-implement-fast <task description>
```

## When to use this workflow

Use this workflow when the task:

- Affects 1–3 files and a small, well-understood set of symbols.
- Has a clear, unambiguous outcome that does not require brainstorming or UI design.
- Carries low regression risk (no schema changes, no contract modifications, no shared-module impact).
- Does not require subagent delegation, architectural decisions, or a written plan.

Stop and redirect to `/only-one-plan-be`, `/only-one-plan-fe`, or `/only-one-bug` if the task:

- Requires touching more than 3 files or unknown symbols.
- Involves a schema migration, API contract change, or shared type modification.
- Requires significant UI design decisions.
- Cannot be fully verified with a focused test or a narrow manual check.

## Scope definition

Before writing any code:

1. State the task in one sentence: what changes and what the observable result is.
2. List the exact files and symbols that will change. Stop if you cannot enumerate them.
3. Identify a single direct test file (colocated `*.spec.ts` or `*.test.tsx`) that covers the behavior. If none exists, name the file you will create.
4. Confirm no shared contracts, public APIs, database schema, or config files are affected. If any are, stop and use the appropriate full workflow.

## Implementation

1. Apply the minimum change required to satisfy the task. Do not refactor unrelated code.
2. Preserve all existing comments, naming conventions, and code patterns in the touched files.
3. If the task produces a visible UI change: use existing design tokens, components, and i18n keys. Do not introduce new colors, fonts, or hardcoded strings.
4. If the task touches a NestJS endpoint: keep the existing HTTP method, path, DTO shape, status codes, and guard chain unchanged unless the task explicitly requires modifying them.
5. Do not add new dependencies, environment variables, or configuration keys without explicit user approval.

## Verification

1. Run the focused test or spec for the changed file(s) and capture the result.
2. Run the project typecheck (`tsc --noEmit` or equivalent) if a TypeScript file was modified.
3. Run the project lint check if a linting script is available.
4. If the task changed a component, confirm the relevant UI state (loading, error, empty, success) still renders correctly.
5. If any check cannot run, report the blocker and the exact manual verification step needed. Do not claim the task is done without evidence.

## Completion report

1. List every changed file and the symbols modified within it.
2. Provide the test command run and its output (pass/fail).
3. Provide typecheck and lint results.
4. State any remaining risks or follow-up items explicitly.
5. Do not create a git commit.
