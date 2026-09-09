---
id: 20260828-203000-vs-environment-and-sync-systems
title: Unified Architecture of VS Editor Configurations, Asset Libraries, Multi-Platform Process Runners & Resilient Transactions
archived_at: 2026-09-09
status: active
references:
  - only-one/archives/20260824-103830-tui-modernization.md
  - only-one/archives/20260907-103000-workflow-and-skill-systems.md
affected_modules:
  - src/core/vs
  - src/commands/extensions-vs
  - assets/vs
  - test/core/vs
  - test/commands/vs
---

# Archive: Unified Architecture of VS Editor Configurations, Asset Libraries, Multi-Platform Process Runners & Resilient Transactions

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**:
  1. Thiếu tính đồng nhất giữa cấu hình asset library (`assets/vs/index.ts`) và môi trường Antigravity IDE thực tế (thiếu extension `anysphere.cursorpyright`, setting `python.languageServer` bị tắt).
  2. Lệnh `only-one extensions-vs` chỉ hỗ trợ một chiều (cài thêm), không thể tự động dọn dẹp các extension thừa đã cài trên Editor nhưng không còn nằm trong Manifest (`--prune`).
  3. Lỗi crash `spawn ENOENT` trên Windows khi thực thi các lệnh CLI của editor dạng `.cmd`/`.bat` (như `antigravity-ide.cmd`, `code.cmd`, `cursor.cmd`).
  4. Lỗi rollback transaction bị đứt gãy và che giấu lỗi cài đặt gốc (*Error Masking*) khi gặp các extension độc quyền không tồn tại trên Marketplace.
- **Giá trị Cốt lõi (Core Value)**:
  - Đạt được sự đồng bộ hoàn hảo (100% parity) giữa cấu hình editor chuẩn và các môi trường IDE (Antigravity IDE, VS Code, Cursor).
  - Hỗ trợ cơ chế hòa giải trạng thái đầy đủ (*Desired State Reconciliation*) qua cờ `--prune` gỡ bỏ extension thừa bằng `--uninstall-extension`.
  - Đảm bảo khả năng thực thi độc lập nền tảng (*Platform-Agnostic Process Spawning*) trên cả Windows và macOS/Linux.
  - Quản lý đồng bộ có tính giao dịch (*Transactional Integrity*) với cơ chế rollback kiên cường (*Resilient Rollback*) và tự phục hồi an toàn (*Crash Recovery*).

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)

### 2.1. Cấu trúc Đồng bộ & Pruning (Synchronization & Prune Architecture)
```mermaid
flowchart TD
    Host["Developer Environment (Win32 / Darwin)"] --> Cmd["only-one setting-vs / extensions-vs [--prune]"]
    Cmd --> Loader["Library Loader (loadVsLibraryManifest)"]
    Loader --> Manifest["assets/vs/index.ts (VS_LIBRARY v0.0.3)"]
    Cmd --> Resolver["resolveVsEditorCommand (Fail-Fast Probe)"]
    Resolver --> Runner["NodeVsProcessRunner (Platform-Aware Shell)"]
    Cmd --> Diff["Diff Installed vs Manifest (Target vs Orphaned)"]
    Diff --> Tx["VsSyncTransaction (Journaling & Resilient Rollback)"]
    Tx --> Apply["Execute Batch Install (--install-extension) & Prune (--uninstall-extension)"]
```

### 2.2. Các Quyết định Kỹ thuật Chính
1. **Deterministic Alphabetical Sorting & Parity**: Danh mục extension trong `VS_LIBRARY.extensions` được sắp xếp thứ tự A-Z, bao gồm đầy đủ `anysphere.cursorpyright`, từ khóa `Paygate` trong cSpell, và `python.languageServer: "Default"`.
2. **Declarative Pruning (`--prune`)**: Khi kích hoạt `--prune`, CLI so sánh tập hợp extension đang cài trên editor với `VS_LIBRARY.extensions` (hoặc explicit list), phân loại các extension thừa để gọi `--uninstall-extension` một cách an toàn.
3. **Platform-Aware Shell Execution**: `NodeVsProcessRunner` kích hoạt `{ shell: process.platform === 'win32', windowsHide: true }` cho phép Windows tự động phân giải các tệp batch script trong `PATH`.
4. **Fail-Fast & Actionable Command Resolution**: `resolveVsEditorCommand` kiểm tra tính hợp lệ của từng candidate command; nếu không tìm thấy executable nào sẽ ném ngoại lệ rõ ràng kèm hướng dẫn cấu hình biến môi trường `PATH`.
5. **Resilient Rollback & Error Preservation**: `VsSyncTransaction.rollback()` tự động bỏ qua các lỗi lành tính (như extension đã không còn tồn tại) để dọn dẹp triệt để journal/backup files, đồng thời bảo toàn exception nguyên bản của bước install.

## 3. Scope & Key Modules (Phạm vi & Các Module Chính)
- **Asset Manifest**: [`assets/vs/index.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/vs/index.ts) (Cấu hình chuẩn 36 extensions và 41 settings keys, version `0.0.3`).
- **CLI Commands & Step Actions**:
  - [`src/commands/extensions-vs/command.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/commands/extensions-vs/command.ts) (Đăng ký option `--prune`).
  - [`src/commands/extensions-vs/actions/step-5-execute-and-report.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/commands/extensions-vs/actions/step-5-execute-and-report.ts) (Báo cáo tóm tắt cả installed và pruned extensions).
- **Core Sync Engines**:
  - [`src/core/vs/extensions-sync.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/vs/extensions-sync.ts) (Đồng bộ extensions, diffing orphan extensions, gọi uninstall, lọc cảnh báo stderr, xử lý giao dịch).
  - [`src/core/vs/settings-sync.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/vs/settings-sync.ts) (Merge settings sâu, atomic file write).
- **Runtime & Process Runner**: [`src/core/vs/runtime.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/vs/runtime.ts) (`NodeVsProcessRunner` & `nodeVsFileSystem`).
- **Transaction Manager**: [`src/core/vs/transaction.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/vs/transaction.ts) (`VsSyncTransaction` & journal crash recovery).
- **Editors Registry**: [`src/core/vs/editors.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/vs/editors.ts) (Hỗ trợ VS Code, Cursor, Antigravity).
- **Unit & Integration Tests**:
  - [`test/core/vs/vs-core.test.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/test/core/vs/vs-core.test.ts) (14 tests giao dịch, merge settings, prune logic, resolution và rollback).
  - [`test/core/vs/vs-library.test.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/test/core/vs/vs-library.test.ts) (Kiểm tra tính toàn vẹn, sắp xếp A-Z).
  - [`test/commands/vs/vs-commands.test.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/test/commands/vs/vs-commands.test.ts) (8 tests kiểm thử CLI command).

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Test Status**: 100% Passed (24/24 unit tests trong domain VS Sync, 230/230 toàn bộ repository).
- **Build Status**: TypeScript compilation & Prettier formatting passed.
- **Live Verification**: Kiểm thử thành công `only-one extensions-vs --prune` và cập nhật manifest theo Antigravity IDE.
- **Branch**: `main`
