---
id: 20260917-101800-refactor-dev-skills-standards
title: Nâng Cấp & Chuẩn Hóa Toàn Diện Bộ Skills Frontend (Next.js) & Backend (NestJS)
archived_at: 2026-09-17
status: active
references:
  - only-one/archives/20260917-104100-workflow-and-sdlc-systems.md
affected_modules:
  - assets/skills/only-one-nextjs-development
  - assets/skills/only-one-nestjs-development
  - assets/skills/index.ts
  - only-one/rules.md
---

# Archive: Nâng Cấp & Chuẩn Hóa Toàn Diện Bộ Skills Frontend (Next.js) & Backend (NestJS)

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**:
  - Cấu trúc hằng số cấp trang trước đây dùng tệp đơn `constants.ts` bị phình to và khó mở rộng.
  - Tồn tại tình trạng viết anonymous inline object types `{}` lồng trong interface cha (Frontend) hoặc anonymous return shapes trong Service methods (Backend).
  - Tình trạng khai báo `type`/`interface` tùy tiện ngay trong tệp `.service.ts` hoặc không nhất quán khi định nghĩa Component Props (`interface` vs `type`).
  - Lạm dụng raw HTML tags (`<div>`, `<button>`, `<span>`) kèm chuỗi class TailwindCSS thay vì tái sử dụng Ant Design và `@/components`.
  - Agent đôi khi sinh mã mà không đọc kỹ tài liệu quy chuẩn kỹ năng tương ứng.
- **Giá trị (Value)**:
  - Thiết lập Hard Invariants và chuẩn hóa 100% việc tổ chức file hằng số (`constants/`), phân tách vị trí type trong `types/`, chuẩn hóa `type <ComponentName>Props`, siết chặt 3-tier component hierarchy và bắt buộc đọc skills trước khi viết code.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Chuẩn hóa Hằng số Trang Modular**: Thay thế `constants.ts` bằng thư mục `constants/` (`columns.constant.ts`, `filter.constant.ts`, `form.constant.ts`...) với `constants/index.ts` barrel export.
- **Quy tắc Zero Anonymous Inline Types**: 100% nested object types bắt buộc phải là Named Types độc lập đặt trong `src/pages/<feature>/types/` (Frontend) hoặc `src/modules/<feature>/types/` (Backend).
- **Component Props Type Standard**: 100% props của React component PHẢI khai báo bằng `type <ComponentName>Props = { ... }` đặt ngay phía trên component definition.
- **Service Return Contracts**: Cấm tuyệt đối anonymous return types; cấm định nghĩa `type`/`interface` trong `.service.ts`.
- **Thứ bậc UI Components**: Ưu tiên 1 (`@/components`), Ưu tiên 2 (Ant Design UI Kit compound primitives), Ưu tiên 3 (TailwindCSS cho layout spacing/gap). Cấm viết raw HTML thay thế Ant Design/Shared components.
- **Mandatory Skill Reading Gate**: Agent bắt buộc đọc `SKILL.md` và `references/*.md` trước khi code.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [page-architecture.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/skills/only-one-nextjs-development/references/page-architecture.md): Cập nhật cây thư mục và quy tắc `constants/`.
- [component-architecture.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/skills/only-one-nextjs-development/references/component-architecture.md): Thêm quy chuẩn `type <ComponentName>Props`.
- [types-and-contracts.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/skills/only-one-nextjs-development/references/types-and-contracts.md): Bổ sung quy tắc cấm anonymous inline `{}` và quy định đặt type trong `types/`.
- [service-architecture.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/skills/only-one-nestjs-development/references/service-architecture.md): Cấm anonymous return type và cấm declare type trong `.service.ts`.
- [ui-ux-guidelines.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/skills/only-one-nextjs-development/references/ui-ux-guidelines.md): Siết chặt 3-tier cascade & Anti-Raw-HTML.
- [only-one-nextjs-development/SKILL.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/skills/only-one-nextjs-development/SKILL.md) & [only-one-nestjs-development/SKILL.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/skills/only-one-nestjs-development/SKILL.md): Bổ sung Mandatory Skill Reading Gate.
- [assets/skills/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/skills/index.ts): Nâng version manifest lên `0.0.2`.
- [only-one/rules.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/only-one/rules.md): Bổ sung các quy tắc âm bản `[ALWAYS]` và `[NEVER]`.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: `npm test` PASS 55/55 test files (230 tests passed, 0 failures). `npm run build` PASS.
- **Branch**: `main`
