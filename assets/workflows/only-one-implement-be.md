---
description: Execute an approved backend plan (NestJS) through isolated subagents, mandatory TDD, review, and integration verification.
---

## Input

```text
/only-one-implement-be <plan-path>
```

## Dependency preflight

1. Check whether MCP `gitnexus` and Superpowers skills `subagent-driven-development`, `test-driven-development`, `requesting-code-review`, and `verification-before-completion` are available.
2. If a required dependency is unavailable, report each blocker and stop. Ask the user to install it or approve an explicit alternative.
3. Do not silently skip, rename, or replace a required dependency.

## Approval and scope gate

1. Read the selected plan. Do not read feature documents outside the plan unless it links them explicitly.
2. Confirm the user approved this exact plan, blast-radius allowlist, API contract, schema changes, risks, and verification scope.
3. Require acceptance criteria, ordered micro-tasks, exact files and symbols, direct spec files, dependencies, and verification commands.
4. If the plan is missing required information or conflicts with current code, stop and request a plan update. Do not infer missing requirements.
5. Use GitNexus only to verify listed symbols, direct relationships, and current impact. Do not restart broad discovery.
6. If the index is stale or impact exceeds the approved allowlist, report the scope change and wait for explicit approval.

## Subagent orchestration

1. Invoke `superpowers:subagent-driven-development`.
2. The coordinating agent must not implement a micro-task. Assign every micro-task to a fresh subagent.
3. Give each subagent only:
   - One task and its acceptance criteria.
   - One or two permitted source files and the direct spec file (`*.spec.ts`).
   - Exact symbols permitted for modification.
   - Required RED, GREEN, REFACTOR, and verification steps (explicitly instruct the subagent NOT to commit any code).
   - Relevant API contract excerpts, schema definitions, and dependency outputs.
4. Do not give backend subagents frontend source context. Shared-contract and integration tasks may receive only the contract files named by the plan.
5. Schema and migration tasks must run first and complete fully before any service, controller, or DTO task begins.
6. Run dependent tasks sequentially. Run tasks in parallel only when the plan marks them independent and they do not write the same files.
7. Review each subagent report and diff before starting a dependent task.
8. If a subagent needs an unlisted file, symbol, dependency, migration, or contract change, it must stop and return a scope-change request. The coordinating agent must not approve its own scope expansion.

## Mandatory TDD task protocol

Each implementation subagent must invoke `superpowers:test-driven-development` using `Jest` + `@nestjs/testing`, and provide evidence for all stages:

1. **RED**
   - Add the smallest behavioral unit or integration spec.
   - List all mock providers required for `createTestingModule` — every injected dependency must be mocked explicitly.
   - Run the focused spec and capture the expected failure.
   - Confirm failure comes from missing behavior, not syntax, environment, fixture, or unrelated errors.
   - If the new spec passes before implementation, stop and correct the spec or plan.
2. **GREEN**
   - Write the minimum strict TypeScript change needed to satisfy the spec.
   - Run the focused spec and capture passing output.
3. **REFACTOR**
   - Improve naming, duplication, composition, and type safety without changing behavior.
   - Re-run the focused spec and relevant neighboring specs.
4. Do not skip tests, weaken assertions, use `any` without documented necessity, or test implementation details when behavior can be tested.
5. Return changed files, diff summary, commands, RED failure reason, GREEN result, REFACTOR result, and remaining risks. Do not create any git commits.

## API contract enforcement

All subagents implementing controller or DTO tasks must verify their changes conform exactly to the approved API contract in the plan:

1. Endpoint method and full path must match the contract exactly.
2. Request DTO field names, types, validation decorators, and optionality must match.
3. Response DTO field names, types, HTTP status codes, and error shapes must match.
4. Authorization guards and required roles/permissions must match.
5. If a subagent discovers the implementation cannot satisfy the contract without modifications, it must stop and return a contract-conflict report. Do not silently alter the contract.
6. If a shared contract type imported by other modules or the frontend is modified, flag this as a breaking change and return a scope-change request immediately.

## Review and integration

1. After all task subagents finish, inspect the complete `git diff`. Do not scan the full source tree.
2. Invoke `superpowers:requesting-code-review` for task-level changes and the integrated change.
3. Resolve blocking review findings through new bounded subagent tasks using the same TDD protocol.
4. For NestJS changes, compare endpoint method and path, request DTO, response type, serialization, enum values, optionality, nullability, validation, and error behavior against the approved contract.
5. Run focused specs first, then repository typecheck, lint or format check, build when required, and full spec suite using existing scripts.
6. Run GitNexus impact analysis again for changed public symbols and contracts. If impact exceeds approved scope, stop and request approval before more changes.
7. Invoke `superpowers:verification-before-completion`. Do not claim completion without fresh command evidence.

## Completion report

1. Mark plan tasks complete only when their evidence exists.
2. Report changed files, subagent task outcomes, RED/GREEN/REFACTOR evidence, review findings and resolutions, integration results, checks not run, and remaining risks.
3. If any required check cannot run, report the blocker and exact manual verification steps. Do not report the feature as fully verified.
