# ReactJS and Next.js

## Detection and Boundaries
- Confirm React or Next.js from package manifest, framework config, entry points, and source layout before applying this rule.
- Identify router, rendering boundary, data-fetching and cache convention, component ownership, and i18n pattern before changes.
- Respect server and client boundaries. Do not expose server-only code, secrets, or private data in client bundles.

## Next.js Agent Skills
- For Next.js work, invoke the matching installed skill before changes when its trigger applies.
- Use `next-dev-loop` to verify runtime behavior in a supported running Next.js development server.
- Use `next-cache-components-adoption` when enabling or migrating to Cache Components.
- Use `next-cache-components-optimizer` when reviewing or improving Cache Components boundaries and cache behavior.
- Use `next-partial-prefetching-adoption` when adopting partial prefetching.
- Follow each skill's router, version, runtime, and tooling preflight. If requirements are not met, report the blocker; do not force the workflow or apply it to React-only projects.

## Components and Hooks
- Use React hooks such as `useMemo`, `useCallback`, and `useEffect` when they provide clear value.
- Keep an `index.ts` export file in each component or module folder.
- Organize `.tsx` component declarations in this order: Constants, State, Memos, Effects, Callbacks, JSX. Within each group, sort lines from shorter to longer and separate groups with one empty line.
- Split large components; target no more than 200 lines per component.
- Provide a stable `key` for every repeated list item.

## UI and Project Conventions
- Route all UI text through the existing i18n system.
- Reuse existing state, form, error, loading, and test patterns.
- Preserve accessibility and responsive behavior on mobile, tablet, and desktop.
- Avoid unnecessary comments; comment only complex or ambiguous logic.
