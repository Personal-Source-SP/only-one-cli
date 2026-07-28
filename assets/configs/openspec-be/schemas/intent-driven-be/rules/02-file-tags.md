# File Tag Rules

## [NEW] / [MODIFY]
Preserve strict TypeScript, module ownership, DI, transaction boundaries, error semantics, response shapes, and logging context. No undocumented `any` or unrelated refactor.

## [TEST]
Test declared observable business behavior. Mock required injected providers explicitly and run focused plus affected neighboring specs.

## [WIRE]
Preserve module ownership, imports, exports, providers, injection, routing, and dependency direction.

## [DELETE]
Check callers, exports, registrations, tests, and public/shared impact before removal.

## [MIGRATE]
Create or modify migration only. Never execute apply/up/run, revert/down, schema sync, seeds, or backfills without separate explicit approval.
