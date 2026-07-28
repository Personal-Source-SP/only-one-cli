---
name: only-one-next-dev-loop
description: Use when verifying changed Next.js runtime behavior in a running app, including routes, React Server Components, server actions, browser interactions, or production-like UI behavior.
---

# Next.js Runtime Dev Loop

## Preconditions

1. Confirm a runnable `next dev` server and target URL.
2. Detect Next.js version, bundler, available `/_next/mcp` tools, browser tooling, authentication needs, and existing e2e conventions.
3. The full framework-aware loop requires Next.js 16.3+, Turbopack, reachable `/_next/mcp`, and project-approved browser tooling.
4. If prerequisites are missing, state the limitation. Use existing test/browser verification; do not claim equivalent framework diagnostics.

## Workflow

1. Make smallest scoped edit.
2. Check compile/runtime diagnostics through available Next.js tooling.
3. Verify target flow in a real browser: rendered content, loading/error/empty states, console errors, failed network requests, and interaction result.
4. Cross-check browser result against server logs, route diagnostics, RSC/server-action errors, and framework messages when available.
5. Preserve user login state. Pause for user when authentication is required; never request or handle credentials in chat.
6. Repeat after each meaningful behavior change. Typecheck/build alone is not runtime proof.

## Completion

- Report route/flow verified, runtime checks used, browser result, and any unavailable diagnostics.
- Capture existing project test coverage for regression when practical.
