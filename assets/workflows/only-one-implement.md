---
description: Execute an approved feature plan through isolated subagents, mandatory TDD, review, and integration verification.
---

## Input

```text
/only-one-implement <plan-path>
```

## Dependency preflight

1. Check whether MCP `gitnexus` and Superpowers skills `subagent-driven-development`, `test-driven-development`, `requesting-code-review`, and `verification-before-completion` are available.
2. If a required dependency is unavailable, report each blocker and stop. Ask the user to install it or approve an explicit alternative.
3. Do not silently skip, rename, or replace a required dependency.

## Approval and scope gate

1. Read the selected plan. Do not read feature documents outside the plan unless it links them explicitly.
2. Confirm the user approved this exact plan, blast-radius allowlist, contracts, risks, and verification scope.
3. Require acceptance criteria, ordered micro-tasks, exact files and symbols, direct tests, dependencies, and verification commands.
4. If the plan is missing required information or conflicts with current code, stop and request a plan update. Do not infer missing requirements.
5. Use GitNexus only to verify listed symbols, direct relationships, and current impact. Do not restart broad discovery.
6. If the index is stale or impact exceeds the approved allowlist, report the scope change and wait for explicit approval.

## Subagent orchestration

1. Invoke `superpowers:subagent-driven-development`.
2. The coordinating agent must not implement a micro-task. Assign every micro-task to a fresh subagent.
3. Give each subagent only:
   - One task and its acceptance criteria.
   - One or two permitted source files and the direct test file.
   - Exact symbols permitted for modification.
   - Required RED, GREEN, REFACTOR, and verification steps.
   - Relevant contract excerpts and dependency outputs.
4. Do not give backend subagents frontend source context or frontend subagents backend source context. Shared-contract and integration tasks may receive only the contract files named by the plan.
5. Run dependent tasks sequentially. Run tasks in parallel only when the plan marks them independent and they do not write the same files.
6. Review each subagent report and diff before starting a dependent task.
7. If a subagent needs an unlisted file, symbol, dependency, migration, or contract change, it must stop and return a scope-change request. The coordinating agent must not approve its own scope expansion.

## Mandatory TDD task protocol

Each implementation subagent must invoke `superpowers:test-driven-development` and provide evidence for all stages:

1. **RED**
   - Add the smallest behavioral unit, integration, or component test.
   - Run the focused test and capture the expected failure.
   - Confirm failure comes from missing behavior, not syntax, environment, fixture, or unrelated errors.
   - If the new test passes before implementation, stop and correct the test or plan.
2. **GREEN**
   - Write the minimum strict TypeScript change needed to satisfy the test.
   - Run the focused test and capture passing output.
3. **REFACTOR**
   - Improve naming, duplication, composition, and type safety without changing behavior.
   - Re-run the focused test and relevant neighboring tests.
4. Do not skip tests, weaken assertions, accept meaningless snapshots, use `any` without documented necessity, or test implementation details when behavior can be tested.
5. Return changed files, diff summary, commands, RED failure reason, GREEN result, REFACTOR result, and remaining risks.

## Review and integration

1. After all task subagents finish, inspect the complete `git diff`. Do not scan the full source tree.
2. Invoke `superpowers:requesting-code-review` for task-level changes and the integrated change.
3. Resolve blocking review findings through new bounded subagent tasks using the same TDD protocol.
4. For NestJS and Next.js changes, compare endpoint method and path, request DTO, response type, serialization, enum values, optionality, nullability, validation, and error behavior.
5. Verify UI loading, empty, error, success, disabled, permission, responsive, accessibility, and Server/Client boundaries required by the plan.
6. Run focused tests first, then repository typecheck, lint or format check, build when required, and full test suite using existing scripts.
7. Run GitNexus impact analysis again for changed public symbols and contracts. If impact exceeds approved scope, stop and request approval before more changes.
8. Invoke `superpowers:verification-before-completion`. Do not claim completion without fresh command evidence.

## Completion report

1. Mark plan tasks complete only when their evidence exists.
2. Report changed files, subagent task outcomes, RED/GREEN/REFACTOR evidence, review findings and resolutions, integration results, checks not run, and remaining risks.
3. If any required check cannot run, report the blocker and exact manual verification steps. Do not report the feature as fully verified.
