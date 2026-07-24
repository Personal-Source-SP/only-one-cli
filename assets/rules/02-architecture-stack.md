---
alwaysApply: true
---

# RULE 2: ARCHITECTURE & TECH STACK GUIDELINES

## 1. Shared Types & DTO Sync (NestJS <-> Next.js)

- NEVER duplicate Type definitions manually between Frontend and Backend.
- MUST use NestJS DTOs (using class-validator) as the Single Source of Truth for API payloads.
- MUST use exported Types/Interfaces or OpenAPI/Zod generated schemas for Next.js API calls.
- MUST inspect `tsconfig`, module path aliases, test scripts, and existing type conventions before edits.
- MUST maintain strict TypeScript practices (`no implicit any`). AVOID `any` unless unavoidable; MUST document reason and keep scope minimal when used.
- MUST define an explicit interface or class for request input and response output for every method or function (`XxxRequest` / `XxxResponse` or `XxxDto`).
- AVOID inline anonymous object types; MUST NOT use inline anonymous objects except when request input has exactly one property.
- MUST name domain entities, classes, interfaces, methods, and functions strictly according to Domain-Driven Design (DDD) principles (Ubiquitous Language) for clear domain mapping.
- MUST maintain strict separation of concerns by organizing code into dedicated role-based directories (e.g., `types/`, `interfaces/`, `dtos/`, `services/`, `constants/`). Every component/module folder MUST contain an `index.ts` file to export its public API and clean up imports.
- SHOULD prefer `lodash` for common utility logic and complex data manipulations instead of writing custom helper functions.
- MUST preserve public type and API contracts. MUST provide migration or compatibility plan and test coverage for intentional contract changes.
- MUST validate untrusted input at runtime boundaries. NEVER assert away uncertain runtime data.

## 2. NestJS (Backend) Standards

- **Architecture**: MUST strictly follow Controller -> Service -> Repository / Entity layers. MUST confirm NestJS setup from package manifest, framework config, bootstrap entry point, and module layout before applying rules.
- **Business Logic**: MUST belong ONLY in Services; NEVER put business logic in Controllers or DTOs.
- **Validation**: MUST use `class-validator` and `class-transformer` on all incoming DTOs.
- **Error Handling**: MUST use standard NestJS HTTP Exceptions (`BadRequestException`, `NotFoundException`, etc.). SHOULD use `try/catch` around error-prone logic; AVOID wrapping an entire service by default. MUST log errors in format `[ServiceName] message`. NEVER swallow errors silently.
- **Dependencies & Repositories**: MUST use `@InjectRepository` for repository injection. MUST preserve dependency injection, validation boundaries, module ownership, transactions, error handling, and logging conventions.
- **Service Design**: SHOULD order service methods: synchronous public -> asynchronous public -> synchronous private -> asynchronous private. SHOULD split services when core logic exceeds 100–150 lines. SHOULD reuse existing methods before adding new logic.

## 3. Next.js App Router & React (Frontend) Standards

- **Server vs Client Components**:
    - MUST default to Server Components (`RSC`).
    - MUST add `'use client'` ONLY when using hooks (`useState`, `useEffect`), browser APIs, or event listeners. MUST respect server and client boundaries; NEVER expose server-only code, secrets, or private data in client bundles.
- **Data Fetching & Cache**:
    - MUST fetch data in Server Components or via React Query/SWR on the client.
    - MUST NOT call NestJS API directly inside Client Components without proper type-safe fetch wrappers/SDK.
- **Next.js Agent Skills**:
    - MUST invoke matching installed skills when triggers apply (`next-dev-loop`, `next-cache-components-adoption`, `next-cache-components-optimizer`, `next-partial-prefetching-adoption`).
- **Components & Hooks**:
    - MUST use React hooks (`useMemo`, `useCallback`, `useEffect`) appropriately when they provide clear value.
    - MUST keep an `index.ts` export file in each component or module folder.
    - MUST organize `.tsx` component declarations in this order: Constants -> State -> Memos -> Effects -> Callbacks -> JSX. Within each group, MUST sort lines from shorter to longer and separate groups with one empty line.
    - MUST split large components; target no more than 200 lines per component. MUST provide a stable `key` for every repeated list item.
- **State & UI Conventions**:
    - MUST keep state local to components or sub-trees. AVOID global state unless strictly necessary.
    - MUST route all UI text through the existing i18n system. MUST preserve accessibility and responsive behavior on mobile, tablet, and desktop.
    - AVOID unnecessary comments; comment ONLY complex or ambiguous logic.

## 4. Code Quality & Testing Mindset

- SHOULD write TDD tests for NestJS services and critical React components/hooks before implementation.
- MUST keep components small and single-responsibility.
- MUST run relevant typecheck and test scope before reporting completion. MUST state checks not run and reason.
