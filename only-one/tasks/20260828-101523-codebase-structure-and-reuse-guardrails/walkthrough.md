# Walkthrough: Codebase Structure Adherence & Anti-Reinvention Guardrails

## 1. Tóm tắt Thay đổi (Summary of Changes)
Đã triển khai thành công mô hình phòng thủ 3 lớp (**3-Layer Defense-in-Depth**) nhằm ngăn chặn triệt để tình trạng Agent tự ý viết mới các hàm tiện ích/helpers/hooks/components khi codebase đã có sẵn:

1. **Lớp 1: Domain Skills (`only-one-nestjs-development` & `only-one-nextjs-development`)**:
   - Bổ sung quy tắc bất biến `0. Mandatory Reuse-First Invariant (Anti-Reinvention Rules)`.
   - Bắt buộc quét các thư mục dùng chung (`src/utils`, `src/helpers`, `src/hooks`, `src/common`, `src/components`) trước khi viết code mới.
   - Cấm tạo duplicate utilities/components và tuân thủ Open/Closed Principle (mở rộng thay vì tạo mới).
2. **Lớp 2: Planning Workflow (`only-one-plan.md`)**:
   - Bổ sung `Step 1b: Mandatory Reuse-First Audit`.
   - Cập nhật Section 3.1 Task Matrix với cột `Reused Existing Utilities / Helpers` và Section 4 bắt buộc ghi rõ các abstractions tái sử dụng.
3. **Lớp 3: Execution Workflow (`only-one-apply.md`)**:
   - Bổ sung `Step 4a: Pre-apply Context & Existing Imports Inspection` để đọc kỹ header imports và helper có sẵn trong file đích trước khi chèn code.
   - Enforce guardrail cấm dán code mù quáng và cấm viết code trùng lặp.

---

## 2. Kết quả Kiểm thử & Bằng chứng Thực thi (Test Execution Evidence)

| Test File / Command | Kết quả | Chi tiết |
| :--- | :---: | :--- |
| `npm test test/commands/skill/skill.test.ts` | **PASS** | 2 tests passed (Xác thực cú pháp & cài đặt skill) |
| `npm test test/commands/workflow.test.ts` | **PASS** | 4 tests passed (Xác thực cú pháp & cài đặt workflow) |
| `npm test` (Full Repository Test Suite) | **PASS** | 50 test files passed, 201 tests passed (0 failures) |

---

## 3. Các File Đã Thay Đổi (Modified Files)
- [`assets/skills/only-one-nestjs-development/SKILL.md`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nestjs-development/SKILL.md)
- [`assets/skills/only-one-nextjs-development/SKILL.md`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nextjs-development/SKILL.md)
- [`assets/workflows/only-one-plan.md`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/only-one-plan.md)
- [`.agents/workflows/only-one-plan.md`](file:///Users/kiem/Sources/Personal/only-one-cli/.agents/workflows/only-one-plan.md)
- [`assets/workflows/only-one-apply.md`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/only-one-apply.md)
- [`.agents/workflows/only-one-apply.md`](file:///Users/kiem/Sources/Personal/only-one-cli/.agents/workflows/only-one-apply.md)
- [`only-one/tasks/20260828-101523-codebase-structure-and-reuse-guardrails/plan.md`](file:///Users/kiem/Sources/Personal/only-one-cli/only-one/tasks/20260828-101523-codebase-structure-and-reuse-guardrails/plan.md)
