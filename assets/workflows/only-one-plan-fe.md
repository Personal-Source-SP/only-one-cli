---
description: Shape and approve a Next.js or React frontend change through OpenSpec artifacts, canonical page anchoring, design system inventory, component-reuse-first planning, and implementation-ready micro-tasks.
---

## Input

```text
/only-one-plan-fe <feature intent or change name> --ref <path-to-canonical-doc-or-folder-or-file>
```

`--ref` is **mandatory**. It must point to one of:
- A markdown document describing the code pattern/structure to follow (e.g. `docs/patterns/page-template.md`)
- An existing source folder that represents the canonical page structure (e.g. `src/app/invoices/`)
- A single source file as the structural reference (e.g. `src/app/invoices/page.tsx`)

If `--ref` is absent or the path does not exist, stop immediately with:
> **Error:** `--ref <path>` is required. Provide a doc, folder, or file that describes the canonical code pattern to follow. Do not proceed without it.

## Dependency preflight

1. Check OpenSpec CLI, MCP `gitnexus`, and skills `only-one-canonical-ref-gate`, `only-one-bounded-discovery`, `only-one-component-inventory`, `only-one-ui-design-direction`, `openspec-propose`, `brainstorming`, `writing-plans`, `gherkin-authoring`, and `ux-ui-max`.
2. For Next.js work, check `next-dev-loop`. Check `next-cache-components-adoption` and `next-cache-components-optimizer` when data fetching or cache boundaries change. Check `next-partial-prefetching-adoption` when navigation or prefetch behavior changes.
3. Check `c4-diagrams` when shared design-system or multi-layout boundaries change.
4. Report every unavailable required dependency and stop. Do not silently skip, rename, or replace dependencies.

## Canonical reference gate

Invoke `only-one-canonical-ref-gate --ref <value>`. This validates the path, reads the content, and records **`<canonical-ref>`** as the immutable anchor for all planning decisions.

## Bounded discovery

Invoke `only-one-bounded-discovery` (FE variant). This detects the framework, produces the blast-radius allowlist, and — as part of the FE variant — invokes `only-one-component-inventory` (Mode A) to build the component and design system inventory with reuse-first classifications.

## UI design and direction

Invoke `only-one-ui-design-direction`. This brainstorms the feature, maps current UI state, evaluates direction with `ux-ui-max`, produces the annotated directory structure plan, and gates on explicit user approval of both UI direction and directory structure before continuing.

## OpenSpec change and artifact authoring

Run this phase only after UI direction and directory structure are explicitly approved.

1. Derive kebab-case `<name>` from feature intent. If an active change may match, run `openspec list --json` and ask whether to continue it or create a new change.
2. Invoke `openspec-propose`:
   - Create a missing change with `openspec new change "<name>"`.
   - Run `openspec status --change "<name>" --json`.
   - Read `schemaName`, `planningHome`, `changeRoot`, `artifactPaths`, `actionContext`, `artifacts`, and `applyRequires`.
   - For each ready artifact, run `openspec instructions <artifact-id> --change "<name>" --json`.
   - Use `resolvedOutputPath`, `template`, `instruction`, `rules`, and dependencies. Do not assume fixed paths, artifact names, or schema.
3. Continue in dependency order until every artifact in `applyRequires` is done. Do not create `docs/plans/...` or another task tracker.

## Next.js and React planning constraints

1. Default to a Server Component for server data access, static composition, and non-interactive rendering. Use a Client Component only for state, effects, event handlers, browser APIs, or client-only libraries.
2. Preserve server/client security boundaries. Never expose server-only code, secrets, or private data in client bundles.
3. Fetch on server where established; use project-standard typed wrappers or SDKs for client fetching. Never duplicate backend payload types manually; consume exported contracts or generated OpenAPI or Zod schemas.
4. Record Cache Components and partial-prefetching constraints when their triggers apply. Do not prescribe migration without evidence and approval.
5. Prefer local state. Add wider state only with demonstrated cross-boundary need.
6. Use hooks only when they provide clear value. Require stable keys for repeated items and split components when responsibilities become difficult to understand or test.
7. Preserve existing ownership, naming, composition, design-system primitives, tokens, assets, and i18n conventions.

## UI artifact requirements

Fit requirements into OpenSpec-resolved artifacts; do not invent unsupported files:

1. Proposal/design/spec artifacts capture approved reference or visual direction, shortest user flow, semantic DOM, component ownership/tree, Server/Client classification, data flow, contracts, cache/navigation constraints, and GitNexus allowlist.
2. Specify loading, empty, error, success, disabled, and permission states when relevant.
3. Specify mobile, tablet, and desktop behavior plus accessibility: landmarks, headings, labels, keyboard, focus, contrast, and reduced motion.
4. Define viewport/state/interaction matrix and required browser console, network, screenshot, or recording evidence.
5. Use `gherkin-authoring` for happy path, edge case, and failure or permission acceptance criteria in domain language.
6. Task artifact is derived directly from the **approved directory structure plan**. Tasks are split into two layers executed in order:

   **Layer 1 — Build individual pieces** (one task per file marked `[NEW]` or `[IMPROVE]`):
   - Each `[NEW]` component, hook, or util gets its own isolated task.
   - Each `[IMPROVE]` file gets its own task describing only the approved change.
   - `[EXISTING]` files with no change are not tasked.
   - Tasks in this layer are independent of each other and must not write to each other's files.

   **Layer 2 — Wire and assemble** (tasks that compose Layer 1 outputs into the full feature):
   - Compose individual components into sections and pages.
   - Connect hooks to components and data sources.
   - Wire routing, layout slots, and entry-point files.
   - Apply loading, empty, error, success, disabled, and permission states across the assembled feature.
   - Tasks in this layer depend on Layer 1 being complete.

   Each task (both layers) must also state:
   - Which file from the directory structure plan it implements, and its `[NEW]` / `[IMPROVE]` / `[WIRE]` status.
   - The canonical ref pattern it follows.
   - Browser evidence required (viewports, UI states, interactions to verify).

7. Prevent independent tasks from writing the same file. Assign each file to exactly one task.

## Approval gate

1. Do not modify product source, tests, dependencies, configuration, or data.
2. Run `openspec status --change "<name>"` and verify all `applyRequires` artifacts exist at resolved paths.
3. Present:
   - Change location, artifact status, allowlist, UI direction, assumptions, risks, and unresolved questions.
   - **Canonical reference** (`<canonical-ref>` path and structural summary).
   - **Directory structure plan** with `[EXISTING]` / `[IMPROVE]` / `[NEW]` annotation and reuse-first classification for every component.
4. Wait for explicit user approval covering artifacts, scope, UI direction, directory structure, and contracts.
5. Update resolved artifacts for revisions, rerun status, and require approval again.
6. After approval, direct user to:

```text
/only-one-implement-fe <change-name>
```
