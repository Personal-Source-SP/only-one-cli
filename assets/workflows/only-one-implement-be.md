---
description: Apply an approved NestJS OpenSpec change directly in the current workspace, completing and obtaining user approval for each planned phase before continuing, with full verification and an unstaged, uncommitted final state.
---

## Input

```text
/only-one-implement-be <change-name>
```

## Dependency preflight

1. Check OpenSpec CLI, MCP `gitnexus`, and skills `only-one-openspec-apply-gate`, `only-one-gitnexus-freshness`, `requesting-code-review`, and `verification-before-completion`.
2. Report every unavailable dependency and stop. Do not silently replace it.

## OpenSpec apply and workspace gate

1. Invoke `only-one-openspec-apply-gate`. Confirm the change and its phases are approved and `contextFiles` contain scope, allowlist, API contract, schema impact, phase/task dependencies, acceptance requirements, risks, and verification commands.
2. Work directly in the current workspace and branch. Do not create or switch branches or worktrees.
3. Inspect current working-tree and staging state. Stop when existing changes conflict with planned files or make task ownership unsafe; otherwise preserve all unrelated user changes.
4. Do not stage or commit files. Do not hand off changes to another branch or workspace.

## GitNexus freshness gates

Invoke `only-one-gitnexus-freshness` before each GitNexus-dependent decision. Recheck after changes to public or shared boundaries and during integrated verification.

## Implementation rules by file tag

Apply approved system organization and existing project conventions. When a task uses multiple tags, apply every relevant rule:

- **`[NEW]` / `[MODIFY]`:** preserve strict TypeScript, dependency injection, module ownership, transaction boundaries, error semantics, response shapes, and logging context. Reuse established abstractions before adding new ones. Do not add undocumented `any`, swallow errors, add blanket `try/catch`, or perform unrelated refactors.
- **`[TEST]`:** implement every listed business test case. Test observable behavior instead of implementation details, mock required NestJS injected providers explicitly, keep assertions meaningful, and run focused plus affected neighboring specs. Test-first and RED/GREEN/REFACTOR are not required.
- **`[MIGRATE]`:** follow established migration structure and statically review forward and rollback behavior when supported. Only create or modify the migration file. Type-checking, linting, or a safe preview that cannot modify a database is allowed. Do not run migration apply/up/run, migration revert/down, schema synchronization, seeds, or data backfills. Any database-changing command requires separate explicit user approval.
- **`[WIRE]`:** preserve approved module ownership and dependency direction; verify imports, exports, providers, injection, routing, and entry-point registration. Do not introduce circular dependencies or move business logic into wiring.
- **`[DELETE]`:** check references and public/shared impact before removal; remove associated imports, exports, registrations, and dead wiring. Preserve compatibility layers unless their removal was explicitly approved.

Apply these boundary-specific rules where relevant:

- **DTO/controller:** implement approved validation, transformation, serialization, HTTP status, error, guard, role, and permission contracts using established project patterns. Keep business logic outside transport code.
- **Service/domain:** keep business behavior independent from transport concerns; preserve approved transaction, authorization, error, and side-effect semantics.
- **Repository/entity:** follow the established persistence adapter and schema conventions; keep transport concerns out of persistence code.
- **Error/logging:** use established NestJS exceptions and response/error shapes, propagate unexpected failures, and preserve useful logging context.

## Phase execution and approval loop

Process approved phases in dependency order. Do not start the next phase until the user explicitly accepts the current phase.

For each phase:

1. Re-read relevant `contextFiles`. Present the phase goal, ordered tasks, acceptance requirements, and verification commands.
2. For each task in order:
    - Confirm prerequisite tasks are complete.
    - Implement only the task's **Main work**, declared **Files**, **Allowed scope**, and approved constraints.
    - Treat `[NEW]`, `[MODIFY]`, `[DELETE]`, `[TEST]`, `[MIGRATE]`, and `[WIRE]` as file operations within the task, not separate task types, and apply the matching implementation rules above.
    - Run the task's focused verification and check its acceptance requirements.
    - Inspect the task diff for scope violations and regressions.
3. After all phase tasks complete:
    - Run phase verification and relevant neighboring checks.
    - Review the complete phase diff and invoke `requesting-code-review`.
    - Resolve blocking findings, then rerun affected task checks and full phase verification.
    - Apply the GitNexus public/shared-boundary freshness gate when relevant.
4. Report the phase goal, completed tasks, changed files, test cases, commands and results, acceptance status, API/schema impact, migration files created but not executed, skipped checks, risks, blockers, and diff summary.
5. Stop and wait for explicit user feedback or acceptance.

## Phase feedback loop

When the user gives feedback on a phase:

1. Return to the first task in that phase and review every task in order for direct, upstream, and downstream impact.
2. Modify only affected tasks, preserving approved scope and unrelated user changes.
3. If feedback changes approved scope, API contract, schema design, or phase structure, update the resolved OpenSpec artifacts and stop for explicit plan approval before continuing.
4. Rerun verification for every affected task, then rerun full phase verification and review the phase diff.
5. Publish a revised phase report and wait again. Do not continue until the user explicitly accepts the phase.

## API and schema enforcement

1. Match approved endpoint method/path, DTO fields/types, validation, optionality, serialization, statuses, errors, guards, roles, and permissions.
2. Respect task and phase dependency order for schema, business logic, API, and wiring changes.
3. Stop on contract conflict or shared-boundary impact outside the allowlist. Do not silently alter OpenSpec artifacts or implementation contracts.

## Integrated verification

After every phase is explicitly accepted:

1. Inspect the complete working-tree diff.
2. Invoke `requesting-code-review` for the integrated change and resolve blocking findings within approved scope.
3. Run planned focused and neighboring specs, typecheck, lint/format checks, build when applicable, and the full test suite when required by the plan.
4. Apply the GitNexus integration impact gate.
5. Invoke `verification-before-completion` using fresh command evidence.
6. Confirm workflow-created changes remain unstaged and uncommitted. Preserve pre-existing staging state without adding to it.

## Completion report

Report OpenSpec and phase approval status, changed files, test cases and commands run, typecheck/lint/build results, API/schema status, migration files created but not executed, GitNexus impact, skipped checks, blockers, current branch, working-tree status, and staging status. Leave all workflow-created changes in the current workspace for user review.
