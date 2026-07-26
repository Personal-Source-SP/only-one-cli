---
description: Discover a bounded feature scope, design affected UI, and produce an approved micro-task plan.
---

## Input

```text
/only-one-plan <feature intent>
```

## Dependency preflight

1. Check whether MCP `gitnexus` and Superpowers skills `brainstorming` and `writing-plans` are available.
2. Determine whether the feature includes Next.js, React, web, or mobile UI. If it does, also check skill `ux-ui-max`.
3. If the feature involves Server Components, data-fetching strategy, or caching behavior in Next.js, also check skill `next-cache-components-adoption`. If the feature adds or modifies `<Link>` navigation or prefetching behavior, also check skill `next-partial-prefetching-adoption`. Record any relevant constraints from these skills in the plan; do not apply migration steps in this workflow.
4. If a required dependency is unavailable, report each blocker and stop. Ask the user to install it or approve an explicit alternative.
5. Do not silently skip, rename, or replace a required dependency.

## Discovery budget

1. Define feature intent, actors, expected outcome, constraints, acceptance criteria, and unknowns before inspecting code.
2. **Schema impact check (mandatory):** Determine immediately whether the feature requires any change to the data schema (database tables, Prisma models, TypeORM entities, migrations, etc.). If yes, locate and analyze all affected entity/model files before defining any DTO, service contract, or UI structure. Any schema change must be isolated into a dedicated micro-task and executed first -- no other task may begin until the schema task is complete and verified.
3. Use GitNexus queries, symbol context, routes, and impact analysis to locate relevant entry points and relationships.
4. Start from feature terms and known symbols. Do not recursively list, grep, read, or scan the entire repository.
5. Target a working set of 2-5% of the codebase. Prioritize direct data-access layers (Prisma/TypeORM models, migration files), service and business-logic files, API routes or NestJS controllers/DTOs, Next.js routes or components, shared contract types, and colocated test files.
6. **Config blacklist (default exclusions):** Unless the feature intent explicitly requires infrastructure-level changes, do not include the following in the blast-radius allowlist: `next.config.*`, `tailwind.config.*`, `tsconfig.*`, global middleware files, environment config files (`.env*`), or any root-level bootstrapping file. If a scanned file falls into this category, exclude it and note the reason.
7. Record a blast-radius allowlist containing exact files and symbols, their role, direct dependencies, and confidence.
8. If the candidate scope exceeds the budget, stop and ask the user to narrow the capability. Do not expand scope automatically.
9. If the GitNexus index is stale or incomplete, report the limitation. Use only targeted reads for already identified files and do not claim complete impact coverage.
10. **Colocated test discovery:** For every source file in the allowlist, first search for a test file in the same directory (e.g., `button.test.tsx` next to `button.tsx`, `user.service.spec.ts` next to `user.service.ts`). Record each colocated test file found. Only plan to create a new test file if the source file has no existing test.
11. **Architectural impact check:** If the feature changes a shared API contract, introduces a new technology or pattern, or affects more than one architectural boundary (e.g., spans multiple services, modifies a shared library), invoke `architectural-decision-records` to capture the decision before writing the plan. If the impact crosses more than one container or service boundary and the relationships are non-obvious, invoke `c4-diagrams` first to visualize the affected boundaries. Include the resulting ADR reference and any diagram in the plan.

## UI design when applicable

1. Load and follow `ux-ui-max` before proposing UI changes.
2. Map the current page, layout, design-system primitives, tokens, i18n keys, responsive patterns, and direct component tests from the bounded working set.
3. Define the shortest user flow and semantic DOM structure.
4. Specify mobile, tablet, and desktop behavior plus loading, empty, error, success, disabled, and permission states when relevant.
5. Specify accessibility behavior: landmarks, headings, labels, keyboard interaction, focus, contrast, and reduced motion.
6. Classify each affected Next.js component:
   - Use a Server Component for server data access, static composition, and non-interactive rendering.
   - Use a Client Component only for state, effects, event handlers, browser APIs, or client-only libraries.
7. Reuse current components, theme tokens, assets, and patterns. Do not introduce a new design system or placeholder content.
8. Present the UI direction and unresolved product decisions before finalizing the plan.
9. If the feature introduces or modifies data-fetching in Server Components, note any Cache Components constraints identified in Dependency preflight (skill `next-cache-components-adoption`). If the feature adds or changes `<Link>` navigation, note any Partial Prefetching implications (skill `next-partial-prefetching-adoption`). Record both as planning constraints only; do not execute migration steps here.

## Planning

1. Invoke `superpowers:brainstorming` using only feature intent, confirmed evidence, UI design, assumptions, and unknowns.
2. Resolve decisions that affect contracts, user behavior, data flow, or task boundaries. If unresolved requirements remain after reviewing codebase evidence, invoke `grill-me` to interview the user one question at a time — providing a recommended answer for each — until every branch of the decision tree is resolved. Do not guess or proceed with ambiguous requirements.
3. Invoke `superpowers:writing-plans` to create the plan file. You MUST save the plan exactly at `docs/plans/<DD-MM-YYYY>/<feature-slug>.md` (using the current local date for the path, unless the user supplies another path). Do NOT use `docs/superpowers/plans/` or any other directory specified by the writing-plans skill defaults. This is a strict repository-wide constraint.
4. The plan must contain:
   - Goal, non-goals, and risks.
   - Acceptance criteria written as Gherkin scenarios using `gherkin-authoring`. Express observable business behavior in domain language; keep UI mechanics and implementation details out of the scenario steps. Use `Scenario Outline` with `Examples` for behaviors that vary only by data. Include at minimum: the happy path, one edge case, and one failure/error case.
   - Assumptions (mark any unverified assumption as `Unknown`).
   - GitNexus evidence and the exact blast-radius allowlist.
   - Schema impact analysis (affected entities/models and required migrations, or explicit confirmation that no schema change is needed).
   - ADR reference and C4 diagram if an architectural impact check was triggered (Discovery budget #11).
   - UI flow, states, responsive behavior, accessibility, and Server/Client split when applicable.
   - Next.js caching or prefetching constraints identified in Dependency preflight, if any.
   - Dependency graph and ordered micro-tasks.
   - Verification commands and integration checks.
5. Each micro-task must take approximately 2-5 minutes and name:
   - One behavior or outcome.
   - One or two source files plus the direct test file (prefer colocated test; only create new if none exists).
   - Exact symbols permitted for modification.
   - **Step 1 -- RED:** The exact test file to create or update. Write ONLY the test code and run it. Confirm it FAILS, and record the exact failure message. Do not write any implementation code in this step.
   - **Step 2 -- GREEN:** Write the minimum implementation code in the source file to make the failing test pass. Run the test again and confirm it PASSES. For NestJS services, explicitly list all mocked dependencies required.
   - **Step 3 -- REFACTOR:** Clean up code without changing behavior. Run the full test suite for the affected files and confirm all still pass.
   - Dependencies and completion evidence (explicitly omit any commit steps, as changes should remain uncommitted until final integration).
6. Separate tasks strictly by architectural layer: complete and verify all **Data/Logic tasks** (data-access, services, API routes) before creating any **UI tasks** (Client Components, page composition). Add an explicit integration task for shared DTO or API contracts. Do not write database queries or direct data-access calls inside UI components.
7. Ensure independent tasks do not write the same files. Mark dependency order when tasks cannot run in parallel.

## Approval gate

1. Do not modify product source code, tests, dependencies, configuration, migrations, or data in this workflow.
2. Present the plan path, bounded file list, assumptions, risks, and unresolved questions.
3. Wait for explicit user approval. Approval applies only to the stated plan, allowlist, contracts, and verification scope.
4. **If the user requests revisions:** Do not argue or create a new file. Immediately update the draft and **overwrite** the existing plan file at `docs/plans/<DD-MM-YYYY>/<feature-slug>.md`. After saving, explicitly notify the user that the file has been updated and ask them to review and approve again before proceeding to implementation.
5. After approval, direct the user to run:

```text
/only-one-implement <plan-path>
```
