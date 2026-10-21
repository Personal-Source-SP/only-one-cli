---
domain: stack
version: 1.0.0
triggers:
  - "src/types/**"
  - "src/**/*.service.ts"
  - "src/**/*.tsx"
---

# Rules: Stack Typing & Framework Architecture

### STACK-001: React Component Props Type Declaration
- **MUST_DO**: Declare component props using `type <ComponentName>Props = { ... }` immediately above the component.
- **NEVER_DO**: Use `interface` for React component props.
- **RATIONALE**: Enforces codebase-wide prop definition consistency and predictable type inference.

### STACK-002: Domain Type Contract Isolation
- **MUST_DO**: Define all domain type contracts in dedicated `types/` directories and export via `types/index.ts`.
- **NEVER_DO**: Define domain interfaces or types directly inside `.service.ts` files or `.tsx` components.
- **RATIONALE**: Prevents circular dependencies and separates interface contracts from implementation logic.

### STACK-003: No Anonymous Inline Object Types
- **MUST_DO**: Name all return types and complex payload parameters explicitly.
- **NEVER_DO**: Return anonymous inline object types (e.g. `Promise<{ data: string; count: number } | null>`).
- **RATIONALE**: Ensures clear contract boundaries and simplified unit test mocking.

### STACK-004: Flat Next.js App Structure in Monorepo Subpackages
- **MUST_DO**: Maintain Next.js app roots directly at the subpackage base (`src/ui/app`, `src/ui/components`) with direct `@/*` path aliasing.
- **NEVER_DO**: Nest application roots inside redundant directory wrappers like `src/ui/dashboard/app`.
- **RATIONALE**: Prevents convoluted relative import paths, duplicate tsconfig aliases, and packaging path mismatch.

