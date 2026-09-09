---
id: 20260909-100058-cli-tooling-and-cocoindex-purge
title: Dọn dẹp Tooling Scripts và Loại bỏ Triệt để Tính năng Legacy CocoIndex
archived_at: 2026-09-09
status: active
references:
  - only-one/archives/20260907-103000-workflow-and-skill-systems.md
affected_modules:
  - scripts
  - package.json
  - src/core/doctor
  - src/core/indexing
  - src/core/prebuilt
  - src/core/client
---

# Archive: Dọn dẹp Tooling Scripts và Loại bỏ Triệt để Tính năng Legacy CocoIndex

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**:
  1. Thư mục `scripts/` tồn đọng các tệp script mồ côi (1 shell script publish cũ và 3 migration scripts dùng 1 lần) không còn bất kỳ caller nào.
  2. Phân phối npm package chứa toàn bộ thư mục `scripts` không cần thiết (`"files": ["dist", "scripts", "assets"]`).
  3. Tính năng CocoIndex ban đầu được dùng để tạo code index artifact nhưng đã lỗi thời và phân mảnh rải rác trên nhiều tầng (Python placeholder script, doctor checks/installer, Docker container lifecycle, prebuilt bundle/manifest, client types). Người dùng khi chạy `only-one doctor` bị buộc phải kiểm tra Python 3.11+ / Docker image CocoIndex ngoài.
- **Giá trị Cốt lõi (Value)**:
  - Tinh gọn thư mục `scripts/` chỉ phục vụ dev tooling (`publish.js`, `bump-asset.ts`, `postbuild-paths.cjs`).
  - Thu gọn danh sách đóng gói npm package về đúng 2 thư mục cần thiết: `["dist", "assets"]`.
  - Phẫu thuật loại bỏ triệt để (Surgical Purge) 100% mã nguồn, doctor checks, container runners và metadata liên quan đến CocoIndex, giúp lệnh `doctor` chạy nhanh, nhẹ và triệt tiêu phụ thuộc ngoài.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Surgical Purge & Clean Seams**:
  - Xóa bỏ hoàn toàn `scripts/cocoindex_documents.py`, `src/core/indexing/tools.ts` và test `tools.test.ts`.
  - Tách định nghĩa `DoctorMode = 'docker' | 'local'` vào trực tiếp [src/core/doctor/types.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/doctor/types.ts).
  - Bảo toàn các generic Docker helpers hữu ích trong [src/core/indexing/docker-runtime.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/indexing/docker-runtime.ts) (`isDockerDaemonRunning`, `getDockerServerVersion`, `hasDockerImage`, `getContainerState`, `ensureContainerRunning`).
  - Làm sạch [src/core/prebuilt/manifest.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/prebuilt/manifest.ts) và [bundle.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/prebuilt/bundle.ts) không còn `.cocoindex` hay `cocoindexVersion`.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- **Xoá tệp rác & legacy**:
  - `[DELETE]` `scripts/publish-npm.sh`
  - `[DELETE]` `scripts/fix-imports.mjs`
  - `[DELETE]` `scripts/move-tests-to-test-dir.mjs`
  - `[DELETE]` `scripts/port-openspec-adapters.mjs`
  - `[DELETE]` `scripts/cocoindex_documents.py`
  - `[DELETE]` `src/core/indexing/tools.ts`
  - `[DELETE]` `test/core/indexing/tools.test.ts`
- **Làm sạch cấu hình & Core**:
  - `[MODIFY]` `package.json` & `scripts/publish.js`
  - `[MODIFY]` `src/core/doctor/types.ts`, `checks.ts`, `install.ts`
  - `[MODIFY]` `src/core/indexing/docker-runtime.ts`
  - `[MODIFY]` `src/core/prebuilt/bundle.ts`, `manifest.ts`, `indexers.ts`
  - `[MODIFY]` `src/core/client/types.ts`
  - `[MODIFY]` `src/commands/structure-generate/actions/step-4-generate-payload-and-report.ts`

## 4. Verification Evidence (Bằng chứng Nghiệm thu)
- **Test Suite**: 100% Passed (55 test files, 228 tests passed).
- **Format & Build**: 100% Passed (`npm run format:check` và `npm run build`).
- **NPM Local Package**: Đóng gói và cài đặt toàn cục thành công qua `npm run publish:local`.
