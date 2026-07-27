---
description: Shape and approve a Next.js or React frontend change through OpenSpec artifacts, UI design, bounded discovery, and TDD-ready micro-tasks.
---

## Input

```text
/only-one-plan-fe <feature intent or change name>
```

## Dependency preflight

1. Check OpenSpec CLI, MCP `gitnexus`, and skills `openspec-propose`, `brainstorming`, `writing-plans`, `gherkin-authoring`, and `ux-ui-max`.
2. Check workflow `only-one-ui` as the UI discovery and evidence protocol.
3. For Next.js work, check `next-dev-loop`. Check `next-cache-components-adoption` and `next-cache-components-optimizer` when data fetching or cache boundaries change. Check `next-partial-prefetching-adoption` when navigation or prefetch behavior changes.
4. Check `architectural-decision-records` and `c4-diagrams` when shared design-system or multi-layout boundaries change.
5. Report every unavailable required dependency and stop. Do not silently skip, rename, or replace dependencies.

## Change selection and OpenSpec protocol

1. Derive kebab-case `<name>` from feature intent. If an active change may match, run `openspec list --json` and ask whether to continue it or create a change.
2. Invoke `brainstorming` for macro-brainstorming. Resolve actors, outcomes, UI behavior, constraints, acceptance criteria, non-goals, risks, and unknowns.
3. Use the `only-one-ui` discovery protocol to collect references and map current UI before approving visual direction. Do not execute UI implementation in planning.
4. After design approval, invoke `openspec-propose`:
   - Create a missing change with `openspec new change "<name>"`.
   - Run `openspec status --change "<name>" --json`.
   - Read `schemaName`, `planningHome`, `changeRoot`, `artifactPaths`, `actionContext`, `artifacts`, and `applyRequires`.
   - For each ready artifact, run `openspec instructions <artifact-id> --change "<name>" --json`.
   - Use `resolvedOutputPath`, `template`, `instruction`, `rules`, and dependencies. Do not assume fixed paths, artifact names, or schema.
5. Continue in dependency order until every artifact in `applyRequires` is done. Do not create `docs/plans/...` or another task tracker.

## Bounded discovery and framework detection

1. Confirm package manifest, Next.js and React versions, App or Pages Router, framework config, layouts, aliases, test scripts, browser tooling, design system, i18n, and existing conventions before applying framework guidance.
2. Use GitNexus queries, symbol context, routes, and impact analysis. Do not recursively list, grep, read, or scan the entire repository.
3. Target 2-5% of codebase: affected routes, layouts, components, hooks, typed API clients, shared contracts, tokens, i18n keys, and colocated tests.
4. Exclude root config, middleware, environment, and bootstrapping files unless approved intent requires infrastructure changes.
5. Record exact blast-radius allowlist: file, symbol, ownership, direct dependencies, confidence, and colocated test.
6. Stop when scope exceeds budget. If GitNexus is stale or incomplete, report limitation and use targeted reads only.
7. Invoke ADR/C4 dependencies for shared design-system contracts, new component patterns, or non-obvious multi-layout boundaries.
8. If a backend endpoint or contract change is required, record an out-of-scope dependency for `/only-one-plan-be`.

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
6. Task artifact contains ordered micro-tasks. Each task names one behavior, one or two source files and direct test, exact symbols, dependencies, RED, GREEN, REFACTOR commands/evidence, UI states/viewports, review, and checkpoint commit.
7. Prevent independent tasks from writing same files. Use `writing-plans` task-sizing principles inside OpenSpec artifact only.

## Approval gate

1. Do not modify product source, tests, dependencies, configuration, or data.
2. Run `openspec status --change "<name>"` and verify all `applyRequires` artifacts exist at resolved paths.
3. Present change location, artifact status, allowlist, UI direction, contracts, viewport evidence plan, assumptions, risks, and unresolved questions.
4. Wait for explicit user approval covering artifacts, scope, UI direction, contracts, and verification.
5. Update resolved artifacts for revisions, rerun status, and require approval again.
6. After approval, direct user to:

```text
/only-one-implement-fe <change-name>
```
