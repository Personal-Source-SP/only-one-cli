---
description: Apply an approved frontend OpenSpec change in one feature worktree, executing the approved task list top-to-bottom with browser verification, committing at phase boundaries, and unstaged local handoff.
---

## Input

```text
/only-one-implement-fe <change-name>
```

## Dependency preflight

1. Check OpenSpec CLI, MCP `gitnexus`, and skills `openspec-apply-change`, `using-git-worktrees`, `brainstorming`, `ux-ui-max`, `requesting-code-review`, and `verification-before-completion`.
2. For Next.js work, check `next-dev-loop`; check cache and partial-prefetching skills when approved artifacts trigger them.
3. Require browser tooling capable of affected viewport, interaction, console, and network verification.
4. Report every unavailable dependency and stop. Do not silently replace it.

## OpenSpec apply and approval gate

1. Resolve `<name>` with `openspec-apply-change`. If ambiguous, run `openspec list --json` and ask user to select.
2. Run `openspec status --change "<name>" --json`; read `schemaName`, `planningHome`, `changeRoot`, `actionContext`, and dynamic artifact paths.
3. Run `openspec instructions apply --change "<name>" --json`; read `state`, `contextFiles`, progress, pending tasks, and instruction.
4. Stop when blocked, when `actionContext` disallows implementation, or when explicit approval evidence is absent.
5. Read every path in `contextFiles`. The approved plan must contain:
   - **Directory structure plan** — annotated file tree (`[NEW]` / `[IMPROVE]` / `[WIRE]` / `[EXISTING]`) with one-line purpose per file
   - **Component inventory** — reuse-first classification (`[USE]` / `[EXTEND]` / `[NEW]`) per component
   - **Canonical ref** — path and structural summary
   - Task list ordered in Layer 1 → Layer 2 sequence
6. If any of the above is missing or conflicting, stop and ask. Do not infer or expand scope.

## GitNexus freshness gates

1. GitNexus evidence expires after source changes since latest successful index/sync.
2. Before each GitNexus-dependent decision, verify index is current and not `stale` or `incomplete`. If not, stop, sync/reindex, then repeat query.
3. **Public/shared boundary gate:** Refresh evidence before changing public symbols or shared contracts. Stop for impact beyond allowlist.

## One feature worktree

1. Use one feature worktree for entire OpenSpec change. Never create one worktree per task.
2. Require clean target working directory. Record target branch and HEAD. Do not stash, reset, or overwrite existing changes.
3. Invoke `using-git-worktrees`. Use branch `ai/<feature-slug>` and repository-approved location, normally `.worktrees/<feature-slug>`.
4. Resume matching worktree only after verifying branch and change identity. Stop on conflict.
5. Run setup inside worktree. Stop and ask before proceeding from baseline failures.
6. All source edits, OpenSpec task updates, UI evidence, reviews, and checkpoint commits happen inside worktree.

## OpenSpec task loop

The approved plan provides a fully ordered task list: **Layer 1 tasks first (individual pieces), Layer 2 tasks second (wire and assemble)**. Execute tasks **top-to-bottom** as listed. Do not reorder, skip, or search for tasks.

For each task:

1. **Read the task.** The task already specifies:
   - Target file path and its status: `[NEW]` (create), `[IMPROVE]` (modify existing), or `[WIRE]` (compose/assemble)
   - What to implement
   - Which canonical ref pattern to follow
   - Browser evidence required

2. **Verify reuse-first before touching any component:**
   - `[USE]`: import existing component as-is. Do not copy, inline, or recreate.
   - `[EXTEND]`: add only the approved prop/variant. Verify existing usages remain unbroken.
   - `[NEW]`: must use existing design-system tokens. Never hardcode color, spacing, or typography values.

3. **Implement** following the canonical ref's established pattern:
   - Preserve design-system primitives, tokens, assets, i18n, semantic HTML, keyboard/focus, contrast, reduced motion, and responsive behavior.
   - Implement all relevant UI states: loading, empty, error, success, disabled, permission.
   - Preserve Server/Client boundaries. Use typed API wrappers or SDKs and exported contracts only.
   - Do not use placeholders.

4. If scope, UI direction, Server/Client split, or any approved plan decision changes during implementation, update resolved OpenSpec artifacts and stop for explicit approval before continuing.

5. **Browser verify** — for the viewport/state/interaction matrix defined in this task:
   - Inspect browser console and network for errors.
   - Capture screenshot or recording evidence when required.

6. Invoke `requesting-code-review`. Resolve blocking findings, then rerun browser verification.

7. Refresh GitNexus after source changes. Check touched public/shared symbols against allowlist.

8. Update OpenSpec task checkbox only after implementation, browser evidence, and review are complete.

9. Move to the next task in order.

## Phase commits

Do not commit after every individual task. Commit at the end of each layer:

- **Phase 1 commit** — after all Layer 1 tasks (individual pieces) are implemented, verified, and reviewed. Use a descriptive Conventional Commit message.
- **Phase 2 commit** — after all Layer 2 tasks (wire and assemble) are implemented, verified, and reviewed. Use a descriptive Conventional Commit message.

Do not commit unverified work.

## Integrated verification

1. Inspect complete feature-branch diff and commit history. Invoke `requesting-code-review` for the integrated change and resolve blocking findings.
2. Verify approved visual direction, all UI states, mobile/tablet/desktop behavior, accessibility, Server/Client boundaries, and typed contracts.
3. Run typecheck, lint/format, and build.
4. Use `next-dev-loop` when applicable. Inspect browser console and network across the full viewport/state/interaction matrix. Capture fresh evidence. Never claim visual or responsive completion from code inspection alone.
5. **Integration impact gate:** Sync/reindex GitNexus after source changes before final impact analysis. Stop for impact beyond allowlist.
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

Report OpenSpec progress, directory structure plan compliance (`[NEW]`/`[IMPROVE]`/`[WIRE]` per file), component reuse-first compliance, Phase 1 and Phase 2 checkpoint commits, browser states/viewports verified, console/network results, typecheck/lint/build results, reviews, GitNexus impact, handoff status, skipped checks, blockers, and recovery branch.
