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
3. If a required dependency is unavailable, report each blocker and stop. Ask the user to install it or approve an explicit alternative.
4. Do not silently skip, rename, or replace a required dependency.

## Discovery budget

1. Define feature intent, actors, expected outcome, constraints, acceptance criteria, and unknowns before inspecting code.
2. Use GitNexus queries, symbol context, routes, and impact analysis to locate relevant entry points and relationships.
3. Start from feature terms and known symbols. Do not recursively list, grep, read, or scan the entire repository.
4. Target a working set of 2–5% of the codebase. Prioritize direct NestJS controllers or endpoints, DTOs, services, Next.js routes or components, shared contract types, and direct tests.
5. Record a blast-radius allowlist containing exact files and symbols, their role, direct dependencies, and confidence.
6. If the candidate scope exceeds the budget, stop and ask the user to narrow the capability. Do not expand scope automatically.
7. If the GitNexus index is stale or incomplete, report the limitation. Use only targeted reads for already identified files and do not claim complete impact coverage.

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

## Planning

1. Invoke `superpowers:brainstorming` using only feature intent, confirmed evidence, UI design, assumptions, and unknowns.
2. Resolve decisions that affect contracts, user behavior, data flow, or task boundaries. Do not guess unresolved requirements.
3. Invoke `superpowers:writing-plans` to create the plan file. You MUST save the plan exactly at `docs/plans/<DD-MM-YYYY>/<feature-slug>.md` (using the current local date for the path, unless the user supplies another path). Do NOT use `docs/superpowers/plans/` or any other directory specified by the writing-plans skill defaults. This is a strict repository-wide constraint.
4. The plan must contain:
   - Goal, non-goals, acceptance criteria, assumptions, and risks.
   - GitNexus evidence and the exact blast-radius allowlist.
   - UI flow, states, responsive behavior, accessibility, and Server/Client split when applicable.
   - Dependency graph and ordered micro-tasks.
   - Verification commands and integration checks.
5. Each micro-task must take approximately 2–5 minutes and name:
   - One behavior or outcome.
   - One or two source files plus the direct test file.
   - Exact symbols permitted for modification.
   - RED test and expected failure reason.
   - Minimal GREEN change.
   - REFACTOR and focused verification.
   - Dependencies and completion evidence (explicitly omit any commit steps, as changes should remain uncommitted until final integration).
6. Split backend and frontend work into separate tasks. Add an explicit integration task for shared DTO or API contracts.
7. Ensure independent tasks do not write the same files. Mark dependency order when tasks cannot run in parallel.

## Approval gate

1. Do not modify product source code, tests, dependencies, configuration, migrations, or data in this workflow.
2. Present the plan path, bounded file list, assumptions, risks, and unresolved questions.
3. Wait for explicit user approval. Approval applies only to the stated plan, allowlist, contracts, and verification scope.
4. After approval, direct the user to run:

```text
/only-one-implement <plan-path>
```
