---
name: only-one-phase-implementation-loop
description: Use when implementing an approved OpenSpec change whose phases require task tracking, verification, user review, and feedback rework.
---

# Phase Implementation Loop

## Workspace gate

Work in current workspace and branch. Do not create or switch branches or worktrees. Inspect working-tree and staging state; stop on conflicts with planned files or unsafe ownership. Preserve unrelated changes. Do not stage, commit, or hand off workflow changes.

## Phase execution

Process approved phases in dependency order. Do not start next phase before explicit acceptance.

For each phase:

1. Re-read relevant `contextFiles`; present goal, ordered tasks, acceptance, and verification.
2. For each task: confirm prerequisites; change only declared work, files, scope, and constraints; apply caller tag rules; run profile verification and acceptance checks; inspect diff.
3. Only after implementation, required evidence, acceptance, and diff review succeed, change corresponding resolved task checkbox from `[ ]` to `[x]`. Never tick blocked, partial, or unverified tasks.
4. After all tasks, run phase and neighboring verification, review full phase diff, use `requesting-code-review`, resolve blockers, rerun affected checks, and apply GitNexus boundary gate when relevant.
5. Publish caller-defined phase report and wait for explicit feedback or acceptance.

## Feedback loop

1. Review phase tasks from first task for caller-defined impact dimensions.
2. Change affected completed task checkboxes from `[x]` to `[ ]` before edits; leave unaffected tasks unchanged.
3. Modify affected tasks only. If feedback changes approved scope, contracts, system organization, or phase structure, update resolved OpenSpec artifacts and stop for plan approval.
4. Rerun affected task and full phase verification, review diff, report again, and wait for acceptance.

## Integrated verification

After every phase is accepted: inspect full diff; use `requesting-code-review`; run caller-defined integrated checks; apply GitNexus integration gate; use `verification-before-completion` with fresh evidence; confirm workflow changes remain unstaged and uncommitted; publish caller-defined completion report.
