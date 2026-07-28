---
name: react-next-development
description: Use when creating or modifying React or Next.js components, hooks, pages, layouts, client/server boundaries, or frontend data fetching.
---

# React and Next.js Development

## Next.js

- MUST default to React Server Components (RSC).
- MUST add `'use client'` only for hooks, browser APIs, or event listeners.
- MUST respect server/client boundaries. NEVER expose server-only code, secrets, or private data to client bundles.
- MUST fetch data in Server Components or via React Query/SWR on client.
- MUST NOT call NestJS API directly inside Client Components without type-safe fetch wrappers or SDK.
- MUST invoke matching installed Next.js skills when triggers apply (`next-dev-loop`, `next-cache-components-adoption`, `next-cache-components-optimizer`, `next-partial-prefetching-adoption`).

## Components and Hooks

- MUST use React hooks (`useMemo`, `useCallback`, `useEffect`) when they provide clear value.
- MUST organize `.tsx` declarations: Constants, State, Memos, Effects, Callbacks, JSX.
- MUST sort lines inside role group from shorter to longer and leave one empty line between groups.
- MUST split components beyond 200 lines.
- MUST provide stable `key` for every repeated list item.
- MUST keep state local to component or subtree. AVOID global state unless required.
- MUST route user-visible text through existing i18n system.
- AVOID unnecessary comments. Comment only complex or ambiguous logic.
