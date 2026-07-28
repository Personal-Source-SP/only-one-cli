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

1. Check OpenSpec CLI, MCP `gitnexus`, and skills `only-one-canonical-ref-gate`, `only-one-bounded-discovery`, `only-one-component-inventory`, `only-one-ui-design-direction`, `openspec-propose`, `brainstorming`, `writing-plans`, `gherkin-authoring`, and `ux-ui-max`.
2. For Next.js work, check `next-dev-loop`. Check cache and partial-prefetching skills when data fetching, cache boundaries, navigation, or prefetch behavior may change.
3. Check `c4-diagrams` when shared design-system or multi-layout boundaries change.
4. Report every unavailable required dependency and stop. Do not silently skip, rename, or replace dependencies.

## Canonical reference gate

Invoke `only-one-canonical-ref-gate --ref <value>`. Validate and read the reference, then record `<canonical-ref>` as the immutable structural anchor for planning decisions.

## Bounded discovery and inventory

Invoke `only-one-bounded-discovery` (FE variant). Detect the framework, produce the blast-radius allowlist, and invoke `only-one-component-inventory` (Mode A) to record reusable components, design-system primitives, tokens, assets, layouts, hooks, data access, state ownership, and reuse-first classifications.

## UI direction approval

Invoke `only-one-ui-design-direction`. Map current UI state, define the shortest user flow, evaluate direction with `ux-ui-max`, and produce an annotated directory structure plan. Obtain explicit approval for UI direction and source organization before creating OpenSpec artifacts.

## Change selection and OpenSpec protocol

1. Derive a kebab-case `<name>` from feature intent. If an active change may match, run `openspec list --json`; ask whether to continue it or create a new change.
2. After UI direction and source organization approval, invoke `openspec-propose` and follow its artifact lifecycle:
    - Create a missing change with `openspec new change "<name>"`.
    - Run `openspec status --change "<name>" --json`.
    - Read `schemaName`, `planningHome`, `changeRoot`, `artifactPaths`, `actionContext`, `artifacts`, and `applyRequires`.
    - For each ready artifact, run `openspec instructions <artifact-id> --change "<name>" --json`.
    - Use returned `resolvedOutputPath`, `template`, `instruction`, `rules`, and dependencies. Do not assume fixed paths, artifact names, or schema.
3. Continue in dependency order until every artifact listed by `applyRequires` is done.
4. Treat OpenSpec-resolved artifacts as the only planning source. Do not create `docs/plans/...` or a second task tracker.

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

## OpenSpec artifact requirements

Fit these requirements into artifacts returned by OpenSpec instructions; do not invent unsupported artifact files:

1. Proposal/design/spec artifacts capture goal, non-goals, approved UI direction, canonical reference, source organization, component ownership/tree, Server/Client ownership, data/state flow, contracts, UI states, responsive/accessibility requirements, cache/navigation constraints, GitNexus evidence, allowlist, risks, and dependency order.
2. Use `gherkin-authoring` for observable acceptance criteria when it adds clarity. Cover relevant happy paths, edge cases, failure or permission behavior.
3. Organize implementation into ordered phases. Each phase must state:
    - **Phase goal:** complete user-visible or system outcome delivered by the phase.
    - **Tasks:** ordered by dependency.
    - **Phase acceptance requirements:** observable conditions required for user approval.
    - **Phase verification:** browser and command evidence required before the phase report.
4. Each task represents one complete functional outcome and must state:
    - **Main work:** concise description of the outcome to implement.
    - **Files:** every affected or referenced file with `[NEW]`, `[MODIFY]`, `[DELETE]`, `[TEST]`, `[WIRE]`, or `[EXISTING]` status.
    - **Allowed scope:** exact components, hooks, functions, routes, or bounded sections allowed for modification when known.
    - **System constraints:** canonical reference, ownership, reuse classification, Server/Client boundary, data/state flow, contracts, routing, cache, and shared-boundary constraints that affect the task.
    - **UI states:** relevant loading, empty, error, success, disabled, and permission states.
    - **Responsive and accessibility requirements:** affected viewports, semantic structure, keyboard, focus, labels, contrast, and reduced-motion behavior.
    - **Acceptance requirements:** observable conditions that must be true for the task to be accepted.
    - **Browser verification:** required viewports, states, interactions, console/network checks, screenshots, recordings, and command evidence.
5. File statuses describe operations within a task; they do not require separate component, test, or wiring tasks. Keep related components, hooks, pages, styles, tests, and wiring in one task when they deliver the same functional outcome.
6. Every acceptance requirement must map to browser or command evidence. Do not treat visual inspection alone as proof when interaction, state, accessibility, console, or network evidence is required.
7. Prevent independent tasks from writing the same files. Mark dependency order when shared-file work cannot be avoided. A task must not modify `[EXISTING]` files or undeclared files.
8. Use `writing-plans` task-right-sizing principles inside the OpenSpec task artifact; do not create its default plan path.

## Approval gate

1. Do not modify product source, tests, dependencies, configuration, or data.
2. Run `openspec status --change "<name>"` and verify all `applyRequires` artifacts exist at resolved paths.
3. Present change location, artifact status, canonical reference, UI direction, directory/file structure, component inventory and reuse classifications, phases, allowlist, contracts, UI state and viewport matrix, assumptions, risks, and unresolved questions.
4. Wait for explicit user approval covering artifacts, scope, UI direction, source organization, phases, contracts, shared boundaries, acceptance requirements, and verification.
5. Revision requests update existing resolved artifacts, rerun status, and require approval again.
6. After approval, direct user to:

```text
/only-one-implement-fe <change-name>
```
