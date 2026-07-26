---
description: Plan and design a frontend feature for a Next.js/React repository, covering discovery, UI direction, implementation guidelines, and an approved micro-task plan.
---

## Input

```text
/only-one-plan-fe <feature intent>
```

## Dependency preflight

1. Check whether MCP `gitnexus` and Superpowers skills `brainstorming` and `writing-plans` are available.
2. Check whether skill `ux-ui-max` is available. This skill is mandatory for every frontend feature. If unavailable, stop and report the blocker. Do not proceed without it.
3. Check whether skills `next-cache-components-adoption` and `next-partial-prefetching-adoption` are available. These are required for any feature that touches data-fetching or navigation in a Next.js app.
4. If a required dependency is unavailable, report each blocker and stop. Ask the user to install it or approve an explicit alternative.
5. Do not silently skip, rename, or replace a required dependency.

## Discovery budget

1. Define feature intent, actors, expected outcome, constraints, acceptance criteria, and unknowns before inspecting code.
2. Use GitNexus queries, symbol context, routes, and impact analysis to locate relevant entry points and relationships.
3. Start from feature terms and known symbols. Do not recursively list, grep, read, or scan the entire repository.
4. Target a working set of 2-5% of the codebase. Prioritize: Next.js routes and pages, layout and page components, design-system primitives and tokens, i18n keys, shared contract types, and colocated test files (`*.test.tsx`, `*.test.ts`).
5. **Config blacklist (default exclusions):** Unless the feature intent explicitly requires infrastructure-level changes, exclude from the blast-radius allowlist: `next.config.*`, `tailwind.config.*`, `tsconfig.*`, global middleware files, environment config files (`.env*`), and any root-level bootstrapping file. If a scanned file falls into this category, exclude it and note the reason.
6. Record a blast-radius allowlist containing exact files and symbols, their role, direct dependencies, and confidence.
7. If the candidate scope exceeds the budget, stop and ask the user to narrow the capability. Do not expand scope automatically.
8. If the GitNexus index is stale or incomplete, report the limitation. Use only targeted reads for already identified files and do not claim complete impact coverage.
9. **Colocated test discovery:** For every source file in the allowlist, first search for a test file in the same directory (e.g., `button.test.tsx` next to `button.tsx`). Record each colocated test file found. Only plan to create a new test file if the source file has no existing test.
10. **Architectural impact check:** If the feature changes a shared design-system contract, introduces a new component pattern, or affects more than one layout/page boundary, invoke `architectural-decision-records` to capture the decision before writing the plan. If the impact crosses more than one layout boundary or shared component tree, invoke `c4-diagrams` first to visualize the affected boundaries. Include the resulting ADR reference and any diagram in the plan.

## UI design

Load and follow `ux-ui-max` before proposing or implementing any UI changes. Prioritize Antigravity UI directives and existing project standards over competing guidance.

### Reference gathering

1. Ask for relevant code examples, design references, screenshots, design-system links, product documentation, similar flows, and color-token or theme configuration.
2. Map the current page and layout hierarchy, feature boundaries, component ownership, design-system layers, tokens, shared primitives, content/i18n patterns, and breakpoints from the bounded working set.
3. If references are unavailable, inspect existing UI patterns and propose a concrete direction covering layout, hierarchy, components, responsive behavior, states, and visual language.
4. Do not introduce a new color palette without explicit approval. Ground options in project evidence.
5. Wait for explicit approval before finalizing the UI direction when no approved reference exists.

### UI specification

1. Define the shortest user flow and semantic DOM structure.
2. Specify mobile, tablet, and desktop behavior plus loading, empty, error, success, disabled, and permission states.
3. Specify accessibility behavior: landmarks, headings, labels, keyboard interaction, focus, contrast, and reduced motion.
4. Classify each affected Next.js component:
   - Use a Server Component for server data access, static composition, and non-interactive rendering.
   - Use a Client Component only for state, effects, event handlers, browser APIs, or client-only libraries.
5. If the feature introduces or modifies data-fetching in Server Components, note any Cache Components constraints identified in Dependency preflight (skill `next-cache-components-adoption`). If the feature adds or changes `<Link>` navigation, note any Partial Prefetching implications (skill `next-partial-prefetching-adoption`). Record both as planning constraints only; do not execute migration steps here.
6. Present the UI direction and unresolved product decisions before finalizing the plan.

## UI implementation guidelines

These guidelines apply to all UI micro-tasks in the plan. Each subagent implementing a UI task must follow them.

1. Preserve existing architecture, ownership, naming, token layers, and composition patterns unless structural change is explicitly approved in the plan.
2. Prefer existing Ant Design components when installed and suitable. Reuse current theme tokens and component patterns.
3. Prefer an equivalent Ant Design primitive over recreating behavior with Tailwind utilities when it meets requirements.
4. Use Tailwind CSS for styling, responsive utilities, and cases without a suitable Ant Design equivalent.
5. Reuse established components, tokens, and assets. Do not use placeholders.
6. Cover relevant loading, empty, error, success, disabled, and permission states.
7. Implement mobile, tablet, and desktop behavior including layout, overflow, typography, spacing, controls, and touch interactions.
8. Use semantic HTML, accessible names, keyboard navigation, visible focus, sufficient contrast, and reduced-motion support.
9. Route UI text through existing i18n keys when present. Do not introduce hardcoded strings.

## Planning

1. Invoke `superpowers:brainstorming` using only feature intent, confirmed evidence, UI design, assumptions, and unknowns.
2. Resolve decisions that affect user behavior, component contracts, rendering strategy, or task boundaries. If unresolved requirements remain after reviewing codebase evidence, invoke `grill-me` to interview the user one question at a time -- providing a recommended answer for each -- until every branch of the decision tree is resolved. Do not guess or proceed with ambiguous requirements.
3. Invoke `superpowers:writing-plans` to create the plan file. You MUST save the plan exactly at `docs/plans/<DD-MM-YYYY>/<feature-slug>.md` (using the current local date for the path, unless the user supplies another path). Do NOT use `docs/superpowers/plans/` or any other directory. This is a strict repository-wide constraint.
4. The plan must contain:
   - Goal, non-goals, and risks.
   - Acceptance criteria written as Gherkin scenarios using `gherkin-authoring`. Express observable business behavior in domain language; keep UI mechanics out of the scenario steps. Include at minimum: the happy path, one edge case, and one failure/error case.
   - Assumptions (mark any unverified assumption as `Unknown`).
   - GitNexus evidence and the exact blast-radius allowlist.
   - ADR reference and C4 diagram if an architectural impact check was triggered (Discovery budget #10).
   - User flow, component tree, and Server/Client classification for each affected component.
   - Next.js caching or prefetching constraints identified in Dependency preflight.
   - Dependency graph and ordered micro-tasks.
   - Verification commands and integration checks.
5. Each micro-task must take approximately 2-5 minutes and name:
   - One behavior or outcome.
   - One or two source files plus the direct test file (prefer colocated test; only create new if none exists).
   - Exact symbols permitted for modification.
   - **Step 1 -- RED:** The exact test file to create or update. Write ONLY the test code (using `vitest` or `jest` + `@testing-library/react` as established in the project) and run it. Confirm it FAILS, and record the exact failure message. Do not write any implementation code in this step.
   - **Step 2 -- GREEN:** Write the minimum implementation code to make the failing test pass. Run the test again and confirm it PASSES.
   - **Step 3 -- REFACTOR:** Clean up code without changing behavior. Run the full test suite for the affected files and confirm all still pass.
   - Dependencies and completion evidence (explicitly omit any commit steps, as changes should remain uncommitted until final integration).
6. All tasks operate at the UI/component layer. Do not write database queries, direct API calls, or data-access logic inside components. If the feature requires a new API endpoint, stop and note this as an out-of-scope backend dependency that must be planned separately using `/only-one-plan-be`.
7. Ensure independent tasks do not write the same files. Mark dependency order when tasks cannot run in parallel.

## Approval gate

1. Do not modify product source code, tests, dependencies, configuration, migrations, or data in this workflow.
2. Present the plan path, bounded file list, UI direction summary, assumptions, risks, and unresolved questions.
3. Wait for explicit user approval. Approval applies only to the stated plan, allowlist, UI direction, and verification scope.
4. **If the user requests revisions:** Do not argue or create a new file. Immediately update the draft and **overwrite** the existing plan file at `docs/plans/<DD-MM-YYYY>/<feature-slug>.md`. After saving, explicitly notify the user that the file has been updated and ask them to review and approve again before proceeding to implementation.
5. After approval, direct the user to run:

```text
/only-one-implement <plan-path>
```
