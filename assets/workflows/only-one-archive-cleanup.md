---
description: Sync and archive a completed OpenSpec change, safely clean current and stale AI worktrees and branches, then refresh GitNexus.
---

## Input

```text
/only-one-archive-cleanup [change-name]
```

## Purpose

Use this workflow as final lifecycle step after target branch contains reviewed and committed squash results. It owns OpenSpec sync and archive, recovery-branch cleanup, stale AI branch cleanup, worktree cleanup, and GitNexus refresh.

Do not invoke implementation workflows, create commits, or modify source code.

## Change selection

1. If `<change-name>` is missing, run `openspec list --json` and present active changes for explicit selection.
2. Do not guess a change when none or multiple candidates match conversation context.
3. Record repository root, current branch, current HEAD, selected change name, `changeRoot`, and archive destination.

## OpenSpec completion and sync

1. Run `openspec status --change "<name>" --json`.
2. Inspect artifact status and change task file. If artifacts or tasks are incomplete, show exact warnings and require explicit confirmation before continuing.
3. Read delta specs from status output and compare them with corresponding main specs.
4. Show combined delta specs summary: additions, modifications, removals, renames, and already-synced items.
5. If sync is needed, offer sync now or archive without sync. Record user choice. Never silently skip required assessment.
6. Perform requested spec sync using installed OpenSpec sync mechanism, then verify resulting main specs.

## Archive gate

1. Compute archive path under status-reported planning home using `YYYY-MM-DD-<name>`.
2. Stop if destination already exists. Never overwrite existing archive.
3. Move selected change only after all required warnings and sync choices are resolved.
4. Verify source change no longer appears as active and archive path exists.
5. Do not clean any recovery branch associated with this change unless archive succeeds.

## AI resource inventory

After archive succeeds, inventory all current and historical AI resources from repository root:

```bash
git worktree list --porcelain
git for-each-ref --format='%(refname:short) %(objectname)' 'refs/heads/ai/*'
git status --short
```

1. Inspect every `ai/*` branch, not only branch matching selected change.
2. Inspect every worktree under `.worktrees`, including dirty and locked state.
3. Link selected change to candidate branches using exact change name, feature slug, implementation handoff evidence, and archived artifact text.
4. For older branches, gather target branch and integration evidence independently. Do not infer safety from age alone.
5. If multiple candidates map to one change or target branch is unknown, classify them for review rather than guessing.

## Safety classification

Classify each worktree and `ai/*` branch separately:

- `safe`: worktree is clean and unlocked; associated change is archived when applicable; target branch is known; squash result is proven present by equivalent tree or patch evidence.
- `needs-review`: candidate mapping, target branch, or integration evidence is ambiguous; branch has additional commits or tree differences.
- `blocked`: worktree is dirty, locked, currently checked out where removal is unsafe, has conflicts, or associated archive failed.

For squash integration, ancestry alone is insufficient. Use tree comparison when source branch and target HEAD should be identical. Otherwise compare patch IDs or calculate exact diff remaining against recorded target. Record evidence per branch.

Never classify a branch as `safe` merely because `git branch -d` refuses or succeeds.

## Cleanup preview and confirmation

1. Show one cleanup preview table containing every discovered AI branch and worktree, classification, target, evidence, and proposed action.
2. Default action for `needs-review` and `blocked` is keep.
3. Ask for explicit confirmation before removing any worktree or branch.
4. Confirmation may cover all `safe` entries. Require separate explicit selection for any `needs-review` entry.
5. Never remove a `blocked` entry in this workflow.

## Cleanup execution

For each confirmed `safe` entry, in order:

1. Verify state has not changed since preview.
2. Remove clean worktree using its exact registered path.
3. Run `git worktree prune`.
4. Verify worktree path no longer exists and registration is gone.
5. Try `git branch -d <branch>`. Because squash normally lacks ancestry, use `git branch -D <branch>` only after recorded tree or patch verification still passes.
6. Verify branch no longer exists.
7. Continue to next confirmed branch; one blocked entry must not hide results for other entries.

Do not use `git worktree remove --force`, `rm -rf`, or bulk branch deletion without per-branch evidence.

After all confirmed removals:

```bash
git worktree prune
[ ! -d .worktrees ] || rmdir .worktrees
```

`rmdir .worktrees` is allowed only when directory is empty. If files remain, list them and keep directory.

## GitNexus refresh

After archive and cleanup mutations finish, run from repository root:

```bash
npx gitnexus analyze . --force --skip-agents-md
```

If installed local binary is available, equivalent command is:

```bash
gitnexus analyze . --force --skip-agents-md
```

Then use MCP `gitnexus` to verify index belongs to current repository and working-tree revision and is not `stale` or `incomplete`.

If analyze or MCP verification fails, do not roll back successful archive or cleanup. Report exact blocker and do not claim GitNexus is synchronized.

## Completion report

Report:

1. Selected change, schema, sync choice, and archive path.
2. Artifact/task warnings accepted or absent.
3. Every removed worktree and branch with safety evidence.
4. Every retained `needs-review` or `blocked` resource with reason and next action.
5. `.worktrees` removal status.
6. GitNexus analyze command and final index status.
7. Current branch, HEAD, and final `git worktree list` plus remaining `ai/*` branches.
