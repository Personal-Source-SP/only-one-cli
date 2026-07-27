---
name: only-one-worktree-handoff
description: Set up and tear down a single feature worktree for an OpenSpec change, then perform unstaged local handoff via squash merge and git reset. Use at the start (setup) and end (handoff) of implement workflows.
---

This skill covers two phases: **worktree setup** at the start of an implement workflow, and **unstaged local handoff** at the end.

## Phase A — One feature worktree setup

1. Use **one** feature worktree for the entire OpenSpec change. Never create one worktree per task.
2. Before creating the worktree, require the target working directory to be clean. Record the target branch name and HEAD commit. Do not stash, reset, or overwrite existing changes.
3. Invoke `using-git-worktrees`. Use branch `ai/<feature-slug>` and the repository-approved worktree location, normally `.worktrees/<feature-slug>`.
4. If a matching worktree already exists, verify its branch and change identity before resuming. Stop on identity conflicts.
5. Run project setup inside the worktree. Stop and ask before proceeding from setup failures.
6. All source edits, OpenSpec task updates, UI evidence, reviews, and checkpoint commits happen inside this worktree.

## Phase B — Unstaged local handoff

Run this phase only after all tasks are complete, integrated verification passes, and the feature worktree is clean with all work committed.

1. Recheck the target working directory: it must remain on the recorded target branch and be clean; target HEAD must contain the recorded base. Stop on drift and ask for user decision.
2. From the target working directory, run:

```bash
git merge --squash ai/<feature-slug>
git reset
```

3. `git reset` must leave the squash result as **unstaged changes** so the user can inspect every changed file in the IDE.
4. Show `git status --short`, `git diff --stat`, and the changed-file list. Do not stage or hide any resulting changes.
5. Do not commit on the target branch. The user reviews, edits, stages, and commits manually.
6. On merge conflict: stop and report conflict paths. Do not abort, reset, delete, or resolve without explicit instruction.

## Phase C — Worktree cleanup

Run after a successful squash and reset.

1. Confirm the feature worktree is clean.
2. From the repository root, run:

```bash
git worktree remove .worktrees/<feature-slug>
git worktree prune
test ! -e .worktrees/<feature-slug>
[ ! -d .worktrees ] || rmdir .worktrees
```

3. Verify `.worktrees/<feature-slug>` no longer exists and `git worktree list` no longer reports it. If `.worktrees` is empty, remove it so no empty folder remains.
4. If removal fails because the worktree is dirty, locked, or still registered: stop and report the exact state. Do not use `--force` or manually delete the folder.

## Recovery branch policy

Keep `ai/<feature-slug>` as a recovery branch until `/only-one-archive-cleanup` successfully syncs and archives the related OpenSpec change and verifies the squash result on the target branch.

Do not delete the recovery branch or archive the OpenSpec change in this workflow. The completion report must record:
- OpenSpec change name
- Recovery branch name
- Target branch
- Target HEAD at handoff
- Worktree cleanup status
