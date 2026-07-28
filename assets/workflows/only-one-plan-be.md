---
description: Shape and approve a NestJS backend change through OpenSpec artifacts, bounded discovery, schema analysis, API contracts, and implementation-ready tasks.
---

## Input

```text
/only-one-plan-be <feature intent or change name>
```

## Dependency preflight

1. Check OpenSpec CLI, MCP `gitnexus`, and skills `only-one-bounded-discovery`, `only-one-openspec-phase-planning`, `openspec-propose`, `brainstorming`, `writing-plans`, and `gherkin-authoring`.
2. Check `c4-diagrams` when its triggers below apply.
3. Report every unavailable required dependency and stop. Do not silently skip, rename, or replace dependencies.

## Shared planning lifecycle

1. Invoke `brainstorming` at product and architecture level. Resolve intent, actors, outcomes, constraints, acceptance criteria, non-goals, risks, and unknowns.
2. After design approval, invoke `only-one-openspec-phase-planning`. Follow its change selection, OpenSpec artifact lifecycle, phase/task contract, file ownership, and approval gate. Use resolved OpenSpec artifacts as the only planning source.

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

## Backend planning profile

Add these backend-specific requirements to the shared phase/task contract:

1. Proposal/design/spec artifacts capture schema impact, API contract, GitNexus evidence, allowlist, ADR/C4 references when relevant, and backend dependency order.
2. Use `gherkin-authoring` when observable acceptance is clearer in scenarios; cover relevant happy paths, edges, validation, authorization, and errors.
3. Allowed file tags are `[NEW]`, `[MODIFY]`, `[DELETE]`, `[TEST]`, `[MIGRATE]`, and `[WIRE]`.
4. Task constraints record relevant API, schema, authorization, transaction, compatibility, NestJS layer ownership, DTO validation, DI/repository, error/logging, public-contract, testing, and migration constraints.
5. Tasks changing business logic in services, utilities, domain helpers, or policies list test scenario, input/precondition, expected output/state, and expected exception/error/status when relevant.
6. Do not require tests by default for pass-through controllers, DTO decorators, wiring, entity/schema declarations, migrations, or configuration unless explicit risk or acceptance requires them.
7. Every `[MIGRATE]` entry states **create only; do not execute**. Allow static review, typecheck, lint, or non-mutating safe preview only. Never run migration apply/up/run, revert/down, schema sync, seeds, or backfills without separate explicit user approval.
8. Phase verification uses commands and review evidence. Approval presentation includes API contract and schema impact.
9. After shared approval gate succeeds, direct user to:

```text
/only-one-implement-be <change-name>
```
