---
description: Apply an approved frontend OpenSpec change in one feature worktree with TDD, browser evidence, checkpoint commits, full verification, and unstaged local handoff.
---

## Input

```text
/only-one-implement-fe <change-name>
```

## Dependency preflight

1. Check OpenSpec CLI, MCP `gitnexus`, workflow `only-one-ui`, and skills `openspec-apply-change`, `using-git-worktrees`, `brainstorming`, `ux-ui-max`, `test-driven-development`, `requesting-code-review`, and `verification-before-completion`.
2. For Next.js work, check `next-dev-loop`; check cache and partial-prefetching skills when approved artifacts trigger them.
3. Require browser tooling capable of affected viewport, interaction, console, and network verification.
4. Report every unavailable dependency and stop. Do not silently replace it.

## OpenSpec apply and approval gate

1. Resolve `<name>` with `openspec-apply-change`. If ambiguous, run `openspec list --json` and ask user to select.
2. Run `openspec status --change "<name>" --json`; read `schemaName`, `planningHome`, `changeRoot`, `actionContext`, and dynamic artifact paths.
3. Run `openspec instructions apply --change "<name>" --json`; read `state`, `contextFiles`, progress, pending tasks, and instruction.
4. Stop when blocked, when `actionContext` disallows implementation, or when explicit approval evidence is absent.
5. Read every path in `contextFiles`. Confirm allowlist, approved UI direction, component boundaries, contracts, states, viewport matrix, risks, and verification commands.
6. Stop for missing or conflicting information. Do not infer requirements or expand scope.

## GitNexus freshness gates

1. GitNexus evidence expires after source changes since latest successful index/sync.
2. Before each GitNexus-dependent decision, verify index covers current repository, checked-out branch, and current working-tree revision, and is not `stale` or `incomplete`.
3. If not current, stop, sync/reindex, then repeat query.
4. Do not claim complete impact coverage from a stale or incomplete index.
5. **Preflight scope gate:** Query approved symbols and direct relationships only.
6. **Public/shared boundary gate:** Refresh evidence before changing public symbols, shared UI contracts, typed API contracts, or cross-layout boundaries. Stop for impact beyond allowlist.

## One feature worktree

1. Use one feature worktree for entire OpenSpec change. Never create one worktree per task.
2. Require clean target working directory. Record target branch and HEAD. Do not stash, reset, or overwrite existing changes.
3. Invoke `using-git-worktrees`. Use branch `ai/<feature-slug>` and repository-approved location, normally `.worktrees/<feature-slug>`.
4. Resume matching worktree only after verifying branch and change identity. Stop on conflict.
5. Run setup and baseline tests inside worktree. Stop and ask before proceeding from baseline failures.
6. All source edits, OpenSpec task updates, UI evidence, reviews, and checkpoint commits happen inside worktree.

## OpenSpec task loop

For each pending task in dependency order:

1. Re-read relevant `contextFiles` and show task/progress.
2. If code-level or UI composition decisions remain open, invoke `brainstorming` for micro-brainstorming limited to task. Do not reopen approved product or visual decisions.
3. If discovery changes scope, UI direction, public contract, Server/Client split, or architecture, update resolved OpenSpec artifacts and stop for explicit approval.
4. Invoke `test-driven-development` and follow RED, GREEN, REFACTOR with established Vitest/Jest and Testing Library:
   - **RED:** Add smallest behavioral test and confirm expected missing-behavior failure.
   - **GREEN:** Write minimum strict TypeScript implementation and confirm focused pass.
   - **REFACTOR:** Improve names, composition, duplication, and type safety; rerun focused and neighboring tests.
5. Follow `only-one-ui` implementation constraints: preserve approved visual direction, ownership, design-system primitives, tokens, assets, i18n, semantic HTML, keyboard/focus behavior, contrast, reduced motion, responsive behavior, and relevant loading, empty, error, success, disabled, and permission states. Do not use placeholders.
6. Preserve approved Server/Client boundaries. Use typed API wrappers or SDKs and exported or generated contracts. Apply approved cache and prefetch constraints only.
7. Run browser verification for task viewport/state/interaction matrix. Inspect browser console and network, and capture required viewport evidence through screenshots or recordings when supported.
8. Inspect task diff and invoke `requesting-code-review`. Resolve blocking findings through bounded RED, GREEN, REFACTOR.
9. Refresh GitNexus after source changes and check touched public/shared symbols.
10. Update OpenSpec checkbox only after TDD, browser evidence, review, focused checks, and dependencies complete.
11. Create checkpoint commit with task code, tests, evidence/artifact updates. Do not commit unverified work.
12. Rerun `openspec instructions apply --change "<name>" --json` and select next pending task.

## Integrated verification

1. Inspect complete feature-branch diff and history. Invoke `requesting-code-review` for integrated change and resolve blocking findings with bounded TDD.
2. Verify approved visual direction, all relevant UI states, mobile/tablet/desktop behavior, accessibility, Server/Client boundaries, typed contracts, cache, and prefetch behavior.
3. Run focused tests, neighboring tests, typecheck, lint/format, build when applicable, and full test suite.
4. Use `next-dev-loop` when applicable. Inspect browser console and network across required viewport/state/interaction matrix; capture fresh viewport evidence. Never claim responsive or visual completion from code inspection alone.
5. **Integration impact gate:** Sync/reindex GitNexus after source changes before `detect_changes` or final impact analysis. Stop for impact beyond allowlist.
6. Invoke `verification-before-completion` with fresh command and browser evidence.
7. Require clean feature worktree and all verified work committed before handoff.

## Unstaged local handoff

1. Recheck target working directory: recorded branch, clean state, and target HEAD containing recorded base. Stop on drift.
2. From target directory, run `git merge --squash ai/<feature-slug>`, then run `git reset`.

```bash
git merge --squash ai/<feature-slug>
git reset
```

3. `git reset` leaves squash result as unstaged changes for full IDE review.
4. Show `git status --short`, `git diff --stat`, and changed-file list. Do not stage or hide changes.
5. Do not commit on the target branch. User reviews, edits, stages, and commits manually.
6. On conflict, stop and report paths. Do not abort, reset, delete, or resolve without explicit instruction.
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

Report OpenSpec progress, checkpoint commits, changed files, RED/GREEN/REFACTOR evidence, browser states/viewports, console/network results, reviews, full verification, GitNexus impact, handoff, skipped checks, blockers, and recovery branch.
