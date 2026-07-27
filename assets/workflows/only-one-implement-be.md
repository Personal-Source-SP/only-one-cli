---
description: Execute an approved backend plan directly through plan-local task tracking, mandatory TDD, review, and integration verification.
---

## Input

```text
/only-one-implement-be <plan-path>
```

## Execution location

1. Work only in current project workspace and current Git branch.
2. Do not invoke `using-git-worktrees`.
3. Do not run `git worktree` commands or create, switch to, or delete any worktree.
4. Do not create git commits.

## Dependency preflight

1. Check MCP `gitnexus` and skills `test-driven-development`, `requesting-code-review`, and `verification-before-completion`.
2. Report unavailable dependency and stop. Do not silently replace it.

## Approval and scope gate

1. Read selected plan only, except documents linked by plan.
2. Confirm user approved exact plan, allowlist, API contract, schema changes, risks, verification scope.
3. Require acceptance criteria, ordered micro-tasks, files, symbols, specs, dependencies, verification commands.
4. Stop for missing/conflicting plan information. Do not infer requirements.
5. Use GitNexus only for listed symbols, direct relationships, current impact.
6. Stop for stale index or impact beyond allowlist until explicit approval.

## Plan-local task tracking

1. Before source changes, create `<plan-dir>/tasks.md` beside plan.
2. Convert approved ordered micro-tasks into ordered `- [ ]` entries. Each entry records allowed files, symbols, dependencies, API/schema constraints, acceptance criteria, direct spec, TDD steps, review, completion evidence.
3. If `tasks.md` exists, preserve completed entries and resume first `- [ ]` task.
4. Execute schema and migration tasks first. Do not start service, controller, or DTO work until required schema tasks are `- [x]`.
5. Do not start dependent task before prerequisites are `- [x]`.
6. Tick `- [x]` only after RED/GREEN/REFACTOR evidence, task review, focused checks.

## Direct task protocol

1. Implement one unchecked task directly within plan allowlist.
2. Invoke `test-driven-development` and follow RED, GREEN, REFACTOR using Jest + `@nestjs/testing`.
3. RED: add smallest behavioral spec, explicitly mock every injected `createTestingModule` provider, run focused spec, confirm expected missing-behavior failure.
4. GREEN: write minimum strict TypeScript change, run focused spec, capture pass.
5. REFACTOR: improve names, duplication, composition, type safety without behavior change; rerun focused and neighboring specs.
6. Do not weaken assertions, use undocumented `any`, or test implementation details when behavior can be tested.
7. Inspect task diff and invoke `requesting-code-review`. Resolve blocking findings before ticking task.

## API contract enforcement

1. Match approved endpoint method, full path, request DTO, response DTO, validation, optionality, status, error shapes, guards, roles, permissions.
2. Stop and report contract conflict; do not silently alter contract.
3. Treat shared contract modification as breaking scope change requiring approval.

## Review and integration

1. After all `tasks.md` entries are `- [x]`, inspect complete `git diff`.
2. Invoke `requesting-code-review` for integrated change. Resolve blocking findings with direct bounded TDD work.
3. Compare endpoint path/method, DTOs, serialization, enums, optionality, nullability, validation, error behavior against plan contract.
4. Run focused specs, typecheck, lint or format, build when required, full suite.
5. Run GitNexus impact analysis for changed public symbols/contracts. Stop for impact beyond scope.
6. Invoke `verification-before-completion` with fresh command evidence.

## Completion report

Report `tasks.md` outcome, changed files, direct-task RED/GREEN/REFACTOR evidence, reviews, integration results, skipped checks, blockers, risks. Do not claim full verification without evidence.
