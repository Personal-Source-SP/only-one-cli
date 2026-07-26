---
description: Plan a backend feature for a NestJS repository, covering schema analysis, API contract design, and an approved micro-task plan.
---

## Input

```text
/only-one-plan-be <feature intent>
```

## Dependency preflight

1. Check whether MCP `gitnexus` and Superpowers skills `brainstorming` and `writing-plans` are available.
2. If a required dependency is unavailable, report each blocker and stop. Ask the user to install it or approve an explicit alternative.
3. Do not silently skip, rename, or replace a required dependency.

## Discovery budget

1. Define feature intent, actors, expected outcome, constraints, acceptance criteria, and unknowns before inspecting code.
2. **Schema impact check (mandatory -- first step):** Determine immediately whether the feature requires any change to the data schema (database tables, Prisma models, TypeORM entities, migrations, indexes, relations, cascade effects). If yes, locate and analyze all affected entity/model files, their relations, and downstream consumers before defining any DTO, service contract, or API shape. Any schema change must be isolated into a dedicated micro-task and executed first -- no other task may begin until the schema micro-task is complete and verified.
3. Use GitNexus queries, symbol context, routes, and impact analysis to locate relevant entry points and relationships.
4. Start from feature terms and known symbols. Do not recursively list, grep, read, or scan the entire repository.
5. Target a working set of 2-5% of the codebase. Prioritize: Prisma/TypeORM models and migration files, NestJS controllers, services, DTOs, guards, interceptors, pipes, decorators, shared contract types, and colocated spec files (`*.spec.ts`).
6. **Config blacklist (default exclusions):** Unless the feature intent explicitly requires global infrastructure changes, exclude from the blast-radius allowlist: `main.ts`, `app.module.ts`, environment config files (`.env*`), and any root-level bootstrapping file. If a scanned file falls into this category, exclude it and note the reason.
7. Record a blast-radius allowlist containing exact files and symbols, their role, direct dependencies, and confidence.
8. If the candidate scope exceeds the budget, stop and ask the user to narrow the capability. Do not expand scope automatically.
9. If the GitNexus index is stale or incomplete, report the limitation. Use only targeted reads for already identified files and do not claim complete impact coverage.
10. **Colocated test discovery:** For every source file in the allowlist, first search for a spec file in the same directory (e.g., `user.service.spec.ts` next to `user.service.ts`, `user.controller.spec.ts` next to `user.controller.ts`). Record each colocated spec file found. Only plan to create a new spec file if the source file has no existing test.
11. **Architectural impact check:** If the feature changes a shared API contract, introduces a new NestJS module or global provider, or affects more than one service boundary, invoke `architectural-decision-records` to capture the decision before writing the plan. If the impact spans multiple NestJS modules or services and the relationships are non-obvious, invoke `c4-diagrams` first to visualize the affected boundaries. Include the resulting ADR reference and any diagram in the plan.

## API contract design

Before writing micro-tasks, define the exact API contract that the feature exposes or modifies. This section must be completed and approved as part of the plan.

1. For each new or modified endpoint, specify:
   - HTTP method and full path (e.g., `POST /users/:id/roles`).
   - Request DTO: field names, types, validation decorators (`@IsString()`, `@IsUUID()`, etc.), and optionality.
   - Response DTO or type: field names, types, HTTP status codes for success and each error case.
   - Authorization: required guards, roles, or permissions.
   - Error codes and error response shapes.
2. If the feature modifies an existing endpoint, show the before/after diff of the contract.
3. If a shared contract type (imported by other modules or the frontend) is modified, flag this as a breaking change and require explicit user acknowledgment before planning the task.
4. Do not allow DTOs to be defined during micro-task planning if the API contract has not been finalized here.

## Planning

1. Invoke `superpowers:brainstorming` using only feature intent, confirmed evidence, API contract, schema analysis, assumptions, and unknowns.
2. Resolve decisions that affect data contracts, business logic, service boundaries, or task boundaries. If unresolved requirements remain after reviewing codebase evidence, invoke `grill-me` to interview the user one question at a time -- providing a recommended answer for each -- until every branch of the decision tree is resolved. Do not guess or proceed with ambiguous requirements.
3. Invoke `superpowers:writing-plans` to create the plan file. You MUST save the plan exactly at `docs/plans/<DD-MM-YYYY>/<feature-slug>.md` (using the current local date for the path, unless the user supplies another path). Do NOT use `docs/superpowers/plans/` or any other directory. This is a strict repository-wide constraint.
4. The plan must contain:
   - Goal, non-goals, and risks.
   - Acceptance criteria written as Gherkin scenarios using `gherkin-authoring`. Express observable API behavior in domain language (e.g., "When a user submits X, the system returns Y"). Include at minimum: the happy path, one validation/edge case, and one authorization/error case.
   - Assumptions (mark any unverified assumption as `Unknown`).
   - GitNexus evidence and the exact blast-radius allowlist.
   - Schema impact analysis: affected entities/models, required migrations, index changes, and cascade effects -- or explicit confirmation that no schema change is needed.
   - API contract table (method, path, request DTO, response DTO, status codes, error codes) for every new or modified endpoint.
   - ADR reference and C4 diagram if an architectural impact check was triggered (Discovery budget #11).
   - Dependency graph and ordered micro-tasks.
   - Verification commands and integration checks.
5. Each micro-task must take approximately 2-5 minutes and name:
   - One behavior or outcome.
   - One or two source files plus the direct spec file (prefer colocated spec; only create new if none exists).
   - Exact symbols permitted for modification.
   - **Step 1 -- RED:** The exact spec file to create or update. Write ONLY the test code using `Jest` + `@nestjs/testing`. List all mock providers required for `createTestingModule` (every injected dependency must be mocked explicitly). Run the spec and confirm it FAILS. Record the exact failure message. Do not write any implementation code in this step.
   - **Step 2 -- GREEN:** Write the minimum implementation code in the source file to make the failing spec pass. Run the spec again and confirm it PASSES.
   - **Step 3 -- REFACTOR:** Clean up code without changing behavior. Run the full spec suite for the affected files and confirm all still pass.
   - Dependencies and completion evidence (explicitly omit any commit steps, as changes should remain uncommitted until final integration).
6. Order tasks strictly: schema/migration tasks first, then service/business-logic tasks, then controller/DTO tasks, then integration tasks. Do not begin a controller task before the service it depends on is complete and tested.
7. Ensure independent tasks do not write the same files. Mark dependency order when tasks cannot run in parallel.
8. If the feature requires a UI change, stop and note this as an out-of-scope frontend dependency that must be planned separately using `/only-one-plan-fe`.

## Approval gate

1. Do not modify product source code, tests, dependencies, configuration, migrations, or data in this workflow.
2. Present the plan path, bounded file list, API contract summary, schema impact summary, assumptions, risks, and unresolved questions.
3. Wait for explicit user approval. Approval applies only to the stated plan, allowlist, API contract, schema changes, and verification scope.
4. **If the user requests revisions:** Do not argue or create a new file. Immediately update the draft and **overwrite** the existing plan file at `docs/plans/<DD-MM-YYYY>/<feature-slug>.md`. After saving, explicitly notify the user that the file has been updated and ask them to review and approve again before proceeding to implementation.
5. After approval, direct the user to run:

```text
/only-one-implement <plan-path>
```
