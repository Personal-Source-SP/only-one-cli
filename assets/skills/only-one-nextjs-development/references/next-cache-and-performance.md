# Next.js Caching & Performance Reference

## Caching & Performance Optimization Standards (Next.js 16+)

### 1. Caching & Freshness Strategies
- Understand Next.js caching layers (Router Cache, Full Route Cache, Data Cache).
- Apply `"use cache"` or `revalidate` intervals strictly to static or slow-changing datasets.

### 2. Cache Components & Partial Prerendering (PPR)
- Applicable to Next.js App Router applications.
- Defer request-time dynamic data fetching behind granular `<Suspense>` boundaries.
- Never access request-scoped headers/cookies inside invalid `"use cache"` scopes.
- Safely configure `cacheComponents` and PPR without breaking route-level revalidation guarantees.

### 3. Optimization for Instant Navigation
- Optimize Cache Component boundaries to deliver instant client navigation.
- Audit Static vs Dynamic execution boundaries to maximize prerender coverage.
