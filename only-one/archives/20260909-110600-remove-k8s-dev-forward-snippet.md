---
id: 20260909-110600-remove-k8s-dev-forward-snippet
title: Xoá Bỏ K8s Dev Forwarding Snippet và Làm Sạch Git Asset Manifest
archived_at: 2026-09-09
status: active
references:
  - only-one/archives/20260903-111050-asset-versioning-and-unified-lockfile.md
affected_modules:
  - assets/git
---

# Archive: Xoá Bỏ K8s Dev Forwarding Snippet và Làm Sạch Git Asset Manifest

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Snippet `assets/git/snippets/k8s-dev-forward.sh` và mục khai báo `id: 'k8s-dev-forward'` trong `assets/git/index.ts` chứa cấu hình port-forward đặc thù nội bộ dev cluster (Postgres, Redis, EMQX) không còn thuộc phạm vi bộ công cụ chung của CLI.
- **Giá trị (Value)**: Xoá sạch hoàn toàn snippet legacy và metadata liên quan, giảm kích thước gói asset phân phối và giữ cho danh mục `GIT_SNIPPETS` luôn tinh gọn, chính xác.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Direct Purge**: Xoá bỏ triệt để file vật lý `k8s-dev-forward.sh` và gỡ bỏ entry `k8s-dev-forward` khỏi mảng `GIT_SNIPPETS` trong `assets/git/index.ts`.
- **Zero Dangling References**: Bảo đảm không còn bất kỳ test snapshot, import, hay version-gate check nào tham chiếu đến snippet đã xoá.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- `[DELETE]` `assets/git/snippets/k8s-dev-forward.sh`: Xoá file script port-forward k8s.
- `[MODIFY]` [`assets/git/index.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/git/index.ts): Loại bỏ entry `id: 'k8s-dev-forward'` khỏi `GIT_SNIPPETS`.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Unit Tests**:
  - `test/core/assets/version.test.ts` (9/9 passed).
  - `test/core/assets/version-gate.test.ts` (2/2 passed).
- **Full Test Suite**: 55 test files passed, 230 tests passed (100%).
- **TypeScript & Build**: `npm run build` hoàn thành với 0 lỗi.
- **Branch**: `main`
