---
name: nestjs-development
description: Use when creating or modifying NestJS controllers, services, modules, TypeORM repositories, entities, DTOs, or backend error handling.
---

# NestJS Development

## Architecture

- MUST confirm NestJS setup from package manifest, framework config, bootstrap entry point, and module layout before applying these rules.
- MUST follow Controller -> Service -> Repository / Entity layers.
- MUST keep business logic in services. NEVER place it in controllers or DTOs.
- MUST use `class-validator` and `class-transformer` on incoming DTOs.
- MUST use `@InjectRepository` for TypeORM repository injection.
- MUST preserve dependency injection, validation boundaries, module ownership, transactions, error handling, and logging conventions.

## Service Design

- SHOULD order service methods: synchronous public, asynchronous public, synchronous private, asynchronous private.
- SHOULD use focused `try/catch` around error-prone logic. AVOID wrapping an entire service by default.
- MUST log errors as `[ServiceName] message`.
- NEVER swallow errors silently.
- SHOULD split services when core logic exceeds 100–150 lines.
- SHOULD reuse existing methods before adding new logic.

## Types

- Use `XxxRequest` / `XxxResponse`, or `XxxDto` where appropriate.
- Follow repository-wide TypeScript and API contract rules.
