---
description: Execute an approved frontend plan (Next.js/React) through isolated subagents, mandatory TDD, review, and integration verification.
---

## Input

```text
/only-one-implement-fe <plan-path>
```

## Dependency preflight

1. Check whether MCP `gitnexus` and Superpowers skills `subagent-driven-development`, `test-driven-development`, `requesting-code-review`, and `verification-before-completion` are available.
2. Check whether skill `ux-ui-max` is available. This skill is mandatory for every frontend implementation. If unavailable, stop and report the blocker.
3. Check whether skills `next-cache-components-adoption` and `next-partial-prefetching-adoption` are available. These are required for any plan that touches data-fetching or navigation.
4. If a required dependency is unavailable, report each blocker and stop. Ask the user to install it or approve an explicit alternative.
5. Do not silently skip, rename, or replace a required dependency.

## Approval and scope gate

1. Read the selected plan. Do not read feature documents outside the plan unless it links them explicitly.
2. Confirm the user approved this exact plan, blast-radius allowlist, UI direction, contracts, risks, and verification scope.
3. Require acceptance criteria, ordered micro-tasks, exact files and symbols, direct test files, dependencies, and verification commands.
4. If the plan is missing required information or conflicts with current code, stop and request a plan update. Do not infer missing requirements.
5. Use GitNexus only to verify listed symbols, direct relationships, and current impact. Do not restart broad discovery.
6. If the index is stale or impact exceeds the approved allowlist, report the scope change and wait for explicit approval.

## Subagent orchestration

1. Invoke `superpowers:subagent-driven-development`.
2. The coordinating agent must not implement a micro-task. Assign every micro-task to a fresh subagent.
3. Give each subagent only:
   - One task and its acceptance criteria.
   - One or two permitted source files and the direct test file (`*.test.tsx` or `*.test.ts`).
   - Exact symbols permitted for modification.
   - Required RED, GREEN, REFACTOR, and verification steps (explicitly instruct the subagent NOT to commit any code).
   - Relevant UI contract excerpts and dependency outputs.
4. Do not give frontend subagents backend source context. Shared-contract and integration tasks may receive only the contract files named by the plan.
5. Run dependent tasks sequentially. Run tasks in parallel only when the plan marks them independent and they do not write the same files.
6. Review each subagent report and diff before starting a dependent task.
7. If a subagent needs an unlisted file, symbol, dependency, or contract change, it must stop and return a scope-change request. The coordinating agent must not approve its own scope expansion.

## Mandatory TDD task protocol

Each implementation subagent must invoke `superpowers:test-driven-development` using `vitest` or `jest` + `@testing-library/react` as established in the project, and provide evidence for all stages:

1. **RED**
   - Add the smallest behavioral component or integration test.
   - Run the focused test and capture the expected failure.
   - Confirm failure comes from missing behavior, not syntax, environment, fixture, or unrelated errors.
   - If the new test passes before implementation, stop and correct the test or plan.
2. **GREEN**
   - Write the minimum strict TypeScript change needed to satisfy the test.
   - Run the focused test and capture passing output.
3. **REFACTOR**
   - Improve naming, duplication, composition, and type safety without changing behavior.
   - Re-run the focused test and relevant neighboring tests.
4. Do not skip tests, weaken assertions, accept meaningless snapshots, use `any` without documented necessity, or test implementation details when behavior can be tested.
5. Return changed files, diff summary, commands, RED failure reason, GREEN result, REFACTOR result, and remaining risks. Do not create any git commits.

## UI implementation constraints

All subagents implementing UI tasks must load and follow `ux-ui-max` before writing any UI code. In addition:

1. Preserve existing architecture, ownership, naming, token layers, and composition patterns unless structural change is explicitly approved in the plan.
2. Prefer existing Ant Design components when installed and suitable. Reuse current theme tokens and component patterns.
3. Prefer an equivalent Ant Design primitive over recreating behavior with Tailwind utilities when it meets requirements.
4. Use Tailwind CSS for styling, responsive utilities, and cases without a suitable Ant Design equivalent.
5. Reuse established components, tokens, and assets. Do not use placeholders.
6. Cover relevant loading, empty, error, success, disabled, and permission states.
7. Implement mobile, tablet, and desktop behavior including layout, overflow, typography, spacing, controls, and touch interactions.
8. Use semantic HTML, accessible names, keyboard navigation, visible focus, sufficient contrast, and reduced-motion support.
9. Route UI text through existing i18n keys when present. Do not introduce hardcoded strings.
10. Classify and respect Server/Client component boundaries as defined in the plan. Do not add `"use client"` without explicit plan approval.
11. Apply any caching or prefetching constraints identified during planning (`next-cache-components-adoption`, `next-partial-prefetching-adoption`). Do not alter Cache Component or prefetch configuration without plan approval.

## Review and integration

1. After all task subagents finish, inspect the complete `git diff`. Do not scan the full source tree.
2. Invoke `superpowers:requesting-code-review` for task-level changes and the integrated change.
3. Resolve blocking review findings through new bounded subagent tasks using the same TDD protocol.
4. Verify UI loading, empty, error, success, disabled, permission, responsive, accessibility, and Server/Client boundaries required by the plan.
5. Run focused tests first, then repository typecheck, lint or format check, build when required, and full test suite using existing scripts.
6. Run GitNexus impact analysis again for changed public symbols and contracts. If impact exceeds approved scope, stop and request approval before more changes.
7. Invoke `superpowers:verification-before-completion`. Do not claim completion without fresh command evidence.

## Completion report

1. Mark plan tasks complete only when their evidence exists.
2. Report changed files, subagent task outcomes, RED/GREEN/REFACTOR evidence, review findings and resolutions, integration results, checks not run, and remaining risks.
3. If any required check cannot run, report the blocker and exact manual verification steps. Do not report the feature as fully verified.
