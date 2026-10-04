---
id: 20261004-160700-gateway-router-workflow
title: Xây dựng Gateway Router Workflow (/only-one)
archived_at: 2026-10-04
status: active
references:
  - only-one/archives/20260917-113200-workflow-and-sdlc-systems.md
affected_modules:
  - assets/workflows
  - assets/combos
  - .agents/workflows
---

# Archive: Xây dựng Gateway Router Workflow (/only-one)

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Hệ thống có nhiều workflows chuyên biệt (`idea`, `plan`, `apply`, `debug`, `flash`, `review`, `clean`, `conflict`, `pr-git`, `clockify`, `intranet`), gây khó khăn cho người dùng khi không biết nên lựa chọn workflow nào phù hợp với ngữ cảnh hiện tại.
- **Giá trị (Value)**: Cung cấp điểm tiếp nhận trung tâm duy nhất (Single Entry Point) `/only-one` với cơ chế Triage 3 tầng: trinh sát workspace $\rightarrow$ phân loại ý định qua Intent Matrix $\rightarrow$ điều hướng và xuất câu lệnh chính xác.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Hướng tiếp cận (Approach)**:
  - Khởi tạo workflow `only-one.md` tại `assets/workflows/` và `.agents/workflows/`.
  - Thiết lập Intent Classification Matrix ánh xạ 8 nhóm nhu cầu chính vào đúng target workflow.
  - Đăng ký manifest `only-one` trong `assets/workflows/index.ts` và tích hợp vào toàn bộ combo.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [assets/workflows/only-one.md](file:///d:/Sources/PERSONAL/only-one-cli/assets/workflows/only-one.md) & [.agents/workflows/only-one.md](file:///d:/Sources/PERSONAL/only-one-cli/.agents/workflows/only-one.md)
- [assets/workflows/index.ts](file:///d:/Sources/PERSONAL/only-one-cli/assets/workflows/index.ts)
- [assets/combos/index.ts](file:///d:/Sources/PERSONAL/only-one-cli/assets/combos/index.ts)
- [test/core/workflow-registry.test.ts](file:///d:/Sources/PERSONAL/only-one-cli/test/core/workflow-registry.test.ts)

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: 100% Passed.
- **Branch**: `main`.
