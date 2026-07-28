---
description: Apply an approved frontend OpenSpec change directly in the current workspace, completing and obtaining user approval for each planned phase before continuing, with browser verification and an unstaged, uncommitted final state.
---

## Input

```text
/only-one-implement-fe <change-name>
```

## Dependency preflight

1. Check OpenSpec CLI, MCP `gitnexus`, and skills `only-one-openspec-apply-gate`, `only-one-gitnexus-freshness`, `only-one-component-inventory`, `ux-ui-max`, `requesting-code-review`, and `verification-before-completion`.
2. For Next.js work, check `next-dev-loop`; check cache and partial-prefetching skills when approved artifacts trigger them.
3. Require browser tooling capable of affected viewport, state, interaction, console, network, screenshot, and recording verification.
4. Report every unavailable dependency and stop. Do not silently replace it.

## OpenSpec apply and workspace gate

1. Invoke `only-one-openspec-apply-gate`. Confirm the change and its phases are approved and `contextFiles` contain canonical reference, UI direction, source organization, component inventory, reuse classifications, allowlist, contracts, UI state and viewport matrix, phase/task dependencies, acceptance requirements, risks, and verification evidence.
2. Work directly in the current workspace and branch. Do not create or switch branches or worktrees.
3. Inspect current working-tree and staging state. Stop when existing changes conflict with planned files or make task ownership unsafe; otherwise preserve all unrelated user changes.
4. Do not stage or commit files. Do not hand off changes to another branch or workspace.

## GitNexus freshness gates

Invoke `only-one-gitnexus-freshness` before each GitNexus-dependent decision. Recheck after changes to public or shared boundaries and during integrated verification.

## Implementation rules by file tag

Apply approved UI system organization, canonical reference, and existing project conventions. When a task uses multiple tags, apply every relevant rule:

- **`[NEW]`:** create the declared component, hook, page, style, test, or support file within approved ownership. Follow the canonical reference and approved `[USE]`, `[EXTEND]`, or `[NEW]` classification. Reuse design-system primitives, tokens, assets, typed contracts, and i18n resources; do not add placeholders or duplicate an approved reusable capability.
- **`[MODIFY]`:** change only approved components, hooks, functions, routes, styles, or bounded sections. Preserve existing public behavior and component APIs unless the plan approves a contract change. Avoid unrelated refactors and preserve canonical structure, design-system usage, and ownership.
- **`[TEST]`:** implement every listed interaction or behavior case. Test observable behavior instead of component internals, keep assertions meaningful, and run focused plus affected neighboring tests. Test-first is not required.
- **`[WIRE]`:** compose approved pieces and connect routing, layouts, state, hooks, data sources, and entry points. Preserve Server/Client ownership, typed contracts, cache/navigation behavior, and dependency direction. Do not move substantial domain logic into pages, layouts, or wiring code.
- **`[DELETE]`:** check callers, routes, exports, assets, tests, and public/shared impact before removal. Remove dead imports, exports, registrations, and wiring. Preserve compatibility unless removal was explicitly approved.
- **`[EXISTING]`:** use only as a reference or reuse dependency. Do not modify the file. If modification becomes necessary, stop and update its approved status and affected OpenSpec artifacts before continuing.

Apply these frontend rules where relevant:

- Preserve server-only security boundaries; do not expose secrets, private data, or server-only modules to client bundles.
- Use project-standard typed API wrappers, SDKs, or exported/generated contracts. Do not manually duplicate backend payload types.
- Implement approved loading, empty, error, success, disabled, and permission states.
- Preserve semantic HTML, landmarks, heading order, labels, keyboard behavior, focus visibility, contrast, reduced motion, responsive behavior, stable repeated-item identity, and design tokens.
- Use hooks, effects, client state, and Client Components only where required by approved ownership and runtime behavior. Keep side effects scoped and cleanup-safe.
- Do not introduce hardcoded design values when approved tokens or primitives exist.

## Phase execution and approval loop

Process approved phases in dependency order. Do not start the next phase until the user explicitly accepts the current phase.

For each phase:

1. Re-read relevant `contextFiles`. Present the phase goal, ordered tasks, acceptance requirements, and browser/command verification.
2. For each task in order:
    - Confirm prerequisite tasks are complete.
    - Implement only the task's **Main work**, declared **Files**, **Allowed scope**, and approved system constraints.
    - Treat `[NEW]`, `[MODIFY]`, `[DELETE]`, `[TEST]`, `[WIRE]`, and `[EXISTING]` as file operations or reference status within the task, not separate task types, and apply the matching implementation rules above.
    - Invoke `only-one-component-inventory` (Mode B — enforce) before changing components; confirm approved reuse classification and design-system dependencies.
    - Run task command checks and browser verification across declared viewports, states, and interactions. Inspect console and network; capture screenshots or recordings when required.
    - Map every task acceptance requirement to fresh browser or command evidence.
    - Inspect the task diff for undeclared files, `[EXISTING]` modifications, scope violations, and regressions.
3. After all phase tasks complete:
    - Run phase browser and command verification plus relevant neighboring checks.
    - Review the complete phase diff and invoke `requesting-code-review`.
    - Resolve blocking findings, then rerun affected task checks and full phase verification.
    - Apply the GitNexus public/shared-boundary freshness gate when relevant.
4. Report the phase goal, completed tasks, changed files and tag compliance, reuse classifications, UI states and viewports verified, interactions, console/network results, screenshots or recordings, commands and results, acceptance status, contract/shared-boundary impact, skipped checks, risks, blockers, and diff summary.
5. Stop and wait for explicit user feedback or acceptance.

## Phase feedback loop

When the user gives feedback on a phase:

1. Return to the first task in that phase and review every task in order for direct, upstream, downstream, visual, responsive, accessibility, state, contract, and reuse impact.
2. Modify only affected tasks, preserving approved scope and unrelated user changes.
3. If feedback changes approved scope, UI direction, source organization, component ownership, Server/Client split, contract, shared boundary, or phase structure, update resolved OpenSpec artifacts and stop for explicit plan approval before continuing.
4. Rerun verification for every affected task, then rerun the full viewport/state/interaction matrix and command verification for the phase.
5. Review the phase diff, publish a revised phase report, and wait again. Do not continue until the user explicitly accepts the phase.

## Contract and system enforcement

1. Match approved routes, queries, navigation, API/shared contracts, state persistence, cache behavior, Server/Client ownership, component ownership, UI states, responsive behavior, and accessibility requirements.
2. Respect task and phase dependency order and declared file ownership.
3. Stop on contract conflict, `[EXISTING]` modification need, undeclared-file need, or shared-boundary impact outside the allowlist. Do not silently alter OpenSpec artifacts or implementation contracts.

## Integrated verification

After every phase is explicitly accepted:

1. Inspect the complete working-tree diff.
2. Invoke `requesting-code-review` for the integrated change and resolve blocking findings within approved scope.
3. Verify approved visual direction, UI states, mobile/tablet/desktop behavior, accessibility, Server/Client boundaries, typed contracts, cache/navigation behavior, and reuse classifications.
4. Run planned tests, typecheck, lint/format checks, and build when applicable.
5. Use `next-dev-loop` when applicable. Inspect browser console and network across the full viewport/state/interaction matrix and capture fresh required evidence. Never claim visual or responsive completion from code inspection alone.
6. Apply the GitNexus integration impact gate.
7. Invoke `verification-before-completion` with fresh command and browser evidence.
8. Confirm workflow-created changes remain unstaged and uncommitted. Preserve pre-existing staging state without adding to it.

## Completion report

Report OpenSpec and phase approval status, changed files and tag compliance, canonical-reference and reuse compliance, UI states/viewports/interactions verified, console/network and screenshot/recording evidence, tests/typecheck/lint/build results, contract and shared-boundary status, GitNexus impact, skipped checks, blockers, current branch, working-tree status, and staging status. Leave all workflow-created changes in the current workspace for user review.
