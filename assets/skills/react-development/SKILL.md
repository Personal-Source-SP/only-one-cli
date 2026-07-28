---
name: react-development
description: Use when creating or modifying React components, hooks, state, forms, client-side data flows, or component tests outside Next.js-specific concerns.
---

# React Development

## First Gates

1. Inspect component-library, state, data-fetching, i18n, styling, and test conventions.
2. Reuse existing components, hooks, utilities, and patterns before creating new ones.
3. Existing project conventions win when they do not weaken correctness, security, accessibility, or explicit requirements.

## Components and Hooks

- Keep components focused. Split when responsibilities, independent state, or testing boundaries become unclear; 200 lines is a review signal, not a hard limit.
- Organize `.tsx`: Constants, State, Memos, Effects, Callbacks, JSX. Separate groups with one blank line.
- Use `useMemo` only for expensive work or required referential stability.
- Use `useCallback` only when stable identity has clear consumer value.
- Use `useEffect` only to synchronize with external systems; do not derive render data in effects.
- Clean up subscriptions, timers, observers, and abortable requests.
- Keep state local to component or subtree unless shared state is necessary.
- Provide stable `key` for every repeated list item.
- Route user-visible text through project i18n system.
- Avoid comments except for complex or ambiguous logic.

## Async UI

- Define loading, error, empty, disabled, and success states for asynchronous flows.
- Give failures a recovery path when retry or correction is possible.
- Preserve submitted data on recoverable form failures.

## Verification

- Run affected component/hook tests, typecheck, lint, and format checks.
- Verify keyboard interaction, error states, empty states, and cleanup behavior.
