---
status: done
slug: 20260828-102831-standardize-nestjs-nextjs-skills
started_at: 2026-08-28
completed_at: 2026-08-28
pr_url: ~
branch: ~
---

# Plan: Standardize NestJS and Next.js Skill Suites to Technical English and Clean Markdown

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- **Hiện trạng mã nguồn**:
  - `assets/skills/only-one-nestjs-development/` chứa [SKILL.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nestjs-development/SKILL.md) và 13 file tài liệu tham khảo trong `references/`.
  - `assets/skills/only-one-nextjs-development/` chứa [SKILL.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nextjs-development/SKILL.md) và 12 file tài liệu tham khảo trong `references/`.
  - Hầu hết các file đều viết theo dạng song ngữ hoặc tiếng Việt kèm thuật ngữ tiếng Anh, có một số chỗ format heading, GitHub alert blocks (`> [!NOTE]`, `> [!IMPORTANT]`, `> [!WARNING]`), và code fence highlighting chưa đạt chuẩn quốc tế.
- **Dependencies & Luồng liên quan**:
  - `assets/skills/index.ts` định nghĩa manifest đăng ký cho `only-one-nestjs-development` và `only-one-nextjs-development`.
  - `test/core/skill-registry.test.ts` kiểm tra tính toàn vẹn của tên skill, frontmatter name, và đường dẫn `SKILL.md`.
- **Hành vi & Ràng buộc bắt buộc giữ nguyên (Invariants)**:
  - 1. **Lazy Loading Matrix Invariant**: Không xoá bỏ hay làm sai lệch đường dẫn file trong bảng tra cứu `Selective Reference Matrix`.
  - 2. **Mandatory Reuse-First Invariant**: Giữ nguyên nguyên tắc kiểm tra module dùng chung (`common/`, `shared/`, `utils/`, `helpers/`) trước khi sinh mã mới.
  - 3. **Debug-Friendly Return-by-Variable Invariant**: Bắt buộc giữ nguyên quy tắc gán kết quả vào biến tường minh trước khi `return`.
  - 4. **Single Responsibility & Size Limits**: Giữ nguyên giới hạn 200 dòng/file đối với React/Next.js components.
  - 5. **Frontmatter Integrity**: `name: only-one-nestjs-development` và `name: only-one-nextjs-development` phải giữ nguyên để pass `test/core/skill-registry.test.ts`.

## Section 2. Detailed Design (Thiết kế Kỹ thuật Chi tiết)
- **Cơ chế Chuẩn hoá Văn bản & Cú pháp**:
  - Chuyển ngữ 100% nội dung sang **Idiomatic Technical English** với câu văn mệnh lệnh (Imperative mood), rõ ràng, gãy gọn.
  - Định dạng bảng biểu Markdown (`| Header | Header |`) căn lề đồng nhất.
  - Sử dụng GitHub-flavored alerts (`> [!NOTE]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!TIP]`) thay cho các icon emoji rời rạc khi định nghĩa quy tắc bắt buộc.
  - Chuẩn hoá toàn bộ code blocks với định danh ngôn ngữ chính xác (`ts`, `tsx`, `json`, `text`, `bash`).
- **Sơ đồ phân rã module và luồng tham chiếu**:
  ```mermaid
  flowchart TD
      A[only-one-nestjs-development/SKILL.md] -->|Lazy loads| B[13 Reference Documents]
      B --> B1[controller-architecture.md]
      B --> B2[service-architecture.md]
      B --> B3[entity-architecture.md]
      B --> B4[mikro-orm.md & mikro-orm-migration.md]
      B --> B5[request & response DTOs]
      B --> B6[helper, enum, test, nestjs-architecture]

      C[only-one-nextjs-development/SKILL.md] -->|Lazy loads| D[12 Reference Documents]
      D --> D1[page-architecture.md & component-architecture.md]
      D --> D2[refine-hooks.md]
      D --> D3[types-and-contracts.md & utils-and-helpers.md]
      D --> D4[react-state-and-hooks.md & app-and-pages-router.md]
      D --> D5[ui-ux-guidelines.md, dev-loop, cache, code-review]
  ```

## Section 3. Implementation Architecture & Machine-Readable Task Matrix

### 3.1 Machine-Readable Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Reused Existing Utilities / Helpers | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nestjs-development/SKILL.md` | `YAML Frontmatter, Invariants, Reference Matrix` | `None` | `None` | `npm test test/core/skill-registry.test.ts` |
| **2** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nestjs-development/references/composition-shared-architecture.md` | `Shared Module Architecture & Composition Rules` | `None` | `Order 1` | `npm test test/core/skill-registry.test.ts` |
| **3** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nestjs-development/references/controller-architecture.md` | `Controller Decorators, DTO Binding & Rules` | `None` | `Order 1` | `npm test test/core/skill-registry.test.ts` |
| **4** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nestjs-development/references/entity-architecture.md` | `MikroORM Entity Definitions & Column Mappings` | `None` | `Order 1` | `npm test test/core/skill-registry.test.ts` |
| **5** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nestjs-development/references/enum-architecture.md` | `Enum Conventions & Registration Rules` | `None` | `Order 1` | `npm test test/core/skill-registry.test.ts` |
| **6** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nestjs-development/references/helper-architecture.md` | `Pure Utility & Helper Function Guidelines` | `None` | `Order 1` | `npm test test/core/skill-registry.test.ts` |
| **7** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nestjs-development/references/mapping-profile-architecture.md` | `AutoMapper Profile & Model Conversion` | `None` | `Order 1` | `npm test test/core/skill-registry.test.ts` |
| **8** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nestjs-development/references/mikro-orm.md` | `MikroORM EntityManager & Query Patterns` | `None` | `Order 1` | `npm test test/core/skill-registry.test.ts` |
| **9** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nestjs-development/references/mikro-orm-migration.md` | `Migration Generation & Execution Invariants` | `None` | `Order 1` | `npm test test/core/skill-registry.test.ts` |
| **10** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nestjs-development/references/nestjs-architecture.md` | `Feature Module Architecture & Layering` | `None` | `Order 1` | `npm test test/core/skill-registry.test.ts` |
| **11** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nestjs-development/references/request-dto-architecture.md` | `Request Validation DTO & Class-Validator` | `None` | `Order 1` | `npm test test/core/skill-registry.test.ts` |
| **12** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nestjs-development/references/response-dto-architecture.md` | `Response DTO & Serialization Contracts` | `None` | `Order 1` | `npm test test/core/skill-registry.test.ts` |
| **13** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nestjs-development/references/service-architecture.md` | `Service Business Rules, Transactions & Error Handling` | `None` | `Order 1` | `npm test test/core/skill-registry.test.ts` |
| **14** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nestjs-development/references/test-architecture.md` | `Unit & Integration Test Conventions` | `None` | `Order 1` | `npm test test/core/skill-registry.test.ts` |
| **15** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nextjs-development/SKILL.md` | `YAML Frontmatter, Invariants, Routing Matrix` | `None` | `None` | `npm test test/core/skill-registry.test.ts` |
| **16** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nextjs-development/references/app-and-pages-router.md` | `App Router vs Pages Router & RSC Boundaries` | `None` | `Order 15` | `npm test test/core/skill-registry.test.ts` |
| **17** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nextjs-development/references/code-review-guidelines.md` | `PR Quality Audit & Business Review Rules` | `None` | `Order 15` | `npm test test/core/skill-registry.test.ts` |
| **18** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nextjs-development/references/component-architecture.md` | `Sub-components, Form Drawers & Modal Rules` | `None` | `Order 15` | `npm test test/core/skill-registry.test.ts` |
| **19** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nextjs-development/references/i18n-and-constants.md` | `i18n Translation & Constants Structure` | `None` | `Order 15` | `npm test test/core/skill-registry.test.ts` |
| **20** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nextjs-development/references/next-cache-and-performance.md` | `Caching Strategies & Partial Prefetching` | `None` | `Order 15` | `npm test test/core/skill-registry.test.ts` |
| **21** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nextjs-development/references/next-runtime-dev-loop.md` | `Browser Verification & Runtime Debugging` | `None` | `Order 15` | `npm test test/core/skill-registry.test.ts` |
| **22** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nextjs-development/references/page-architecture.md` | `Feature Page Layout & Refine Integration` | `None` | `Order 15` | `npm test test/core/skill-registry.test.ts` |
| **23** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nextjs-development/references/react-state-and-hooks.md` | `State Management, useMemo, useCallback Rules` | `None` | `Order 15` | `npm test test/core/skill-registry.test.ts` |
| **24** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nextjs-development/references/refine-hooks.md` | `useCustomTable, useCustomDrawerForm Patterns` | `None` | `Order 15` | `npm test test/core/skill-registry.test.ts` |
| **25** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nextjs-development/references/types-and-contracts.md` | `Type Definitions, Interfaces & Barrel Exports` | `None` | `Order 15` | `npm test test/core/skill-registry.test.ts` |
| **26** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nextjs-development/references/ui-ux-guidelines.md` | `UI/UX Standards, Accessibility & Ant Design` | `None` | `Order 15` | `npm test test/core/skill-registry.test.ts` |
| **27** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nextjs-development/references/utils-and-helpers.md` | `Converters, Formatters, Dayjs & Lodash Utilities` | `None` | `Order 15` | `npm test test/core/skill-registry.test.ts` |

## Section 4. Implementation Code Examples (Mẫu Code Triển khai)

### 1. [MODIFY] assets/skills/only-one-nestjs-development/SKILL.md
- **Order**: 1 | **Depends On**: `None`
- **Mục đích**: Chuẩn hóa điều hướng trung tâm và nguyên tắc bất biến chống phát minh lại bánh xe cho NestJS sang tiếng Anh kỹ thuật cao cấp.
- **Code Template**:
```markdown
// [TARGET SEAM: assets/skills/only-one-nestjs-development/SKILL.md]
---
name: only-one-nestjs-development
description: MUST use when creating, modifying, reviewing, or refactoring NestJS components (controllers, services, modules, ORM entities, DTOs, mappers, helpers, or unit tests). The agent MUST read this skill and selectively load ONLY relevant reference docs based on task type.
---

# NestJS Development Skill

## 0. Mandatory Reuse-First Invariant (Anti-Reinvention Rules)

> [!IMPORTANT]
> **MANDATORY AUDIT BEFORE WRITING NEW CODE**:
> 1. **Pre-Implementation Codebase Audit**:
>    - Before creating any new Helper, Utility, Custom Decorator, DTO, Mapper, Exception Class, or Service Method, the Agent MUST audit (`grep_search` or `list_dir`) the following directories:
>      - `src/common/`, `src/shared/`, `src/utils/`, `src/helpers/`, `src/decorators/`
>      - Sibling feature modules sharing similar domain concerns.
> 2. **Strict Anti-Reinvention**:
>    - NEVER re-implement string manipulation, date formatting, password hashing, currency formatting, object mapping, or query parsing if equivalent utilities already exist.
>    - NEVER write ad-hoc inline logic in Service/Controller when a Base Service, Shared Helper, or ORM Repository method already serves that purpose.
> 3. **Open/Closed Extension**:
>    - If an existing function/helper lacks a minor option, extend it (e.g., add an optional parameter) rather than creating a duplicate utility.

---

## Directives for Context Efficiency (Lazy Loading Rules)

> [!WARNING]
> **TOKEN EFFICIENCY DIRECTIVE**: The Agent MUST NOT read all reference files simultaneously.
> Use `view_file` to read **ONLY the single relevant reference file** corresponding to the active task based on the routing matrix below.

### Selective Reference Routing Matrix

| Task / Component in Progress | Dedicated Reference File to Read (`view_file`) |
| :--- | :--- |
| **Controller / HTTP API / Route / Swagger / Auth** | [references/controller-architecture.md](references/controller-architecture.md) |
| **Service / Business Rules / Use Case / Exception** | [references/service-architecture.md](references/service-architecture.md) |
| **Entity / ORM Mapping / DB Constraint** | [references/entity-architecture.md](references/entity-architecture.md) & [references/mikro-orm.md](references/mikro-orm.md) |
| **Request Input DTO / Validation** | [references/request-dto-architecture.md](references/request-dto-architecture.md) |
| **Response DTO / API Serialization** | [references/response-dto-architecture.md](references/response-dto-architecture.md) |
| **AutoMapper Profile / Relation Mapping** | [references/mapping-profile-architecture.md](references/mapping-profile-architecture.md) |
| **Enum Definition** | [references/enum-architecture.md](references/enum-architecture.md) |
| **Helper Function / Utility** | [references/helper-architecture.md](references/helper-architecture.md) |
| **Unit Test (`_tests/`)** | [references/test-architecture.md](references/test-architecture.md) |
| **DB Migration / Schema Change (MikroORM)** | [references/mikro-orm-migration.md](references/mikro-orm-migration.md) |
| **Entire Feature Module Creation** | [references/nestjs-architecture.md](references/nestjs-architecture.md) |
| **Shared Composition / Cross-Module Reuse** | [references/composition-shared-architecture.md](references/composition-shared-architecture.md) |
```

### 2. [MODIFY] assets/skills/only-one-nextjs-development/SKILL.md
- **Order**: 15 | **Depends On**: `None`
- **Mục đích**: Chuẩn hóa điều hướng trung tâm và quy tắc return-by-variable cho Next.js sang tiếng Anh kỹ thuật cao cấp.
- **Code Template**:
```markdown
// [TARGET SEAM: assets/skills/only-one-nextjs-development/SKILL.md]
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
>    - If an existing component/hook lacks a property, extend its props with safe defaults instead of creating a copy-pasted duplicate.

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
```

## Section 5. Test Cases (Kịch bản Kiểm thử & Nghiệm thu)

### Test Case 1: Skill Registry Integrity
- **Objective**: Verify that all standardized skills remain registered and pass frontmatter inspection.
- **Precondition**: `assets/skills/` contains modified `SKILL.md` files.
- **Action**: Run `npm test test/core/skill-registry.test.ts`.
- **Expected Result**: 100% tests pass with zero failures.

### Test Case 2: Full CLI Build & Formatter Check
- **Objective**: Ensure the entire repository builds cleanly without formatting or typescript errors.
- **Action**: Run `npm run build`.
- **Expected Result**: Exit code 0, TypeScript compiles cleanly, Prettier check passes.

### Test Case 3: Reference Link & Syntax Verification
- **Objective**: Ensure every reference link in `SKILL.md` maps to an existing file and contains zero non-English sentences.
- **Action**: Inspect all 27 markdown files across both skill directories.
- **Expected Result**: All links resolve, 100% text is in idiomatic technical English.

## Section 6. Technical English Key Patterns

### 1. Invariant Preservation
- **Meaning (VI)**: Duy trì và bảo toàn các ràng buộc bất biến của hệ thống.
- **Grammar / Usage**: `Preserve [Invariant] across [Scope/Refactoring]`
- **Engineering Example**: *"The refactoring process must preserve architectural invariants across all feature modules to prevent structural regression."*

### 2. Selective Context Ingestion
- **Meaning (VI)**: Nạp ngữ cảnh có chọn lọc theo nhu cầu để tối ưu hóa context window.
- **Grammar / Usage**: `Selectively ingest [Resource] based on [Criteria]`
- **Engineering Example**: *"The agent selectively ingests reference documents based on the routing matrix to maintain minimal token footprint."*

### 3. Explicit Variable Assignment Preceding Return
- **Meaning (VI)**: Gán biến tường minh trước câu lệnh return để hỗ trợ debug.
- **Grammar / Usage**: `Assign [Expression] to [Variable] prior to return`
- **Engineering Example**: *"Always assign computed JSX structures or pipeline responses to descriptive local variables prior to returning them."*
