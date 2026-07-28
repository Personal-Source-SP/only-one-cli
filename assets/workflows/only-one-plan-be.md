---
description: Shape and approve a NestJS backend change through OpenSpec artifacts, bounded discovery, schema analysis, API contracts, and implementation-ready tasks.
---

## Input

```text
/only-one-plan-be <feature intent or change name>
```

## Dependency preflight

1. Check OpenSpec CLI, MCP `gitnexus`, and skills `only-one-bounded-discovery`, `openspec-propose`, `brainstorming`, `writing-plans`, and `gherkin-authoring`.
2. Check `c4-diagrams` when its triggers below apply.
3. Report every unavailable required dependency and stop. Do not silently skip, rename, or replace dependencies.

## Change selection and OpenSpec protocol

1. Derive a kebab-case `<name>` from feature intent. If an active change may match, run `openspec list --json`; ask whether to continue it or create a new change.
2. Invoke `brainstorming` for macro-brainstorming at product and architecture level. Resolve intent, actors, outcomes, constraints, acceptance criteria, non-goals, risks, and unknowns before creating artifacts.
3. After design approval, invoke `openspec-propose` and follow its artifact lifecycle rather than recreating it:
    - Create a missing change with `openspec new change "<name>"`.
    - Run `openspec status --change "<name>" --json`.
    - Read `schemaName`, `planningHome`, `changeRoot`, `artifactPaths`, `actionContext`, `artifacts`, and `applyRequires`.
    - For each ready artifact, run `openspec instructions <artifact-id> --change "<name>" --json`.
    - Use returned `resolvedOutputPath`, `template`, `instruction`, `rules`, and dependencies. Do not assume repo-local paths, fixed artifact names, or a `spec-driven` schema.
4. Continue in dependency order until every artifact listed by `applyRequires` is done.
5. Treat OpenSpec-resolved artifacts as the only planning source. Do not create `docs/plans/...` or a second task tracker.

## Bounded discovery

Invoke `only-one-bounded-discovery` (BE variant). This produces the blast-radius allowlist and identifies schema impact before any DTO or endpoint design begins.

## Source and system organization

Apply these only after confirming NestJS from the package manifest, framework configuration, bootstrap entry point, module layout, persistence adapter, and existing project structure:

1. Identify the owning module for every changed capability and preserve established Controller → Service/Domain → Repository/Entity dependency direction.
2. Record the planned directory and file structure, including which files are added, changed, deleted, or used for wiring.
3. Assign transport/API ownership to controllers and DTO boundaries, business behavior ownership to services or approved domain units, and persistence ownership to repositories/entities or the established persistence adapter.
4. Record module imports/exports, shared boundaries, callers, and dependency order affected by the change. Prevent new circular ownership or dependencies.
5. Define transaction, authorization, and data-ownership boundaries at system-design level when relevant.
6. Reuse existing system capabilities and ownership boundaries where they satisfy the requirement. Record any new abstraction or responsibility split that materially changes source organization.
7. Require explicit approval, migration/compatibility planning, before/after contract evidence, and verification for intentional public API or shared-boundary changes.
8. Keep syntax, decorators, exception construction, validation implementation, mocking strategy, logging technique, and other code-writing rules out of planning artifacts; implementation workflow owns those decisions within approved system constraints.

## API contract gate

Before task decomposition, define for every new or modified endpoint:

- HTTP method and full path.
- Request DTO fields, types, validation decorators, and optionality.
- Response fields/types and success/error HTTP statuses.
- Guards, roles, and permissions.
- Error codes and response shapes.
- Before/after contract diff for modified endpoints.

Flag shared contract changes as breaking and require explicit user acknowledgment. Do not defer DTO or contract decisions into implementation tasks.

## OpenSpec artifact requirements

Fit these requirements into artifacts returned by OpenSpec instructions; do not invent unsupported artifact files:

1. Proposal/design/spec artifacts capture goal, non-goals, risks, assumptions, schema impact, API contract, GitNexus evidence, allowlist, ADR/C4 references when relevant, and dependency order.
2. Use `gherkin-authoring` for observable acceptance criteria when it adds clarity. Cover relevant happy paths, edge cases, validation, authorization, and errors.
3. Organize implementation into ordered phases. Each phase must state:
    - **Phase goal:** complete outcome delivered by the phase.
    - **Tasks:** ordered by dependency.
    - **Phase acceptance requirements:** observable conditions required for user approval.
    - **Phase verification:** commands and review evidence required before the phase report.
4. Each task represents one complete functional outcome and must state:
    - **Main work:** concise description of the outcome to implement.
    - **Files:** every affected file with an operation status:
        - `[NEW]` — create a file.
        - `[MODIFY]` — change an existing file.
        - `[DELETE]` — remove an existing file.
        - `[TEST]` — create or modify automated tests.
        - `[MIGRATE]` — create or modify a schema or data migration file.
        - `[WIRE]` — connect completed units through modules, dependency injection, routing, or integration entry points.
    - **Allowed scope:** exact symbols or bounded sections allowed for modification when known.
    - **Dependencies and constraints:** prerequisite tasks plus relevant API, schema, authorization, transaction, and compatibility constraints.
    - **Test cases:** required when the task changes business logic in services, utilities, domain helpers, or policies. List scenario, input or precondition, expected output or state change, and expected exception, error, or status when relevant.
    - **Acceptance requirements:** observable conditions that must be true for the task to be accepted.
    - **Verification:** focused commands and review evidence required to prove acceptance.
5. File statuses describe operations within a task; they do not require separate test, migration, or wiring tasks. Keep related source, tests, migration, DTO/controller, and wiring in one task when they deliver the same functional outcome.
6. Do not require tests by default for pass-through controllers, DTO decorators, module or dependency-injection wiring, entity or schema declarations, migrations, or configuration unless an explicit risk or acceptance criterion requires them.
7. Every `[MIGRATE]` file entry must state **create only; do not execute**. The task may create or modify the migration file and verify it through static review, type-checking, linting, or a safe preview that cannot modify a database. It must not run migration apply/up/run, migration revert/down, schema synchronization, seeds, or data backfills. Any database-changing command requires separate explicit user approval.
8. Prevent independent tasks from writing the same files. Mark dependency order when shared-file work cannot be avoided.
9. Use `writing-plans` task-right-sizing principles inside the OpenSpec task artifact; do not create its default plan path.
10. Record relevant NestJS layer ownership, DTO validation, DI/repository, error/logging, public-contract, testing, and migration constraints only where they affect a phase or task.

## Approval gate

1. Do not modify product source, tests, dependencies, configuration, migrations, or data.
2. Run `openspec status --change "<name>"` and verify all `applyRequires` artifacts exist at resolved paths.
3. Present change name/location, artifact status, allowlist, API contract, schema impact, assumptions, risks, and unresolved questions.
4. Wait for explicit user approval covering artifacts, scope, contracts, schema changes, and verification.
5. Revision requests update existing resolved artifacts, rerun status, and require approval again.
6. After approval, direct user to:

```text
/only-one-implement-be <change-name>
```
