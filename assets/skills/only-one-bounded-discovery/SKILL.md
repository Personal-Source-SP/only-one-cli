---
name: only-one-bounded-discovery
description: Perform bounded codebase discovery using GitNexus within a strict 2-5% scope budget. Produces a blast-radius allowlist. Use during planning phases for both BE and FE changes before designing tasks or writing artifacts.
---

Bounded discovery establishes the exact set of files and symbols that will be affected. It runs after the canonical reference gate (FE) or brainstorming (BE), and before any task decomposition or artifact content is written.

## Core protocol (all variants)

1. Use GitNexus queries, symbol context, routes, and impact analysis to locate relevant entry points and relationships. Do not recursively list, grep, read, or scan the entire repository.
2. Start from feature terms and known symbols. Expand only to direct dependencies.
3. **Scope budget:** Target 2–5% of the codebase. Stop and ask for a narrower capability when candidate scope exceeds budget. Do not expand automatically.
4. **Exclusions:** Do not include root config, middleware, bootstrapping files, or environment files unless the approved intent explicitly requires infrastructure changes.
5. Record the exact **blast-radius allowlist** for every affected item:
   - File path
   - Symbol name and role
   - Direct dependencies
   - Confidence level
6. If GitNexus is stale or incomplete: report the limitation and use only targeted reads for already-identified files. Do not claim complete impact coverage.
7. Stop when scope exceeds budget. Do not silently expand.

## BE variant additions

Apply these when the change targets a NestJS backend:

1. **Schema-first check:** Before any DTO or endpoint design, determine whether tables, Prisma models, TypeORM entities, migrations, indexes, relations, or cascades change. Analyze affected schema symbols and downstream consumers first.
2. Target NestJS-specific symbols: controllers, services, DTOs, guards, interceptors, pipes, decorators, shared contracts, and colocated `*.spec.ts` files.
3. For each source file, check for a colocated spec. Note it in the allowlist.
4. If multi-module relationships are non-obvious, invoke `c4-diagrams`.
5. If UI work is also required, record it as an out-of-scope dependency in resolved frontend OpenSpec artifacts.

## FE variant additions

Apply these when the change targets a Next.js or React frontend:

1. **Framework detection first:** Confirm package manifest, Next.js and React versions, App or Pages Router, framework config, layouts, path aliases, browser tooling, design system conventions, and i18n setup.
2. Target FE-specific symbols: affected routes, layouts, components, hooks, typed API clients, shared contracts, tokens, i18n keys, and colocated tests.
3. Invoke `c4-diagrams` when shared design-system contracts, new component patterns, or non-obvious multi-layout boundaries are involved.
4. If a backend endpoint or contract change is required, record it as an out-of-scope dependency in resolved backend OpenSpec artifacts.
5. After core discovery, invoke `only-one-component-inventory` to build the component and design system inventory for the affected area.

## Output

Record and present:
- Blast-radius allowlist (complete, per item)
- Any out-of-scope dependencies for other workflows
- GitNexus freshness status at time of discovery
