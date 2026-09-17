---
id: 20260917-095610-refactor-debug-workflow
title: Tái Cấu Trúc Workflow only-one-debug và Mở Rộng only-one-apply Cho Debugging
archived_at: 2026-09-17
status: active
references:
  - only-one/archives/20260909-105500-workflow-and-skill-systems.md
affected_modules:
  - assets/workflows
  - .agents/workflows
---

# Archive: Tái Cấu Trúc Workflow only-one-debug và Mở Rộng only-one-apply Cho Debugging

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**:
  - `only-one-debug.md` trước đây có Review Gate bắt buộc dừng giữa chừng gây ngắt mạch luồng làm việc. Section 2 của `debug.md` thiếu sơ đồ cây thư mục và phương án giải pháp trực quan.
  - `only-one-apply.md` chỉ chấp nhận `plan.md`, chưa hỗ trợ nhận `debug.md` để tự động hóa sửa lỗi từng bước qua Task Matrix.
- **Giá trị (Value)**:
  - Tái cấu trúc `only-one-debug` thành luồng thực thi liên tục khép kín (End-to-End continuous execution), chuẩn hóa Section 2.1 & 2.2 của `debug.md`.
  - Mở rộng `only-one-apply` hỗ trợ phân tích và áp dụng cả `plan.md` và `debug.md`.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Cấu trúc Section 2 của `debug.md`**: Chia thành 2.1 Mechanical Root Cause & Invariants và 2.2 Proposed Solution & Target Source Structure (sơ đồ cây ASCII kèm tags `[NEW]`, `[MODIFY]`, `[DELETE]`).
- **Xóa bỏ RCA Review Gate**: Cho phép Agent tự động chẩn đoán, viết test tái hiện lỗi (Red), sinh giải pháp, vá code và kiểm thử (Green).
- **Hỗ trợ Đa Tài liệu trong `only-one-apply`**: Tự động nhận diện `plan.md` (`status: planned` $\rightarrow$ `done`) hoặc `debug.md` (`status: planning`/`diagnosing` $\rightarrow$ `fixed`).

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [assets/workflows/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/index.ts): Nâng version `only-one-debug` (0.0.3) và `only-one-apply` (0.0.5).
- [assets/workflows/only-one-debug.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-debug.md) & [.agents/workflows/only-one-debug.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/.agents/workflows/only-one-debug.md): Cập nhật quy trình debug liên tục.
- [assets/workflows/only-one-apply.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-apply.md) & [.agents/workflows/only-one-apply.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/.agents/workflows/only-one-apply.md): Mở rộng hỗ trợ thực thi `debug.md`.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: `npm test` PASS 55/55 test files (230 tests passed, 0 failures). `npm run build` PASS.
- **Branch**: `main`
