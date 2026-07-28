---
name: only-one-next-cache-components-adoption
description: Use when enabling or migrating Next.js Cache Components, setting cacheComponents, resolving its validation failures, or choosing route opt-outs versus migration.
---

# Cache Components Adoption

## Preconditions

- Require Next.js 16.3+ and App Router. Do not apply to Pages Router-only projects.
- Confirm application starts with required environment and dependencies.
- Inspect `next.config`, existing route segment exports, cache directives, data access, and error conventions.
- Require explicit user approval before changing framework version, running codemods, or enabling `cacheComponents`.

## Adoption Workflow

1. Read version-matched bundled docs in `node_modules/next/dist/docs/` or current official Next.js docs.
2. Choose delivery: incremental route opt-outs first, or direct migration. Explain trade-off when user has not chosen.
3. Enable `cacheComponents` only after recording current config behavior.
4. Translate old `dynamic`, `revalidate`, and `fetchCache` behavior; do not silently delete meaningful configuration.
5. Address one route/feature at a time:
   - Move request-time reads behind smallest suitable `<Suspense>` boundary.
   - Keep synchronous IO out of module/render paths when it blocks prerendering.
   - Do not read request data inside inappropriate `"use cache"` scope.
6. Verify target route in `next dev`, browser, and final relevant `next build`.

## Completion

- Report changed routes, cache/freshness decisions, remaining opt-outs, and verification evidence.
- Do not claim adoption complete while unresolved blockers or intentionally deferred route migrations remain.
