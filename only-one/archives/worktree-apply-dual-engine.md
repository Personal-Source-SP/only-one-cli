---
id: worktree-apply-dual-engine
title: 3-Domain Assets Architecture and Dual-Engine Worktree Integration
domain: workflow
triggers:
  - "assets/**"
  - "assets/agents/skills/only-one-apply/**"
  - "scripts/worktree-runner.ts"
archived_at: 2026-10-26T21:30:00+07:00
status: active
references:
  - only-one/archives/asset-versioning-and-sync-systems.md
  - only-one/archives/workflow-and-sdlc-systems.md
affected_modules:
  - assets/agents
  - assets/devenv
  - assets/templates
  - assets/agents/skills/only-one-apply
  - scripts/worktree-runner.ts
  - tsconfig.json
---

# Archive: 3-Domain Assets Architecture and Dual-Engine Worktree Integration

## 1. Problem & Core Value
- **Problem**: Flat root folders in `assets/` (`skills/`, `rules/`, `mcps/`, `vs/`, `configs/`, etc.) caused architectural clutter and lacked clear domain ownership. In addition, `/only-one-apply` executed file modifications in-place on the primary working directory, risking uncommitted branch corruption and git merge conflicts.
- **Value**: Restructures `assets/` into 3 explicit domains (`agents/`, `devenv/`, `templates/`) without re-export facades, and introduces Dual-Engine execution to `/only-one-apply` with isolated git worktrees, directory junction synchronization, and a mandatory Rebase-First Guard.

## 2. Key Architecture & Decisions
- **3-Domain Asset Hierarchy**: Categorized assets cleanly into `agents/` (AI agent skills, rules, hooks, mcps, combos), `devenv/` (editor, shell, linter configurations), and `templates/` (project configs, ignore templates).
- **Dual-Engine Worktree Execution**: Step 0 in `only-one-apply` detects execution mode (Worktree Mode vs In-Place Mode). In Worktree Mode, a dedicated `.worktrees/<slug>` environment is created with junction symlinks to `node_modules` and shared tooling.
- **Rebase-First Guard**: Step 5b runs automated upstream rebase and verification before merging changes into the mainline branch.
- **Worktree Runner Utility**: Encapsulated lifecycle in `scripts/worktree-runner.ts` with template configuration via `templates/worktreeinclude.template`.

## 3. Scope & Key Changes
- [`assets/`](file:///d:/Sources/PERSONAL/only-one-cli/assets): Migrated all flat folders to `assets/agents/`, `assets/devenv/`, and `assets/templates/`.
- [`assets/agents/skills/only-one-apply/SKILL.md`](file:///d:/Sources/PERSONAL/only-one-cli/assets/agents/skills/only-one-apply/SKILL.md): Added Step 0 Dual-Engine mode selection and Step 5b Rebase Guard.
- [`assets/agents/skills/only-one-apply/scripts/worktree-runner.ts`](file:///d:/Sources/PERSONAL/only-one-cli/assets/agents/skills/only-one-apply/scripts/worktree-runner.ts): Created runner managing worktree creation and directory junctions.
- [`assets/templates/ignore/git.ignore`](file:///d:/Sources/PERSONAL/only-one-cli/assets/templates/ignore/git.ignore): Added `.worktrees/` to default git ignore list.
- [`tsconfig.json`](file:///d:/Sources/PERSONAL/only-one-cli/tsconfig.json): Updated TypeScript path mappings to reflect domain directories.

## 4. Verification Evidence & PR
- **Test Status**: 100% Passed.
  - `npx vitest run test/skills/worktreeRunner.test.ts`: Passed (1/1).
  - `npx vitest run test/skills/applyWorktreeInvariants.test.ts`: Passed (3/3).
  - `npx vitest run test/core/assets/version-gate.test.ts`: Passed (2/2).
  - Full test suite passed (75 test files, 296 tests passed, 0 failures).
- **PR URL / Branch**: Mainline integration.
