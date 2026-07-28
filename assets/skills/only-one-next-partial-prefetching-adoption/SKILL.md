---
name: only-one-next-partial-prefetching-adoption
description: Use when enabling or migrating Next.js Partial Prefetching, setting partialPrefetching, auditing Link prefetch behavior, or resolving prefetch insights and route URL-data decisions.
---

# Partial Prefetching Adoption

## Preconditions

- Require Next.js 16.3+, App Router, and `cacheComponents: true`.
- Confirm app runs in development and production-like mode; prefetch verification is production behavior.
- Inspect `next.config`, route-level prefetch exports, `Link` usage, URL-data dependencies, and existing routing conventions.
- Require explicit user approval before enabling framework flags, running codemods, or changing prefetch scope.

## Workflow

1. Explain user-visible change: links prefetch shared App Shell, not necessarily every route's runtime data.
2. Before enabling global flag, audit `Link prefetch={true}` and decide route-by-route whether partial shell or runtime prefetch matches navigation need.
3. Use route-level prefetch configuration for staged delivery when project needs incremental adoption.
4. For routes keyed by `params` or `searchParams`, evaluate runtime-prefetch option; partial shell alone may omit required URL-specific data.
5. Run app in `next dev`, navigate real links, inspect dev overlay/log insights, and resolve each distinct current docs message.
6. Verify production-like navigation and prefetch behavior after static changes. Build alone cannot prove prefetch result.

## Completion

- Report adopted routes, intentional runtime-prefetch cases, remaining staged routes, and development plus production verification evidence.
