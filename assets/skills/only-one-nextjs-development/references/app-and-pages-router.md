# App Router vs Pages Router Reference

## Next.js Routing & Data-Fetching Conventions

### 1. App Router vs Pages Router Architecture
- **App Router (`src/app/`)**: Components default to React Server Components (RSC). Apply the `'use client'` directive only when components require local state (`useState`), lifecycle hooks (`useEffect`, custom hooks), browser APIs, or interactive event handlers (`onClick`, `onChange`).
- **Pages Router (`src/pages/`)**: Use `getServerSideProps`, `getStaticProps`, or client-side data fetching frameworks (such as Refine Hooks / TanStack Query).

### 2. Client and Server Boundary Isolation
- **NEVER** import server-only logic, database connections, or secret API credentials into client components or client bundles.
- Explicitly handle and isolate standard states: `Loading`, `Error`, `NotFound`, and `Empty` views.
