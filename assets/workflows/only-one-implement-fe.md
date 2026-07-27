---
description: Apply an approved frontend OpenSpec change in one feature worktree, executing the approved task list top-to-bottom with browser verification, committing at phase boundaries, and unstaged local handoff.
---

## Input

```text
/only-one-implement-fe <change-name>
```

## Dependency preflight

1. Check OpenSpec CLI, MCP `gitnexus`, and skills `only-one-openspec-apply-gate`, `only-one-gitnexus-freshness`, `only-one-worktree-handoff`, `only-one-component-inventory`, `brainstorming`, `ux-ui-max`, `requesting-code-review`, and `verification-before-completion`.
2. For Next.js work, check `next-dev-loop`; check cache and partial-prefetching skills when approved artifacts trigger them.
3. Require browser tooling capable of affected viewport, interaction, console, and network verification.
4. Report every unavailable dependency and stop. Do not silently replace it.

## OpenSpec apply and approval gate

Invoke `only-one-openspec-apply-gate`. Ensure `contextFiles` contains the approved directory structure plan (`[NEW]`/`[IMPROVE]`/`[WIRE]`/`[EXISTING]` per file), component inventory, canonical ref, task list in Layer 1 → Layer 2 order, and verification commands.

## GitNexus freshness gates

Invoke `only-one-gitnexus-freshness` before every GitNexus-dependent decision throughout this workflow.

## Feature worktree setup

Invoke `only-one-worktree-handoff` (Phase A — setup). Use branch `ai/<feature-slug>`.

## OpenSpec task loop

The approved plan provides a fully ordered task list: **Layer 1 tasks first (individual pieces), Layer 2 tasks second (wire and assemble)**. Execute tasks **top-to-bottom** as listed. Do not reorder, skip, or search for tasks.

For each task:

1. **Read the task.** The task already specifies:
   - Target file path and its status: `[NEW]` (create), `[IMPROVE]` (modify existing), or `[WIRE]` (compose/assemble)
   - What to implement
   - Which canonical ref pattern to follow
   - Browser evidence required

2. **Enforce reuse-first:** Invoke `only-one-component-inventory` (Mode B — enforce) before touching any component. Verify the approved `[USE]` / `[EXTEND]` / `[NEW]` classification and confirm no hardcoded token values will be introduced.

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

7. Apply `only-one-gitnexus-freshness` (public/shared boundary gate) after source changes.

8. Update OpenSpec task checkbox only after implementation, browser evidence, and review are complete.

9. Move to the next task in order.

## Phase commits

Do not commit after every individual task. Commit at the end of each layer:

- **Phase 1 commit** — after all Layer 1 tasks (individual pieces) are implemented, verified, and reviewed.
- **Phase 2 commit** — after all Layer 2 tasks (wire and assemble) are implemented, verified, and reviewed.

Do not commit unverified work. Use a descriptive Conventional Commit message.

## Integrated verification

1. Inspect complete feature-branch diff and commit history. Invoke `requesting-code-review` for the integrated change and resolve blocking findings.
2. Verify approved visual direction, all UI states, mobile/tablet/desktop behavior, accessibility, Server/Client boundaries, and typed contracts.
3. Run typecheck, lint/format, and build.
4. Use `next-dev-loop` when applicable. Inspect browser console and network across the full viewport/state/interaction matrix. Capture fresh evidence. Never claim visual or responsive completion from code inspection alone.
5. Apply `only-one-gitnexus-freshness` (integration impact gate).
6. Invoke `verification-before-completion` with fresh command and browser evidence.
7. Require clean feature worktree and all verified work committed before handoff.

## Unstaged local handoff and cleanup

Invoke `only-one-worktree-handoff` (Phase B — handoff, Phase C — cleanup).

## Completion report

Report OpenSpec progress, directory structure plan compliance (`[NEW]`/`[IMPROVE]`/`[WIRE]` per file), component reuse-first compliance, Phase 1 and Phase 2 checkpoint commits, browser states/viewports verified, console/network results, typecheck/lint/build results, reviews, GitNexus impact, handoff status, skipped checks, blockers, and recovery branch.
