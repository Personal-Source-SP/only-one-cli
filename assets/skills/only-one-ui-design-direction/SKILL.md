---
name: only-one-ui-design-direction
description: Lead the UI design phase for a frontend change — brainstorm feature intent, map the current UI state, evaluate direction with ux-ui-pro-max, and produce the approved directory structure plan. Use before creating OpenSpec artifacts for frontend changes.
---

This phase runs after bounded discovery and before OpenSpec artifact authoring. Its purpose is to understand what to build and agree on visual direction and file structure before any artifact is written.

## Step 1 — Brainstorming

Invoke `brainstorming` for macro-brainstorming. Resolve:
- Actors and their goals
- Desired outcomes and observable behaviors
- UI behavior and interaction model
- Constraints and non-goals
- Acceptance criteria
- Risks and unknowns

Do not start implementing or writing OpenSpec artifacts during this step.

## Step 2 — Map current UI state

Explore and map the parts of the current UI that the new feature connects to, extends, or replaces:
- Identify existing screens, flows, and components involved.
- Collect visual references provided by the user: screenshots, design files, or links.
- Sketch the shortest user flow in plain text or ASCII. Do not implement anything.

## Step 3 — Evaluate with ux-ui-pro-max

Invoke `ux-ui-pro-max` to evaluate and refine the proposed UI direction. Ensure it aligns with:
- The project's established visual language and accessibility requirements.
- The structural patterns from `<canonical-ref>`.
- The component inventory and reuse-first decisions from `only-one-component-inventory`.

## Step 4 — Directory structure plan

Produce a **directory structure plan** covering every file that will be touched or created. Use a tree format and annotate every file with its status and a one-line description of its purpose:

- `[EXISTING]` — file already exists; no changes needed in this feature.
- `[IMPROVE]` — file already exists; specific improvements are required (describe what changes, not just that it changes).
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
- Cover **every** file that will be touched or created. Do not omit files to keep the list short.
- For `[IMPROVE]` entries, state what changes specifically, not just that it changes.
- Do not list files outside the approved blast-radius allowlist.
- Apply the reuse-first `[USE]` / `[EXTEND]` / `[NEW]` classification from the component inventory to every component entry in the tree.

## Step 5 — Approval gate

Present both the UI direction summary and the directory structure plan to the user. Wait for explicit approval of **both** before proceeding to OpenSpec artifact authoring.

- If either the UI direction or the directory structure plan is rejected or needs revision, iterate the relevant steps before continuing.
- Do not create OpenSpec artifacts while UI direction or directory structure is unresolved.
- The approved directory structure plan is the structural contract for the task list. Any deviation during implementation requires a plan revision and re-approval.
