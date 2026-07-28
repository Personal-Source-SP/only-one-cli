---
description: Apply an approved NestJS OpenSpec change directly in the current workspace, completing and obtaining user approval for each planned phase before continuing, with full verification and an unstaged, uncommitted final state.
---

## Input

```text
/only-one-implement-be <change-name>
```

## Dependency preflight

1. Check OpenSpec CLI, MCP `gitnexus`, and skills `only-one-openspec-apply-gate`, `only-one-phase-implementation-loop`, `only-one-gitnexus-freshness`, `requesting-code-review`, and `verification-before-completion`.
2. Report every unavailable dependency and stop. Do not silently replace it.

## Shared implementation lifecycle

Invoke `only-one-openspec-apply-gate`, then `only-one-phase-implementation-loop`. The apply gate resolves approved `contextFiles`; the shared loop owns current-workspace safety, phase/task ordering, checkbox transitions, phase approval, feedback rework, integrated review, verification, and unstaged/uncommitted final state. Apply the profile rules below at every shared-loop extension point.

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

## Backend execution profile

- Task verification: focused and neighboring specs plus declared acceptance and diff checks.
- Phase impact dimensions: direct, upstream, and downstream behavior.
- Escalate feedback that changes scope, API contract, schema design, or phase structure to resolved OpenSpec artifacts and renewed plan approval.
- Phase report: goal, completed tasks, files, tests, commands/results, acceptance, API/schema impact, unexecuted migrations, skipped checks, risks, blockers, and diff.
- Integrated checks: planned specs, typecheck, lint/format, applicable build, and full suite when required.

## API and schema enforcement

1. Match approved endpoint method/path, DTO fields/types, validation, optionality, serialization, statuses, errors, guards, roles, and permissions.
2. Respect task and phase dependency order for schema, business logic, API, and wiring changes.
3. Stop on contract conflict or shared-boundary impact outside the allowlist. Do not silently alter OpenSpec artifacts or implementation contracts.

## Completion profile

The shared completion report additionally records API/schema status, migration files created but not executed, test cases, command results, GitNexus impact, skipped checks, blockers, branch, working-tree, and staging status.
