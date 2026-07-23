# TypeScript

## Before Changes
- Inspect `tsconfig`, module system, path aliases, lint scripts, test scripts, and existing type conventions before edits.
- Keep strict TypeScript. Define clear types or interfaces at public, API, persistence, event, and component boundaries.
- Do not use `any` unless unavoidable. Document reason and keep scope minimal when used.

## Contracts and Quality
- Preserve public type and API contracts. Provide migration or compatibility plan and coverage for intentional contract changes.
- Prefer existing project utilities and type patterns over duplicate helpers or ad-hoc casts.
- Validate untrusted input at boundaries. Do not assert away uncertain runtime data.
- Run relevant typecheck and test scope before reporting completion. State checks not run and reason.
