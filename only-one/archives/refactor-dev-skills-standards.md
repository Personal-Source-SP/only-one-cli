---
id: refactor-dev-skills-standards
title: Chuẩn Hóa Toàn Diện Bộ Skills Frontend/Backend, Tích Hợp Gói Kỹ Năng Ngoại Vi & Khớp Nối skills.sh Aliases
domain: skills
triggers:
  - "assets/agents/skills/**"
  - "assets/agents/packages/**"
  - "src/core/skill/**"
  - "only-one/rules/**"
archived_at: 2026-10-31T21:55:00+07:00
status: active
references:
  - only-one/archives/workflow-and-sdlc-systems.md
  - only-one/archives/asset-versioning-and-sync-systems.md
affected_modules:
  - assets/agents/skills
  - assets/agents/skills/only-one-nextjs-development
  - assets/agents/skills/only-one-nestjs-development
  - assets/agents/skills/index.ts
  - assets/agents/packages/index.ts
  - assets/types.ts
  - src/core/skill/index.ts
  - src/commands/skill/actions/step-1-load-manifests.ts
  - test/core/skill-registry.test.ts
  - test/packages/doubtDrivenDevelopmentPackage.test.ts
---

# Archive: Chuẩn Hóa Toàn Diện Bộ Skills Frontend/Backend, Tích Hợp Gói Kỹ Năng Ngoại Vi & Khớp Nối skills.sh Aliases

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**:
  - Cấu trúc hằng số cấp trang trước đây dùng tệp đơn `constants.ts` bị phình to và khó mở rộng.
  - Tồn tại tình trạng viết anonymous inline object types `{}` lồng trong interface cha (Frontend) hoặc anonymous return shapes trong Service methods (Backend).
  - Tình trạng khai báo `type`/`interface` tùy tiện ngay trong tệp `.service.ts` hoặc không nhất quán khi định nghĩa Component Props (`interface` vs `type`).
  - Lạm dụng raw HTML tags (`<div>`, `<button>`, `<span>`) kèm chuỗi class TailwindCSS thay vì tái sử dụng Ant Design và `@/components`.
  - Agent đôi khi sinh mã mà không đọc kỹ tài liệu quy chuẩn kỹ năng tương ứng.
  - **Lệch tên Manifest với Thư mục Upstream trên skills.sh**: Khi chuyển nguồn kỹ năng Git conflict sang `warpdotdev/common-skills`, manifest khai báo `name: 'resolving-merge-conflicts'` trong khi upstream đặt tên thư mục là `resolve-merge-conflicts`. Lệnh `skills add` truyền sai tên định danh dẫn đến lỗi `x No matching skills found`.
  - **Thiếu cơ chế Bí danh Tương thích Ngược (Aliases)**: Hệ thống tìm kiếm skill chỉ so sánh khớp cứng `s.name === skillName`, khiến các script hoặc người dùng gọi tên cũ bị lỗi tìm kiếm.
  - **Thiếu Vòng lặp Đối kháng Kiểm chứng Giả định**: Agent có xu hướng thuận theo giả định của người dùng (Sycophancy) mà không qua kiểm chứng độc lập.
- **Giá trị (Value)**:
  - Thiết lập Hard Invariants và chuẩn hóa 100% việc tổ chức file hằng số (`constants/`), phân tách vị trí type trong `types/`, chuẩn hóa `type <ComponentName>Props`, siết chặt 3-tier component hierarchy và bắt buộc đọc skills trước khi viết code.
  - **Khớp nối Tuyệt đối Tên Định danh Kỹ năng Upstream**: Đồng bộ tên manifest thành `resolve-merge-conflicts` khớp 100% với cây thư mục upstream `warpdotdev/common-skills`.
  - **Cơ chế Aliases Mềm dẻo**: Bổ sung trường `aliases?: string[]` vào `SkillManifest`, hỗ trợ tra cứu kép theo `name` hoặc `aliases`, đảm bảo tương thích ngược 100% với tên gọi cũ `resolving-merge-conflicts`.
  - **Tự động Phân phối Kỹ năng Hoài nghi Đối kháng**: Tích hợp package `doubt-driven-development` từ `addyosmani/agent-skills` vào hệ sinh thái kỹ năng thông qua `skills.sh`.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Chuẩn hóa Hằng số Trang Modular**: Thay thế `constants.ts` bằng thư mục `constants/` (`columns.constant.ts`, `filter.constant.ts`, `form.constant.ts`...) với `constants/index.ts` barrel export.
- **Quy tắc Zero Anonymous Inline Types**: 100% nested object types bắt buộc phải là Named Types độc lập đặt trong `src/pages/<feature>/types/` (Frontend) hoặc `src/modules/<feature>/types/` (Backend).
- **Component Props Type Standard**: 100% props của React component PHẢI khai báo bằng `type <ComponentName>Props = { ... }` đặt ngay phía trên component definition.
- **Service Return Contracts**: Cấm tuyệt đối anonymous return types; cấm định nghĩa `type`/`interface` trong `.service.ts`.
- **Thứ bậc UI Components**: Ưu tiên 1 (`@/components`), Ưu tiên 2 (Ant Design UI Kit compound primitives), Ưu tiên 3 (TailwindCSS cho layout spacing/gap). Cấm viết raw HTML thay thế Ant Design/Shared components.
- **Mandatory Skill Reading Gate**: Agent bắt buộc đọc `SKILL.md` và `references/*.md` trước khi code.
- **Tích hợp Registry `skills.sh`**: Chuyển đổi cơ chế cài đặt kỹ năng từ git clone trực tiếp sang CLI chuẩn `skills.sh` (`npx -y skills add <skill>`), đảm bảo tuân thủ cấu trúc kỹ năng Antigravity/Agent chuẩn và tích hợp metadata mượt mà vào `installed.json`.
- **Bảo toàn Tính Nhất Quán Tên & Thư mục Remote Skills ([CORE-009](file:///d:/Sources/PERSONAL/only-one-cli/only-one/rules/core.md))**:
  - `SkillManifest.name` bắt buộc phải khớp chính xác với thư mục chứa kỹ năng trên upstream (`resolve-merge-conflicts`).
  - Mở rộng `SkillManifest` trong [assets/types.ts](file:///d:/Sources/PERSONAL/only-one-cli/assets/types.ts) với `aliases?: string[]`.
  - [src/core/skill/index.ts](file:///d:/Sources/PERSONAL/only-one-cli/src/core/skill/index.ts) tra cứu: `SKILLS.find(s => s.name === skillName || s.aliases?.includes(skillName))` và truyền `manifest.name` chuẩn sang CLI.
  - [src/commands/skill/actions/step-1-load-manifests.ts](file:///d:/Sources/PERSONAL/only-one-cli/src/commands/skill/actions/step-1-load-manifests.ts) gom cả aliases vào `availableSkills`.
- **Phân phối Package Kỹ năng Ngoại vi**:
  - Đăng ký package `doubt-driven-development` trong [assets/agents/packages/index.ts](file:///d:/Sources/PERSONAL/only-one-cli/assets/agents/packages/index.ts) với installer kiểu `skills`, source `addyosmani/agent-skills`.
  - Chốt chặn tự động trong [test/core/skill-registry.test.ts](file:///d:/Sources/PERSONAL/only-one-cli/test/core/skill-registry.test.ts) kiểm tra 100% remote skills có `name === skillPath.split('/')[1]`.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [page-architecture.md](file:///d:/Sources/PERSONAL/only-one-cli/assets/agents/skills/only-one-nextjs-development/references/page-architecture.md): Cập nhật cây thư mục và quy tắc `constants/`.
- [component-architecture.md](file:///d:/Sources/PERSONAL/only-one-cli/assets/agents/skills/only-one-nextjs-development/references/component-architecture.md): Thêm quy chuẩn `type <ComponentName>Props`.
- [types-and-contracts.md](file:///d:/Sources/PERSONAL/only-one-cli/assets/agents/skills/only-one-nextjs-development/references/types-and-contracts.md): Bổ sung quy tắc cấm anonymous inline `{}` và quy định đặt type trong `types/`.
- [service-architecture.md](file:///d:/Sources/PERSONAL/only-one-cli/assets/agents/skills/only-one-nestjs-development/references/service-architecture.md): Cấm anonymous return type và cấm declare type trong `.service.ts`.
- [ui-ux-guidelines.md](file:///d:/Sources/PERSONAL/only-one-cli/assets/agents/skills/only-one-nextjs-development/references/ui-ux-guidelines.md): Siết chặt 3-tier cascade & Anti-Raw-HTML.
- [only-one-nextjs-development/SKILL.md](file:///d:/Sources/PERSONAL/only-one-cli/assets/agents/skills/only-one-nextjs-development/SKILL.md) & [only-one-nestjs-development/SKILL.md](file:///d:/Sources/PERSONAL/only-one-cli/assets/agents/skills/only-one-nestjs-development/SKILL.md): Bổ sung Mandatory Skill Reading Gate.
- [assets/agents/skills/index.ts](file:///d:/Sources/PERSONAL/only-one-cli/assets/agents/skills/index.ts): Chuẩn hóa tên `resolve-merge-conflicts` (version `0.0.3`) với `aliases: ['resolving-merge-conflicts']`.
- [assets/agents/packages/index.ts](file:///d:/Sources/PERSONAL/only-one-cli/assets/agents/packages/index.ts): Khai báo package `doubt-driven-development` (`0.0.1`).
- [assets/types.ts](file:///d:/Sources/PERSONAL/only-one-cli/assets/types.ts): Mở rộng `SkillManifest` trường `aliases?: string[]`.
- [src/core/skill/index.ts](file:///d:/Sources/PERSONAL/only-one-cli/src/core/skill/index.ts): Phân giải kỹ năng qua name hoặc aliases, chuyển tiếp canonical name.
- [test/core/skill-registry.test.ts](file:///d:/Sources/PERSONAL/only-one-cli/test/core/skill-registry.test.ts) & [test/packages/doubtDrivenDevelopmentPackage.test.ts](file:///d:/Sources/PERSONAL/only-one-cli/test/packages/doubtDrivenDevelopmentPackage.test.ts): Bộ kiểm thử hợp đồng danh mục và aliases.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: `npm test` PASS 100% (78 test files, 347 unit tests passed, 0 failures).
- **Linter & Build**: `npm run build` PASS (Prettier -> ESLint -> tsc -> postbuild ESM path transformer).
- **Branch**: `main`
