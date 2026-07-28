---
description: Shape and approve a Next.js or React frontend change through OpenSpec artifacts, canonical references, UI system discovery, approved source organization, and implementation-ready phases.
---

## Input

```text
/only-one-plan-fe <feature intent or change name> --ref <path-to-canonical-doc-or-folder-or-file>
```

`--ref` is **mandatory**. It must point to one of:

- A markdown document describing the source or UI system pattern to follow.
- An existing source folder representing the canonical page structure.
- A source file used as the structural reference.

If `--ref` is absent or the path does not exist, stop immediately with:

> **Error:** `--ref <path>` is required. Provide a doc, folder, or file that describes the canonical code pattern to follow. Do not proceed without it.

## Dependency preflight

1. Check OpenSpec CLI, MCP `gitnexus`, and skills `only-one-canonical-ref-gate`, `only-one-bounded-discovery`, `only-one-component-inventory`, `only-one-ui-design-direction`, `only-one-openspec-phase-planning`, `openspec-propose`, `brainstorming`, `writing-plans`, `gherkin-authoring`, and `ux-ui-max`.
2. For Next.js work, check `next-dev-loop`. Check cache and partial-prefetching skills when data fetching, cache boundaries, navigation, or prefetch behavior may change.
3. Check `c4-diagrams` when shared design-system or multi-layout boundaries change.
4. Report every unavailable required dependency and stop. Do not silently skip, rename, or replace dependencies.

## Canonical reference gate

Invoke `only-one-canonical-ref-gate --ref <value>`. Validate and read the reference, then record `<canonical-ref>` as the immutable structural anchor for planning decisions.

## Bounded discovery and inventory

Invoke `only-one-bounded-discovery` (FE variant). Detect the framework, produce the blast-radius allowlist, and invoke `only-one-component-inventory` (Mode A) to record reusable components, design-system primitives, tokens, assets, layouts, hooks, data access, state ownership, and reuse-first classifications.

## UI direction approval

Invoke `only-one-ui-design-direction`. Map current UI state, define the shortest user flow, evaluate direction with `ux-ui-max`, and produce an annotated directory structure plan. Obtain explicit approval for UI direction and source organization before creating OpenSpec artifacts.

## Shared planning lifecycle

After UI direction and source organization approval, invoke `only-one-openspec-phase-planning`. Follow its change selection, OpenSpec artifact lifecycle, phase/task contract, file ownership, and approval gate. Use resolved OpenSpec artifacts as the only planning source.

## Source and UI system organization

Record system decisions without prescribing code-writing techniques:

1. Identify ownership for pages, layouts, sections, components, state, data access, routing, styles, assets, and design-system dependencies.
2. Record the approved directory and file structure with `[NEW]`, `[MODIFY]`, `[DELETE]`, `[TEST]`, `[WIRE]`, and `[EXISTING]` annotations.
3. Treat `[EXISTING]` files as reference or reuse dependencies only. They must not be modified unless their approved status changes.
4. Record component tree, composition boundaries, callers, shared/public boundaries, and dependency direction. Prevent circular ownership and unclear cross-feature dependencies.
5. Classify Server and Client ownership where applicable. Record data flow, state ownership, API/shared contract sources, cache boundaries, navigation, and prefetch behavior at system level.
6. Preserve approved design-system ownership, primitives, tokens, assets, i18n, and canonical reference structure. Record `[USE]`, `[EXTEND]`, or `[NEW]` reuse classification where relevant.
7. Specify required loading, empty, error, success, disabled, and permission states.
8. Specify mobile, tablet, and desktop behavior plus semantic structure and accessibility requirements: landmarks, headings, labels, keyboard, focus, contrast, and reduced motion.
9. Keep syntax, hook technique, effect implementation, key selection, component internals, token enforcement technique, and other code-writing rules out of planning artifacts; implementation workflow owns them within approved system constraints.

## Contract and evidence gate

Before task decomposition, define:

- API/shared contract impact and source of truth. Include before/after diff for modified public contracts or state `Contract impact: unchanged`.
- Route, query, navigation, cache, and state persistence behavior when relevant.
- Viewport, UI state, and interaction matrix.
- Browser console and network expectations.
- Screenshot or recording evidence required for observable acceptance.

Flag shared contract, design-system, routing, or layout changes as shared-boundary changes and require explicit user acknowledgment.

## Frontend planning profile

Add these frontend-specific requirements to the shared phase/task contract:

1. Artifacts capture approved UI direction, canonical reference, source organization, component ownership/tree, Server/Client ownership, data/state flow, contracts, UI states, responsive/accessibility requirements, cache/navigation constraints, GitNexus evidence, allowlist, risks, and dependency order.
2. Use `gherkin-authoring` when observable acceptance is clearer in scenarios; cover relevant happy paths, edges, failures, and permission behavior.
3. Allowed file tags are `[NEW]`, `[MODIFY]`, `[DELETE]`, `[TEST]`, `[WIRE]`, and `[EXISTING]`; `[EXISTING]` is reference-only.
4. Task constraints record canonical reference, ownership, reuse classification, Server/Client boundary, data/state flow, contracts, routing, cache, shared boundaries, UI states, responsive behavior, and accessibility.
5. Every acceptance requirement maps to browser or command evidence across required viewports, states, interactions, console/network checks, screenshots, and recordings.
6. A task must not modify `[EXISTING]` or undeclared files. Phase verification uses browser and command evidence.
7. Approval presentation includes canonical reference, UI direction, source structure, inventory/reuse classifications, contracts, and viewport/state matrix.
8. After shared approval gate succeeds, direct user to:

```text
/only-one-implement-fe <change-name>
```
