---
id: cli-tooling-and-cocoindex-purge
title: Dọn dẹp Tooling Scripts, Postbuild Path Mapping và Loại bỏ Triệt để Legacy CocoIndex
domain: cli
triggers:
  - "scripts/**"
  - "package.json"
  - "src/core/doctor/**"
  - "src/core/indexing/**"
archived_at: 2026-10-30T01:06:00+07:00
status: active
references:
  - only-one/archives/workflow-and-sdlc-systems.md
  - only-one/archives/asset-versioning-and-sync-systems.md
affected_modules:
  - scripts
  - scripts/postbuild-paths.cjs
  - package.json
  - src/core/doctor
  - src/core/indexing
  - src/core/prebuilt
  - src/core/client
  - src/core/ignore
  - test/core/postbuild-paths.test.ts
---

# Archive: Dọn dẹp Tooling Scripts, Postbuild Path Mapping và Loại bỏ Triệt để Legacy CocoIndex

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**:
  1. Thư mục `scripts/` tồn đọng các tệp script mồ côi (1 shell script publish cũ và 3 migration scripts dùng 1 lần) không còn bất kỳ caller nào.
  2. Phân phối npm package chứa toàn bộ thư mục `scripts` không cần thiết (`"files": ["dist", "scripts", "assets"]`).
  3. Tính năng CocoIndex ban đầu được dùng để tạo code index artifact nhưng đã lỗi thời và phân mảnh rải rác trên nhiều tầng (Python placeholder script, doctor checks/installer, Docker container lifecycle, prebuilt bundle/manifest, client types). Người dùng khi chạy `only-one doctor` bị buộc phải kiểm tra Python 3.11+ / Docker image CocoIndex ngoài.
  4. Sau khi tái cấu trúc `assets/` thành 3 domain (`agents/`, `devenv/`, `templates/`), việc chạy binary CLI (`node dist/src/index.js`) phát sinh lỗi `ERR_MODULE_NOT_FOUND` do script chuyển đổi path hậu biên dịch (`scripts/postbuild-paths.cjs`) dùng phép thế tiền tố phẳng (`@assets/` -> `../../assets/`) không phản ánh đúng cấu trúc 3 tầng phân cấp.
- **Giá trị Cốt lõi (Value)**:
  - Tinh gọn thư mục `scripts/` chỉ phục vụ dev tooling (`publish.js`, `bump-asset.ts`, `build-go.js`, `postbuild-paths.cjs`).
  - Thu gọn danh sách đóng gói npm package về đúng 2 thư mục cần thiết: `["dist", "assets"]`.
  - Phẫu thuật loại bỏ triệt để (Surgical Purge) 100% mã nguồn, doctor checks, container runners và metadata liên quan đến CocoIndex, giúp lệnh `doctor` chạy nhanh, nhẹ và triệt tiêu phụ thuộc ngoài.
  - **Purge Triệt để Hệ Sinh thái Chấm công (Timesheet Ecosystem Purge)**: Xóa bỏ 100% các workflows, skills, MCP adapters và template manifests liên quan đến hệ thống chấm công không còn sử dụng (`only-one-timesheet.md`, timesheet MCPs), giảm thiểu hoàn toàn gánh nặng bảo trì.
  - **Domain Subpath Mapping trong Postbuild Transformer**: Thiết lập bảng ánh xạ `domainMappings` rõ ràng trong `scripts/postbuild-paths.cjs` (`@assets/ignore/` -> `templates/ignore/`, `@assets/skills/` -> `agents/skills/`, `@assets/rules/` -> `agents/rules/`, `@assets/vs/` -> `devenv/editor/`, `@assets/git/` -> `devenv/shell/`), đảm bảo 100% lệnh CLI khởi chạy mượt mà không gặp lỗi nạp module ESM.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Surgical Purge & Clean Seams**:
  - Xóa bỏ hoàn toàn `scripts/cocoindex_documents.py`, `src/core/indexing/tools.ts` và test `tools.test.ts`.
  - Tách định nghĩa `DoctorMode = 'docker' | 'local'` vào trực tiếp [src/core/doctor/types.ts](file:///d:/Sources/PERSONAL/only-one-cli/src/core/doctor/types.ts).
  - Bảo toàn các generic Docker helpers hữu ích trong [src/core/indexing/docker-runtime.ts](file:///d:/Sources/PERSONAL/only-one-cli/src/core/indexing/docker-runtime.ts) (`isDockerDaemonRunning`, `getDockerServerVersion`, `hasDockerImage`, `getContainerState`, `ensureContainerRunning`).
  - Làm sạch [src/core/prebuilt/manifest.ts](file:///d:/Sources/PERSONAL/only-one-cli/src/core/prebuilt/manifest.ts) và [bundle.ts](file:///d:/Sources/PERSONAL/only-one-cli/src/core/prebuilt/bundle.ts) không còn `.cocoindex` hay `cocoindexVersion`.
- **Domain Subpath Mapping trong Postbuild ESM Transformer**:
  - `scripts/postbuild-paths.cjs` duyệt đệ quy thư mục `dist/` và chuyển đổi toàn bộ import specifiers của `@/`, `@assets/`, `@agents/`, `@devenv/`, `@templates/` thành relative paths hợp lệ trỏ tới file `.js`.
  - Cập nhật [src/core/ignore/index.ts](file:///d:/Sources/PERSONAL/only-one-cli/src/core/ignore/index.ts) trỏ trực tiếp đến `@assets/templates/ignore/index.js`.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- **Xoá tệp rác & legacy**:
  - `[DELETE]` `scripts/publish-npm.sh`
  - `[DELETE]` `scripts/fix-imports.mjs`
  - `[DELETE]` `scripts/move-tests-to-test-dir.mjs`
  - `[DELETE]` `scripts/port-openspec-adapters.mjs`
  - `[DELETE]` `scripts/cocoindex_documents.py`
  - `[DELETE]` `src/core/indexing/tools.ts`
  - `[DELETE]` `test/core/indexing/tools.test.ts`
- **Cấu hình & Postbuild Tooling**:
  - `[MODIFY]` `package.json` & `scripts/publish.js`
  - `[MODIFY]` `scripts/postbuild-paths.cjs`: Bổ sung domainMappings table cho 3-domain assets.
  - `[MODIFY]` `src/core/ignore/index.ts`: Cập nhật import target sang domain alias.
  - `[NEW]` `test/core/postbuild-paths.test.ts`: Kiểm thử toàn vẹn biến đổi đường dẫn ESM.
  - `[MODIFY]` `src/core/doctor/types.ts`, `checks.ts`, `install.ts`
  - `[MODIFY]` `src/core/indexing/docker-runtime.ts`
  - `[MODIFY]` `src/core/prebuilt/bundle.ts`, `manifest.ts`, `indexers.ts`
  - `[MODIFY]` `src/core/client/types.ts`
  - `[MODIFY]` `src/commands/structure-generate/actions/step-4-generate-payload-and-report.ts`

## 4. Verification Evidence (Bằng chứng Nghiệm thu)
- **Test Suite**: 100% Passed.
- **Postbuild Verification**:
  - `node dist/src/index.js --help` exit code 0.
  - `node dist/src/index.js tui --help` exit code 0.
  - `npm test test/core/postbuild-paths.test.ts` passed (3/3).
- **Format & Build**: 100% Passed (`npm run format:check` và `npm run build`).
- **NPM Local Package**: Đóng gói và cài đặt toàn cục thành công qua `npm run publish:local`.
