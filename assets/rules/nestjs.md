# NestJS

## Detection and Architecture
- Confirm NestJS from package manifest, framework config, bootstrap entry point, and module layout before applying this rule.
- Trace module, controller, DTO, service, repository, guards, interceptors, filters, and API or data contracts before changes.
- Preserve dependency injection, validation boundaries, module ownership, transactions, error handling, and logging conventions.
- Do not change API or database contracts without migration, compatibility plan, and coverage.

## Services and Repositories
- Use `@InjectRepository` for repository usage.
- Order service methods: synchronous public, asynchronous public, synchronous private, asynchronous private.
- Use `try/catch` around error-prone logic; avoid wrapping an entire service by default.
- Log errors in format `[ServiceName] message`.
- Split services when too long; target 100–150 lines of core logic.
- Reuse existing methods before adding new logic.

## Request and Response Contracts
- Define an explicit interface or class for request input and response output for every method or function.
- Request type may be omitted only when input has exactly one property.
- Always define an explicit response type.
- Do not use inline anonymous object types except for the one-property request exception.
- Keep naming consistent: `XxxRequest` and `XxxResponse`, or `XxxDto` when applicable.
