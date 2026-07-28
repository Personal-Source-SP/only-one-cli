---
description: Apply an approved frontend OpenSpec change directly in the current workspace, completing and obtaining user approval for each planned phase before continuing, with browser verification and an unstaged, uncommitted final state.
---

## Input

```text
/only-one-implement-fe <change-name>
```

## Dependency preflight

1. Check OpenSpec CLI, MCP `gitnexus`, and skills `only-one-openspec-apply-gate`, `only-one-phase-implementation-loop`, `only-one-gitnexus-freshness`, `only-one-component-inventory`, `ux-ui-max`, `requesting-code-review`, and `verification-before-completion`.
2. For Next.js work, check `next-dev-loop`; check cache and partial-prefetching skills when approved artifacts trigger them.
3. Require browser tooling capable of affected viewport, state, interaction, console, network, screenshot, and recording verification.
4. Report every unavailable dependency and stop. Do not silently replace it.

## Shared implementation lifecycle

Invoke `only-one-openspec-apply-gate`, then `only-one-phase-implementation-loop`. The apply gate resolves approved `contextFiles`; the shared loop owns current-workspace safety, phase/task ordering, checkbox transitions, phase approval, feedback rework, integrated review, verification, and unstaged/uncommitted final state. Apply the profile rules below at every shared-loop extension point.

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

## Frontend execution profile

- Before component changes, invoke `only-one-component-inventory` Mode B and enforce approved reuse classification.
- Task verification: declared viewports, states, interactions, console/network, required screenshots/recordings, command evidence, and diff checks including `[EXISTING]` and undeclared files.
- Phase impact dimensions: direct, upstream, downstream, visual, responsive, accessibility, state, contract, and reuse behavior.
- Escalate feedback that changes scope, UI direction, source organization, ownership, Server/Client split, contracts, shared boundaries, or phase structure to resolved OpenSpec artifacts and renewed plan approval.
- Phase report: goal, tasks, files/tags, reuse, states/viewports/interactions, console/network, visual evidence, commands/results, acceptance, boundary impact, skipped checks, risks, blockers, and diff.
- Integrated checks: visual direction, states, responsive/accessibility behavior, Server/Client boundaries, contracts, cache/navigation, reuse, tests, typecheck, lint/format, applicable build, and `next-dev-loop` browser evidence.

## Contract and system enforcement

1. Match approved routes, queries, navigation, API/shared contracts, state persistence, cache behavior, Server/Client ownership, component ownership, UI states, responsive behavior, and accessibility requirements.
2. Respect task and phase dependency order and declared file ownership.
3. Stop on contract conflict, `[EXISTING]` modification need, undeclared-file need, or shared-boundary impact outside the allowlist. Do not silently alter OpenSpec artifacts or implementation contracts.

## Completion profile

The shared completion report additionally records tag, canonical-reference and reuse compliance; viewport/state/interaction and console/network evidence; screenshots/recordings; test/typecheck/lint/build results; contract/shared-boundary status; GitNexus impact; blockers; branch; working-tree; and staging status.
