# Framework Detection

## Detect Before Applying Rules
- Detect framework before applying framework-specific conventions.
- Inspect smallest relevant evidence first: package manifest, lockfile, framework config, entry point, and source layout.
- State detected framework and evidence when it affects implementation, testing, rendering, routing, API, or data-layer decisions.
- If evidence conflicts or framework cannot be identified, present findings and ask user. Do not guess.

## React and Next.js
- Identify router, rendering boundary, data-fetching and cache convention, component ownership, and i18n pattern before changes.
- Respect server and client boundaries. Do not expose server-only code, secrets, or private data in client bundles.
- Reuse existing state, form, error, loading, and test patterns. Preserve accessibility and responsive behavior.

## NestJS
- Trace module, controller, DTO, service, repository, guards, interceptors, filters, and API/data contracts before changes.
- Preserve dependency injection, validation boundaries, module ownership, transactions, error handling, and logging conventions.
- Do not change API or database contracts without migration, compatibility plan, and coverage.

## Other Frameworks and Fallback
- For another detected framework, follow established project conventions and official framework boundaries.
- Do not apply React, Next.js, or NestJS patterns outside their confirmed context.
- When no framework is detected, apply general TypeScript conventions only.
