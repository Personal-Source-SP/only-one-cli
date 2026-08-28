---
name: only-one-nextjs-development
description: MUST use when creating, modifying, reviewing, or refactoring Frontend Pages, Components, Refine Hooks, React State, Forms, Types, Utils, Router, UI/UX, or Runtime Dev Loops in Next.js / React applications. The agent MUST read this skill and selectively load ONLY relevant reference docs based on task type.
---

# Master Next.js / Frontend Development Skill (Central Coordinator)

## 0. Mandatory Reuse-First Invariant (Anti-Reinvention Rules)

> [!IMPORTANT]
> **MANDATORY AUDIT BEFORE WRITING NEW FRONTEND CODE**:
> 1. **Pre-Implementation Codebase Audit**:
>    - Before creating any Custom Hook, UI Component, Utility Function, Form Drawer, Modal, Date/Time Formatter, or Type/Interface, the Agent MUST audit (`grep_search` or `list_dir`):
>      - `src/components/`, `src/hooks/`, `src/utils/`, `src/helpers/`, `src/common/`, `src/types/`
>      - Sibling feature folders (e.g., existing administrative feature pages).
> 2. **Strict Anti-Reinvention**:
>    - NEVER duplicate date/time handling (dayjs timezone, timestamp format), currency/number formatting, URL query parsing, or lodash helpers if present in `src/utils/`.
>    - NEVER write bespoke CRUD table/form hooks if the project provides shared hooks (`useCustomTable`, `useCustomDrawerForm`, custom refine hooks).
>    - NEVER create duplicate UI components (e.g., `StatusBadge`, `ConfirmModal`, `FilterDropdown`) when available in `src/components/`.
> 3. **Open/Closed Extension**:
>    - If an existing component or hook lacks a property, extend its props with safe defaults instead of creating a copy-pasted duplicate.

---

## Directives for Context Efficiency (Lazy Loading Rules)

> [!WARNING]
> **TOKEN EFFICIENCY DIRECTIVE**: The Agent MUST NOT read all reference files simultaneously.
> Use `view_file` to read **ONLY the single relevant reference file** corresponding to the active task based on the routing matrix below.

### Master Reference Routing Matrix

| Task / Component in Progress | Dedicated Reference File to Read (`view_file`) |
| :--- | :--- |
| **Main Page (Feature Page `index.tsx`) / Layout / Feature Flow** | [references/page-architecture.md](references/page-architecture.md) |
| **UI Components / Sub-components / Form Drawers / Modals** | [references/component-architecture.md](references/component-architecture.md) |
| **Data Fetching / Refine Hooks (`useCustomTable`, `useCustomDrawerForm`)** | [references/refine-hooks.md](references/refine-hooks.md) |
| **Types / Interfaces / FormValues / Barrel Exports (`index.ts`)** | [references/types-and-contracts.md](references/types-and-contracts.md) |
| **Utils / Converters / Lodash & Dayjs Timezone** | [references/utils-and-helpers.md](references/utils-and-helpers.md) |
| **i18n Translations (`useTranslation`) & Constants** | [references/i18n-and-constants.md](references/i18n-and-constants.md) |
| **Next.js Router (App Router vs Pages Router, RSC/Client Boundary)** | [references/app-and-pages-router.md](references/app-and-pages-router.md) |
| **React State, Hooks (`useMemo`, `useCallback`, `useEffect`), Async UI** | [references/react-state-and-hooks.md](references/react-state-and-hooks.md) |
| **UI/UX Design, Accessibility, Styling & Ant Design** | [references/ui-ux-guidelines.md](references/ui-ux-guidelines.md) |
| **Runtime Browser Verification & Debugging Dev Loop** | [references/next-runtime-dev-loop.md](references/next-runtime-dev-loop.md) |
| **Next.js Caching, Performance & Partial Prefetching** | [references/next-cache-and-performance.md](references/next-cache-and-performance.md) |
| **Code Review by Business Domain / Quality Audit** | [references/code-review-guidelines.md](references/code-review-guidelines.md) |

---

## Quick Workflow, Innovation & Conflict Resolution

> [!NOTE]
> **Skill Philosophy**: This skill suite serves as a **baseline reference**, not a rigid constraint. The Agent is **encouraged to propose innovative and optimized UI/UX solutions** tailored to real-world domain requirements.

1. **Inspect Baseline Conventions**:
   - Look up the routing matrix above and open ONLY the 1-2 reference files corresponding to the active frontend component.

2. **Debug-Friendly Return-by-Variable Convention**:
   - ALWAYS bind computed JSX elements, hook configurations, or complex data structures to descriptive variables before returning (e.g., `const columns = useMemo(...); return columns;`).
   - ❌ **NEVER** return deeply nested JSX / function / hook expressions directly on a single return line.

3. **Proactive Reflection & Constructive Challenge**:
   - After inspecting the reference file, if the Agent discovers a superior solution or detects a conflict between skill guidelines and the active codebase, the Agent is **ENCOURAGED TO CHALLENGE ASSUMPTIONS** and align with the user via [grill-me](../grill-me/SKILL.md).
