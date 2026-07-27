---
description: Shape and approve a NestJS backend change through OpenSpec artifacts, bounded discovery, schema analysis, API contracts, and TDD-ready micro-tasks.
---

## Input

```text
/only-one-plan-be <feature intent or change name>
```

## Dependency preflight

1. Check OpenSpec CLI, MCP `gitnexus`, and skills `openspec-propose`, `brainstorming`, `writing-plans`, and `gherkin-authoring`.
2. Check `architectural-decision-records` and `c4-diagrams` when their triggers below apply.
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

## Discovery budget

1. **Schema impact check first:** Determine whether tables, Prisma models, TypeORM entities, migrations, indexes, relations, or cascades change. Analyze affected schema symbols and downstream consumers before DTO or endpoint design. Put required schema work first in the task artifact.
2. Use GitNexus queries, symbol context, routes, and impact analysis for relevant entry points and relationships.
3. Start from feature terms and known symbols. Do not recursively list, grep, read, or scan the entire repository.
4. Target 2-5% of the codebase: affected models/migrations, NestJS controllers, services, DTOs, guards, interceptors, pipes, decorators, shared contracts, and colocated `*.spec.ts` files.
5. Exclude `main.ts`, `app.module.ts`, `.env*`, and root bootstrapping files unless approved intent explicitly requires global infrastructure changes.
6. Record an exact blast-radius allowlist: file, symbol, role, direct dependencies, confidence, and colocated spec.
7. Stop and ask for narrower capability when candidate scope exceeds budget. Do not expand automatically.
8. If GitNexus is stale or incomplete, report limitation and use only targeted reads for identified files. Do not claim complete impact coverage.
9. For every source file, search for a colocated spec first. Create a new spec only when none exists.
10. If change modifies a shared API contract, adds a NestJS module/global provider, or crosses service boundaries, invoke `architectural-decision-records`. If multi-module relationships are non-obvious, invoke `c4-diagrams` first.
11. If UI work is required, stop and record an out-of-scope dependency for `/only-one-plan-fe`.

## NestJS architecture constraints

Apply these only after confirming NestJS from package manifest, framework config, bootstrap entry point, module layout, persistence adapter, and existing conventions:

1. Preserve established Controller -> Service -> Repository/Entity boundaries. Keep transport and DTO concerns out of business logic; keep business logic in services or approved domain units.
2. Use incoming DTO classes with project-established `class-validator` and `class-transformer` behavior. Treat backend DTOs or approved shared/generated schemas as API payload source of truth; do not duplicate contracts manually.
3. Define explicit request and response DTOs/types for public boundaries. Validate untrusted input and preserve strict TypeScript.
4. Preserve dependency injection, module ownership, repository injection such as `@InjectRepository` when TypeORM is established, transaction boundaries, and testability.
5. Use established NestJS HTTP exceptions and response/error shapes. Never swallow errors; preserve project logging context and avoid blanket `try/catch` wrappers.
6. Reuse existing service methods before adding logic. Split responsibilities when service complexity prevents independent understanding or testing; do not enforce arbitrary line limits or method ordering.
7. Require explicit approval, migration/compatibility plan, before/after contract evidence, and tests for intentional public API changes.

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

1. Proposal/design/spec artifacts capture goal, non-goals, risks, assumptions, schema impact, API contract, GitNexus evidence, allowlist, ADR/C4 references, and dependency order.
2. Use `gherkin-authoring` for observable acceptance criteria. Include happy path, validation/edge case, and authorization/error case.
3. Task artifact contains ordered micro-tasks. Each task names:
   - One independently testable behavior.
   - One or two source files plus direct colocated spec.
   - Exact symbols allowed for modification.
   - Dependencies and API/schema constraints.
   - **RED:** exact test code and command; all NestJS injected providers mocked explicitly; expected missing-behavior failure.
   - **GREEN:** minimum implementation and focused passing command.
   - **REFACTOR:** cleanup boundaries and neighboring/full affected checks.
   - Review evidence and a checkpoint commit after verification.
4. Order schema/migration, service/business logic, controller/DTO, then integration tasks.
5. Prevent independent tasks from writing same files. Mark dependency order when tasks cannot run in parallel.
6. Use `writing-plans` task-right-sizing principles inside OpenSpec task artifact; do not create its default plan path.
7. Record relevant NestJS layer ownership, DTO validation, DI/repository, error/logging, and public-contract constraints in design/spec artifacts and only the affected micro-tasks.

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
