# Walkthrough: Chuẩn hoá Toàn diện Bộ Skill NestJS và Next.js Development sang Tiếng Anh Kỹ thuật & Cú pháp Markdown Chuẩn

Tài liệu nghiệm thu toàn bộ quá trình chuyển đổi và chuẩn hoá ngôn ngữ, cấu trúc markdown, bảng điều hướng và các ràng buộc bất biến cho 2 bộ skill `only-one-nestjs-development` và `only-one-nextjs-development`.

---

## 1. Tóm tắt Thay đổi (Summary of Changes)

Đã hoàn tất chuẩn hoá **27/27 files** (NestJS Suite: 14 files, Next.js Suite: 13 files):

### 1.1. NestJS Development Skill Suite (`assets/skills/only-one-nestjs-development/`)
- [SKILL.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nestjs-development/SKILL.md): Chuẩn hoá Anti-Reinvention Invariants, Selective Reference Routing Matrix (bổ sung mục `composition-shared-architecture.md`), triết lý và cơ chế conflict resolution sang tiếng Anh chuyên ngành.
- [composition-shared-architecture.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nestjs-development/references/composition-shared-architecture.md): Chuẩn hoá Root composition, base classes (`BaseController`, `BaseService`, `AbstractEntity`), và module ownership rules.
- [controller-architecture.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nestjs-development/references/controller-architecture.md): Chuẩn hoá HTTP adapter patterns, Auth/Permission decorators, Swagger docs, và Debug-friendly return-by-variable rule.
- [entity-architecture.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nestjs-development/references/entity-architecture.md): Chuẩn hoá MikroORM entity decorators, column constraints, AutoMapper bindings, và relation lifecycle invariants.
- [enum-architecture.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nestjs-development/references/enum-architecture.md): Chuẩn hoá type-safe string enum conventions và isolation khỏi dynamic datasets.
- [helper-architecture.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nestjs-development/references/helper-architecture.md): Chuẩn hoá pure helper function guidelines, Lodash & Dayjs timezone usage, và return variable conventions.
- [mapping-profile-architecture.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nestjs-development/references/mapping-profile-architecture.md): Chuẩn hoá AutoMapper profile patterns kèm MikroORM uninitialized relation guards (`mapWith`, `collection.isInitialized()`).
- [mikro-orm.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nestjs-development/references/mikro-orm.md): Chuẩn hoá repository injection, BaseService CRUD reuse, transaction atomicity, và error translation.
- [mikro-orm-migration.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nestjs-development/references/mikro-orm-migration.md): Chuẩn hoá 5-step migration lifecycle, PascalCase naming conventions, và critical agent restriction (cấm agent tự ý chạy migration trên DB).
- [nestjs-architecture.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nestjs-development/references/nestjs-architecture.md): Chuẩn hoá feature module layout, request flow diagrams, barrel export rules, và anti-patterns.
- [request-dto-architecture.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nestjs-development/references/request-dto-architecture.md): Chuẩn hoá request input contracts, custom validation decorators, property ordering, và AutoMapper binding.
- [response-dto-architecture.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nestjs-development/references/response-dto-architecture.md): Chuẩn hoá serialization contracts, `AbstractDto` inheritance, constructors, và circular reference prevention.
- [service-architecture.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nestjs-development/references/service-architecture.md): Chuẩn hoá use-case encapsulation, Debug-friendly return-by-variable, DRY refactoring, PATCH field sanitization, và Dayjs timezone handling.
- [test-architecture.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nestjs-development/references/test-architecture.md): Chuẩn hoá business logic unit testing, isolation & mocking rules, và avoidance of trivial syntax tests.

### 1.2. Next.js Development Skill Suite (`assets/skills/only-one-nextjs-development/`)
- [SKILL.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nextjs-development/SKILL.md): Chuẩn hoá Anti-Reinvention Invariants, Master Reference Routing Matrix, Debug-Friendly Return-by-Variable, và conflict resolution.
- [app-and-pages-router.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nextjs-development/references/app-and-pages-router.md): Chuẩn hoá App Router (RSC) vs Pages Router guidelines và client/server boundary isolation.
- [code-review-guidelines.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nextjs-development/references/code-review-guidelines.md): Chuẩn hoá 7 mandatory review audit categories từ góc nhìn BA/Product Engineer, severity levels, và structured feedback taxonomy.
- [component-architecture.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nextjs-development/references/component-architecture.md): Chuẩn hoá Common components reuse (`@/components`), Custom Drawer Form patterns, simple vs complex directory partitioning, và 200 LOC ceiling.
- [i18n-and-constants.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nextjs-development/references/i18n-and-constants.md): Chuẩn hoá `pages.<feature>.*` translation key taxonomy, memoization requirements cho `t(...)`, và static constants placement.
- [next-cache-and-performance.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nextjs-development/references/next-cache-and-performance.md): Chuẩn hoá caching strategies, Partial Prerendering (PPR), và instant navigation guidelines.
- [next-runtime-dev-loop.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nextjs-development/references/next-runtime-dev-loop.md): Chuẩn hoá frontend dev-loop, live browser DOM verification, console audit, và session preservation.
- [page-architecture.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nextjs-development/references/page-architecture.md): Chuẩn hoá self-encapsulated feature page directory structure, 3-tier import grouping, line-length-sorted component declaration order, và Refine composition patterns.
- [react-state-and-hooks.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nextjs-development/references/react-state-and-hooks.md): Chuẩn hoá `.tsx` lifecycle declaration order, disciplined hook usage (`useMemo`, `useCallback`, `useEffect`), và async UI recoverability.
- [refine-hooks.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nextjs-development/references/refine-hooks.md): Chuẩn hoá documentation cho `useCustomTable`, `useCustomDrawerForm`, `useCustomModalForm`, `useCustomSelect`, `useCustomData`, `useCustomMutationData`.
- [types-and-contracts.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nextjs-development/references/types-and-contracts.md): Chuẩn hoá `AbstractRecord` model extension, strict TypeScript typing (no `any`), and property line-length sorting.
- [ui-ux-guidelines.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nextjs-development/references/ui-ux-guidelines.md): Chuẩn hoá 3-tier component priority cascade (`@/components` > `antd` > `TailwindCSS`), accessibility (a11y), and `ui-ux-pro-max` integration matrix.
- [utils-and-helpers.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nextjs-development/references/utils-and-helpers.md): Chuẩn hoá common utility reuse (`@/utilities`), pure helpers, and Lodash/Dayjs rules.

---

## 2. Bằng chứng Kiểm thử (Verification Evidence)

### 2.1. Skill Registry & Manifest Integrity Tests
- **Command**: `npx vitest run test/core/skill-registry.test.ts`
- **Result**: `5/5 passed` (100% manifest names match local SKILL.md frontmatter, no dangling references).

### 2.2. Regression & CLI Integration Tests
- **Command**: `npx vitest run test/commands/regression-agent-first.test.ts`
- **Result**: `3/3 passed`.

### 2.3. Full Repository Build & Prettier Audit
- **Command**: `npm run build`
- **Result**: Exit code 0, TypeScript typecheck passed, Prettier formatting check passed cleanly (`All matched files use Prettier code style!`).

### 2.4. Zero-Vietnamese Purity Check
- **Command**: `grep_search` with Vietnamese diacritic regex `[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]` across both skill directories.
- **Result**: `0 matches` (100% pure technical English across all 27 files).
