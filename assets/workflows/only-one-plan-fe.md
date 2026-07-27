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

1. Check OpenSpec CLI, MCP `gitnexus`, and skills `openspec-propose`, `brainstorming`, `writing-plans`, `gherkin-authoring`, and `ux-ui-max`.
2. For Next.js work, check `next-dev-loop`. Check `next-cache-components-adoption` and `next-cache-components-optimizer` when data fetching or cache boundaries change. Check `next-partial-prefetching-adoption` when navigation or prefetch behavior changes.
3. Check `c4-diagrams` when shared design-system or multi-layout boundaries change.
4. Report every unavailable required dependency and stop. Do not silently skip, rename, or replace dependencies.

## Canonical reference gate

**This gate runs immediately after dependency preflight, before any other step.**

1. Verify that `--ref` was provided and the path exists on disk.
   - If `--ref` is missing: stop and output → `Error: --ref <path> is required. Provide a canonical doc, folder, or file. Do not proceed without it.`
   - If the path does not exist: stop and output → `Error: --ref path "<value>" not found. Verify the path and retry.`
2. Read the referenced content:
   - If it is a file: read and summarize its structure (page layout, components used, data fetching pattern, key conventions).
   - If it is a folder: read the entry-point file (e.g. `page.tsx`, `index.tsx`) and direct children; summarize the same.
   - If it is a markdown doc: read and extract the code pattern it describes.
3. Record the resolved canonical reference as **`<canonical-ref>`** — its path, type (file / folder / doc), and extracted structural summary. This becomes the anchor for all planning decisions.
4. Do not modify, generate, or infer requirements from `<canonical-ref>`. It is read-only reference material.

## Bounded discovery and framework detection

Run this phase right after the canonical reference gate, before UI design.

1. Confirm package manifest, Next.js and React versions, App or Pages Router, framework config, layouts, aliases, browser tooling, design system, i18n, and existing conventions before applying framework guidance.
2. Use GitNexus queries, symbol context, routes, and impact analysis. Do not recursively list, grep, read, or scan the entire repository.
3. Target 2-5% of codebase: affected routes, layouts, components, hooks, typed API clients, shared contracts, tokens, i18n keys, and colocated tests.
4. Exclude root config, middleware, environment, and bootstrapping files unless approved intent requires infrastructure changes.
5. Record exact blast-radius allowlist: file, symbol, ownership, direct dependencies, and confidence.
6. Stop when scope exceeds budget. If GitNexus is stale or incomplete, report limitation and use targeted reads only.
7. Invoke `c4-diagrams` for shared design-system contracts, new component patterns, or non-obvious multi-layout boundaries.
8. If a backend endpoint or contract change is required, record an out-of-scope dependency for `/only-one-plan-be`.

### Component and design system inventory

Before UI design begins, produce a **component inventory** from the design system and existing codebase:

1. List all existing custom components relevant to the feature (name, file path, accepted props/variants).
2. List color tokens, spacing tokens, typography scales, and any theme/CSS variable conventions in use.
3. List icon sets, illustration assets, and animation utilities already available.
4. Apply a strict **reuse-first rule** when proposing components in the plan:
   - `[USE]` — use the existing component as-is.
   - `[EXTEND]` — add a prop or variant; document the backward-compatible change.
   - `[NEW]` — create a new component; must be explicitly justified (no existing component can cover the need).
5. Never duplicate color values, spacing values, or typography definitions inline. Always reference existing tokens.

## UI design and direction

This phase runs after bounded discovery. Its purpose is to understand what to build and agree on visual direction.

1. Invoke `brainstorming` for macro-brainstorming. Resolve actors, outcomes, UI behavior, constraints, acceptance criteria, non-goals, risks, and unknowns.
2. Explore and map the current UI state relevant to the change:
   - Identify existing screens, flows, and components that the new feature connects to or replaces.
   - Collect visual references: screenshots, design files, or links the user provides.
   - Sketch the shortest user flow in plain text or ASCII. Do not implement anything.
3. Invoke `ux-ui-max` to evaluate and refine the proposed UI direction. Ensure it aligns with the project's established visual language, accessibility requirements, and `<canonical-ref>`.
4. Produce a **directory structure plan** for all files involved in the change. Use a tree format and annotate every file with its status and a one-line description of its purpose:
   - `[EXISTING]` — file already exists, no changes needed.
   - `[IMPROVE]` — file already exists, specific improvements required (describe briefly).
   - `[NEW]` — file does not exist and will be created.

   Example format:
   ```
   src/app/orders/
   ├── page.tsx                    [EXISTING] Server component — entry point, no changes
   ├── _components/
   │   ├── OrderTable.tsx          [EXISTING] Data table — add pagination prop
   │   ├── OrderFilter.tsx         [NEW]      Filter panel for status and date range
   │   └── OrderStatusBadge.tsx   [IMPROVE]  Extend to support new "cancelled" variant
   └── _hooks/
       └── useOrderFilter.ts       [NEW]      Client hook managing filter state
   ```

   Rules:
   - Cover every file that will be touched or created. Do not omit files to keep the list short.
   - For `[IMPROVE]` entries, state what changes, not just that it changes.
   - Do not list files outside the approved blast-radius.
   - Apply the reuse-first `[USE]` / `[EXTEND]` / `[NEW]` classification from the component inventory to every component entry.

5. Present the UI direction summary and directory structure plan to the user. Wait for explicit approval of both before proceeding.
   - If either is rejected or needs revision, iterate the relevant steps before continuing.
   - Do not create OpenSpec artifacts while UI direction or directory structure is unresolved.

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
   - Tasks in this layer are independent of each other and can reference the same canonical ref but must not write to each other's files.

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
