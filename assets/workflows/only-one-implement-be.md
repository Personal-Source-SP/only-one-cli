---
description: Apply an approved NestJS OpenSpec change in one feature worktree, applying TDD only for business-logic layers (services, utils), committing at phase boundaries, with full verification and unstaged local handoff.
---

## Input

```text
/only-one-implement-be <change-name>
```

## Dependency preflight

1. Check OpenSpec CLI, MCP `gitnexus`, and skills `only-one-openspec-apply-gate`, `only-one-gitnexus-freshness`, `only-one-worktree-handoff`, `brainstorming`, `test-driven-development`, `requesting-code-review`, and `verification-before-completion`.
2. Report every unavailable dependency and stop. Do not silently replace it.

## OpenSpec apply and approval gate

Invoke `only-one-openspec-apply-gate`. Ensure `contextFiles` contains approved scope, allowlist, API contract, schema changes, task dependencies, risks, and verification commands.

## GitNexus freshness gates

Invoke `only-one-gitnexus-freshness` before every GitNexus-dependent decision throughout this workflow.

## Feature worktree setup

Invoke `only-one-worktree-handoff` (Phase A — setup). Use branch `ai/<feature-slug>`.

## OpenSpec task loop

For each pending task returned by apply instructions, in dependency order:

1. Re-read relevant `contextFiles` and show current task/progress.
2. If code-level decisions remain open, invoke `brainstorming` for micro-brainstorming limited to that task. Do not reopen approved product decisions.
3. If discovery changes scope, schema, API contract, or design, update resolved OpenSpec artifacts and stop for explicit user approval before implementation.
4. **TDD applies only to services and utils that contain business logic.** For other layers (controllers, modules, DTOs, guards, interceptors, migrations) follow the existing system design patterns — no mandatory RED/GREEN/REFACTOR cycle required.
   - **When TDD is required (service / utils):** Invoke `test-driven-development` and follow RED, GREEN, REFACTOR:
     - **RED:** Add smallest behavioral test first. For NestJS `createTestingModule`, mock every injected provider explicitly. Run focused spec and confirm expected missing-behavior failure, not syntax/setup error.
     - **GREEN:** Write minimum strict TypeScript implementation. Run focused spec and confirm pass.
     - **REFACTOR:** Improve names, duplication, composition, and type safety without behavior change. Rerun focused and neighboring specs.
   - **When TDD is not required:** Implement following the project's established design pattern. Run existing related specs to confirm nothing regressed.
5. Do not weaken assertions, add undocumented `any`, or test implementation details when observable behavior is testable.
6. Inspect task diff and invoke `requesting-code-review`. Resolve blocking findings (for TDD layers: another bounded RED, GREEN, REFACTOR cycle; for other layers: fix and rerun specs).
7. Apply `only-one-gitnexus-freshness` (public/shared boundary gate) after source changes.
8. Update task checkbox only after implementation, review, focused checks, and dependencies are complete.
9. **Do not commit after every individual task.** Accumulate work within a phase (e.g., schema & migrations, core services, controllers & wiring) and create a single checkpoint commit at the end of each phase. Do not commit unverified work. Use a descriptive Conventional Commit message.
10. Rerun `openspec instructions apply --change "<name>" --json` to refresh progress and select next pending task.

## API and schema enforcement

1. Match approved endpoint method/path, DTO fields/types, validation, optionality, serialization, statuses, errors, guards, roles, and permissions.
2. Execute schema/migration tasks before dependent service/controller tasks.
3. Stop on contract conflict or shared-boundary impact outside allowlist. Do not silently alter OpenSpec artifacts or implementation contract.

## Integrated verification

1. After all tasks complete, inspect complete feature-branch diff and commit history.
2. Invoke `requesting-code-review` for integrated change and resolve blocking findings with bounded TDD.
3. Run focused specs, neighboring specs, typecheck, lint/format, build when applicable, and full test suite.
4. Apply `only-one-gitnexus-freshness` (integration impact gate).
5. Invoke `verification-before-completion` using fresh command evidence.
6. Require feature worktree to be clean and all verified work committed before handoff.

## Unstaged local handoff and cleanup

Invoke `only-one-worktree-handoff` (Phase B — handoff, Phase C — cleanup).

## Completion report

Report OpenSpec progress, phase checkpoint commits, changed files, TDD evidence for service/utils layers, design-pattern compliance for other layers, specs run (focused, neighboring, full suite), typecheck/lint/build results, GitNexus impact, handoff status, skipped checks, blockers, and recovery branch.
