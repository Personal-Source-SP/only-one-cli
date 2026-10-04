---
id: 20261004-161300-debug-workflow-source-structure
title: Bổ sung Mô tả Cấu trúc Source Thay đổi trong Workflow only-one-debug
archived_at: 2026-10-04
status: active
references:
  - only-one/archives/20260917-113200-workflow-and-sdlc-systems.md
  - only-one/archives/20260923-110527-align-debug-flash-structures.md
affected_modules:
  - assets/workflows/only-one-debug.md
  - .agents/workflows/only-one-debug.md
---

# Archive: Bổ sung Mô tả Cấu trúc Source Thay đổi trong Workflow only-one-debug

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Section 2 của `debug.md` trong workflow `only-one-debug` thiếu sơ đồ cây ASCII Directory Structure Changes tổng quan trước khi vào các task block chi tiết.
- **Giá trị (Value)**: Đồng bộ tính trực quan kiến trúc giữa tất cả các workflow (`only-one-plan`, `only-one-flash`, `only-one-debug`), giúp người đọc nhanh chóng nắm bắt các file test và mã nguồn bị can thiệp.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Hướng tiếp cận (Approach)**:
  - Bổ sung hướng dẫn vẽ sơ đồ cây ASCII Directory Structure Changes vào Step 4 của `only-one-debug.md`.
  - Thêm block `### Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)` vào đầu Section 2 của template `debug.md`.
  - Tăng version manifest `only-one-debug` lên `0.0.9`.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [assets/workflows/only-one-debug.md](file:///d:/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-debug.md) & [.agents/workflows/only-one-debug.md](file:///d:/Sources/PERSONAL/only-one-cli/.agents/workflows/only-one-debug.md)
- [assets/workflows/index.ts](file:///d:/Sources/PERSONAL/only-one-cli/assets/workflows/index.ts)
- [test/core/workflow-registry.test.ts](file:///d:/Sources/PERSONAL/only-one-cli/test/core/workflow-registry.test.ts)

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: 100% Passed.
- **Branch**: `main`.
