---
name: nextjs-development
description: Use when creating or modifying Next.js routes, pages, layouts, React Server Components, client components, server actions, or Next.js data fetching.
---

# Next.js Development

## First Gates

1. Detect App Router or Pages Router before selecting patterns.
2. Inspect project data-fetching, cache, server action, authentication, i18n, styling, and test conventions.
3. Reuse established route, component, fetch-wrapper, and error-boundary patterns.
4. Existing project conventions win when they do not weaken correctness, security, accessibility, or explicit requirements.

## App Router

- Default to React Server Components when using App Router.
- Add `'use client'` only for hooks, browser APIs, or event listeners.
- Do not import server-only code into client bundles. NEVER expose secrets or private data to clients.
- Fetch server data in Server Components or use project-approved client data layer.
- Use project type-safe API wrapper or SDK; do not couple client components to a specific backend framework.
- Define loading, error, not-found, and empty states with established Next.js conventions.

## Pages Router

- Follow existing `getServerSideProps`, `getStaticProps`, API route, and client data-fetching conventions.
- Do not apply App Router RSC rules to Pages Router code.

## Verification

- Run affected route/component tests, typecheck, lint, and format checks.
- Verify server/client boundaries, cache behavior, unauthorized access, and route loading/error states.
