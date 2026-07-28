---
name: nestjs-development
description: Use when creating or modifying NestJS controllers, services, modules, ORM repositories, entities, DTOs, validation, error handling, or backend tests.
---

# NestJS Development

## First Gates

1. Inspect `package.json`, bootstrap entry point, module layout, and existing tests.
2. Detect ORM, validation library, logger, exception filters, authorization, and transaction patterns.
3. Reuse existing modules, DTOs, services, repositories, and tests before adding abstractions.
4. Existing project conventions win when they do not weaken correctness, security, or explicit requirements.

## Boundaries

- Keep transport concerns in controllers and business rules in services or established domain layer.
- Keep validation at request boundaries using project validation convention.
- Use project ORM and persistence pattern. Read `references/typeorm.md` when project uses TypeORM.
- Preserve dependency injection, module ownership, transaction, error, and logging conventions.
- Apply authorization before protected data access or state changes.

## Service Design

- SHOULD order methods: synchronous public, asynchronous public, synchronous private, asynchronous private.
- SHOULD reuse existing methods before adding logic.
- Split service when it owns multiple responsibilities, aggregates, or external integrations; 100–150 core-logic lines is a review signal, not a hard limit.
- Use transactions for multi-write operations requiring atomicity.
- Follow existing pagination, filtering, sorting, and idempotency conventions.

## Errors and Logging

- Catch only errors that need translation, recovery, safe context, or targeted logging.
- Use focused `try/catch`; AVOID wrapping an entire service by default.
- Re-throw or map errors through existing NestJS/application exception conventions. NEVER swallow errors silently.
- Log errors through existing logger as `[ServiceName] message` with safe structured context.
- NEVER log credentials, tokens, passwords, or full sensitive request bodies.

## Types and Verification

- Use `XxxRequest` / `XxxResponse`, or `XxxDto` where established.
- Follow repository TypeScript and API-contract rules.
- Run affected unit/integration tests, typecheck, and lint/format checks.
- Verify authorization, validation failure, not-found, conflict, and persistence failure paths where relevant.
