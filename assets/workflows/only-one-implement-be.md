---
description: Apply an approved NestJS OpenSpec change in one feature worktree with strict TDD, checkpoint commits, full verification, and unstaged local handoff.
---

## Input

```text
/only-one-implement-be <change-name>
```

## Dependency preflight

1. Check OpenSpec CLI, MCP `gitnexus`, and skills `openspec-apply-change`, `using-git-worktrees`, `brainstorming`, `test-driven-development`, `requesting-code-review`, and `verification-before-completion`.
2. Report every unavailable dependency and stop. Do not silently replace it.

## OpenSpec apply and approval gate

1. Resolve `<name>` through the selection protocol from `openspec-apply-change`. If ambiguous, run `openspec list --json` and ask user to select.
2. Run `openspec status --change "<name>" --json`. Read `schemaName`, `planningHome`, `changeRoot`, `actionContext`, and artifact paths; do not assume repo-local paths or fixed artifact names.
3. Run `openspec instructions apply --change "<name>" --json`. Read `state`, `contextFiles`, progress, pending tasks, and dynamic instruction.
4. Stop when state is `blocked`, when `actionContext` disallows implementation edits, or when approval evidence is absent.
5. Read every path in `contextFiles`. Confirm approved scope, allowlist, API contract, schema changes, risks, task dependencies, and verification commands.
6. Stop for missing or conflicting information. Do not infer requirements or expand scope.

## GitNexus freshness gates

1. GitNexus evidence expires after source changes since latest successful index/sync.
2. Before each GitNexus-dependent decision, verify index covers current repository, checked-out branch, and current working-tree revision, and is not `stale` or `incomplete`.
3. If not current, stop, sync/reindex, then repeat query.
4. Do not claim complete impact coverage from a stale or incomplete index.
5. **Preflight scope gate:** Query only approved symbols and direct relationships.
6. **Public/shared boundary gate:** Before changing public symbols or shared contracts, refresh evidence and stop for impact beyond allowlist until explicit approval.

## One feature worktree

1. Use one feature worktree for entire change. Never create one worktree per task.
2. Before isolation, require target working directory to be clean. Record target branch and HEAD. Do not stash, reset, or overwrite existing changes.
3. Invoke `using-git-worktrees`. Use branch `ai/<feature-slug>` and repository-approved worktree location, normally `.worktrees/<feature-slug>`.
4. If matching worktree exists, verify its branch/change identity and resume it. Stop on conflicts.
5. Run project setup and baseline tests inside worktree. Stop and ask before proceeding from baseline failures.
6. All source changes, OpenSpec task updates, tests, reviews, and checkpoint commits happen inside this worktree.

## OpenSpec task loop

For each pending task returned by apply instructions, in dependency order:

1. Re-read relevant `contextFiles` and show current task/progress.
2. If code-level decisions remain open, invoke `brainstorming` for micro-brainstorming limited to that task. Do not reopen approved product decisions.
3. If discovery changes scope, schema, API contract, or design, update resolved OpenSpec artifacts and stop for explicit user approval before implementation.
4. Invoke `test-driven-development` and follow RED, GREEN, REFACTOR:
   - **RED:** Add smallest behavioral test first. For NestJS `createTestingModule`, mock every injected provider explicitly. Run focused spec and confirm expected missing-behavior failure, not syntax/setup error.
   - **GREEN:** Write minimum strict TypeScript implementation. Run focused spec and confirm pass.
   - **REFACTOR:** Improve names, duplication, composition, and type safety without behavior change. Rerun focused and neighboring specs.
5. Do not weaken assertions, add undocumented `any`, or test implementation details when observable behavior is testable.
6. Inspect task diff and invoke `requesting-code-review`. Resolve blocking findings through another bounded RED, GREEN, REFACTOR cycle.
7. Refresh GitNexus when source changed; run focused impact check for touched public symbols.
8. Update task checkbox only after TDD evidence, review, focused checks, and dependencies are complete.
9. Create a checkpoint commit containing task code, tests, and task-artifact update. Do not commit unverified work. Use a descriptive Conventional Commit message.
10. Rerun `openspec instructions apply --change "<name>" --json` to refresh progress and select next pending task.

## API and schema enforcement

1. Match approved endpoint method/path, DTO fields/types, validation, optionality, serialization, statuses, errors, guards, roles, and permissions.
2. Execute schema/migration tasks before dependent service/controller tasks.
3. Stop on contract conflict or shared-boundary impact outside allowlist. Do not silently alter OpenSpec artifacts or implementation contract.

## Integrated verification

1. After all tasks complete, inspect complete feature-branch diff and commit history.
2. Invoke `requesting-code-review` for integrated change and resolve blocking findings with bounded TDD.
3. Run focused specs, neighboring specs, typecheck, lint/format, build when applicable, and full test suite.
4. **Integration impact gate:** Sync/reindex GitNexus after source changes before `detect_changes` or final impact analysis. Stop for impact beyond allowlist.
5. Invoke `verification-before-completion` using fresh command evidence.
6. Require feature worktree to be clean and all verified work committed before handoff.

## Unstaged local handoff

1. Recheck target working directory. It must remain on recorded target branch and be clean; target HEAD must contain recorded base. Stop on drift requiring user decision.
2. From target working directory, run `git merge --squash ai/<feature-slug>`, then run `git reset`.

```bash
git merge --squash ai/<feature-slug>
git reset
```

3. `git reset` must leave squash result as unstaged changes so user can inspect every changed file in IDE.
4. Show `git status --short`, `git diff --stat`, and changed-file list. Do not stage or hide resulting changes.
5. Do not commit on the target branch. User reviews, edits, stages, and commits manually.
6. On merge conflict, stop and report conflict paths. Do not abort, reset, delete, or resolve without explicit instruction.
7. After successful squash and reset, confirm the feature worktree is clean, then run `git worktree remove .worktrees/<feature-slug>` followed by `git worktree prune` from the repository root.
8. After removal, verify `.worktrees/<feature-slug>` no longer exists and `git worktree list` no longer reports it. If `.worktrees` is empty, run `rmdir .worktrees` so no empty worktree folder remains.

```bash
git worktree remove .worktrees/<feature-slug>
git worktree prune
test ! -e .worktrees/<feature-slug>
[ ! -d .worktrees ] || rmdir .worktrees
```

9. If removal fails because the worktree is dirty, locked, or still registered, stop and report the exact state. Do not use `--force` or manually delete the folder.
10. Keep `ai/<feature-slug>` as a recovery branch until `/only-one-archive-cleanup` successfully syncs and archives the related OpenSpec change and verifies the squash result on the target branch.
11. Do not delete the recovery branch or archive the OpenSpec change in this workflow. Completion report must record OpenSpec change name, recovery branch, target branch, target HEAD at handoff, and worktree cleanup status for `/only-one-archive-cleanup`.

## Completion report

Report change/schema, OpenSpec progress, checkpoint commits, changed files, RED/GREEN/REFACTOR evidence, reviews, full verification, GitNexus impact, handoff status, skipped checks, blockers, and recovery branch. Never claim full verification without fresh evidence.
