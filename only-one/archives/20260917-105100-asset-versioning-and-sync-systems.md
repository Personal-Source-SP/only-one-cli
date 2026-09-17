---
id: 20260917-105100-asset-versioning-and-sync-systems
title: Architecture of Independent Asset Versioning, Unified Lockfile, Two-Way Combo Reconciliation, and Synchronization
archived_at: 2026-09-17
status: active
references:
  - only-one/archives/20260917-104100-workflow-and-sdlc-systems.md
affected_modules:
  - assets/types.ts
  - assets/rules
  - assets/packages
  - assets/mcps
  - assets/vs
  - assets/skills
  - assets/workflows
  - assets/combos
  - assets/git
  - src/core/assets
  - src/core/combo
  - src/core/skill/remote
  - src/commands/update
---

# Archive: Architecture of Independent Asset Versioning, Unified Lockfile, Two-Way Combo Reconciliation, and Synchronization

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**:
  1. **Thiếu cơ chế định danh phiên bản độc lập**: Trước đây các asset manifests hoàn toàn không có trường `version`. Cập nhật asset bị ghép cặp chặt với `cliVersion`, không thể phát hiện asset nào thực sự thay đổi.
  2. **Phân mảnh Lockfile**: Trạng thái cài đặt bị lưu trữ phân tán ở `.only-one/installed.json` và `only-one/skills-lock.json` cho remote GitHub skills.
  3. **Rủi ro Lockfile Drift & Bypass CI**: Thiếu công cụ tăng phiên bản và chốt chặn CI khi thay đổi template asset.
  4. **Thành phần Bị Xóa & File Bị Mất**: File mồ côi tồn đọng trên đĩa khi asset bị gỡ bỏ upstream; hoặc khi người dùng vô tình xóa file vật lý thì không tự động khôi phục.
  5. **Bỏ sót Asset mới của Combo khi Update**: Khi combo upstream được bổ sung thêm workflows/skills/rules mới, lệnh `only-one update --prune` trước đây chỉ quét các asset đã có trong lockfile, dẫn đến việc chỉ xóa asset mồ côi mà không kéo về các asset mới thuộc combo.
- **Giá trị Cốt lõi (Core Value)**:
  - **100% Manifest Version Coverage**: Bổ sung `version: string` chuẩn hóa cơ số 10 (`X.Y.Z`) cho toàn bộ manifests trong `assets/`.
  - **Decimal Rollover Engine**: Triển khai thuật toán tăng phiên bản cơ số 10 (`0.0.1` -> `0.0.9` -> `0.1.0` -> `0.9.9` -> `1.0.0`).
  - **Unified Asset Lockfile (`only-one/installed.json`)**: Áp dụng triệt để chính sách Hard Cutover, hợp nhất hoàn toàn `skills-lock.json` và lưu vết cả `installed.combos` vào `only-one/installed.json` (Single Source of Truth).
  - **Two-Way Reconciliation, Auto-Restore & Pruning Engine**: Lệnh `only-one update` tự động:
    - Đối soát version đã cài với upstream và cập nhật asset outdated.
    - Phát hiện file vật lý bị mất (`status: 'missing'`) và tự động khôi phục từ template gốc.
    - Khi dùng cờ `--prune`: vừa dọn sạch file mồ côi (`status: 'removed'`), vừa tự động đối soát `installed.combos` với manifest upstream để phát hiện và cài đặt các asset mới (`status: 'added'`).
  - **Developer Tooling & Zero-Bypass CI Gate**: Cung cấp `scripts/bump-asset.ts` (`pnpm asset:bump <type> <id>`) và bài test `test/core/assets/version-gate.test.ts` chặn commit vi phạm.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)

### 2.1. Cấu trúc Quản lý Trạng thái Tài nguyên Hợp nhất (Unified State Architecture)
```mermaid
flowchart TD
    CLI["CLI Command (install / update / combo / skill / rule)"] --> LockfileMgr["src/core/assets/lockfile.ts"]
    LockfileMgr --> SingleLock["only-one/installed.json\n(Single Source of Truth)"]
    SingleLock --> CombosState["combos: Record<string, InstalledAssetRecord>"]
    SingleLock --> RulesState["rules: Record<string, InstalledAssetRecord>"]
    SingleLock --> SkillsState["skills: Record<string, InstalledAssetRecord & { remote?: RemoteSkillLockMeta } >"]
    SingleLock --> WorkflowsState["workflows: Record<string, InstalledAssetRecord>"]
    SingleLock --> OtherState["mcps / packages / vs / git"]
    
    UpdateCmd["only-one update [--prune] [--force]"] --> SyncEngine["src/core/assets/sync.ts"]
    SyncEngine --> CheckDisk["checkAssetFilesExist(projectDir, type, id)"]
    SyncEngine --> CheckCombos["Reconcile installed.combos với COMBOS manifest"]
    CheckDisk & CheckCombos --> Compare["Phân loại: up-to-date | outdated | missing | removed | added"]
    Compare --> AutoRestore["missing -> Apply template & restore files"]
    Compare --> Reconcile["outdated -> Apply overwrite & update lockfile"]
    Compare --> PruneOrphan["removed -> pruneAssetUpdates (khi có --prune)"]
    Compare --> InstallAdded["added -> applyAssetUpdates & record lockfile (khi có --prune)"]
```

### 2.2. Các Quyết định Kỹ thuật Chính
1. **Decimal Rollover Arithmetic ([src/core/assets/version.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/version.ts))**: Hàm thuần túy kiểm tra định dạng `^\d+\.\d+\.\d+$`, cuộn vòng từ 9 về 0 và tăng chữ số liền trước.
2. **Hard Cutover Single Source of Truth ([src/core/assets/lockfile.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/lockfile.ts))**: Hàm `resolveInstalledLockfilePath` trỏ trực tiếp đến `join(projectDir, 'only-one', 'installed.json')`, loại bỏ toàn bộ code path dự phòng của thư mục `.only-one/`.
3. **Combo State Persistence ([src/core/combo/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/combo/index.ts))**: Khi chạy `installCombo()`, ghi nhận combo đã cài vào `only-one/installed.json` dưới khóa `installed.combos` để ghi nhớ context của dự án.
4. **Two-Way Full Reconcile ([src/core/assets/sync.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/sync.ts))**:
   - `inspectAssetUpdates(projectDir, { prune: true })` đối chiếu `installed.combos` với upstream manifest để phát hiện item mới (`status: 'added'`).
   - `applyAssetUpdates()` tự động sao chép template mới vào thư mục target agent (`.agents`, `.cursor`, `.claude`) và cập nhật lockfile đồng thời.
   - Chỉ xóa file mồ côi khi có cờ tường minh `--prune`, tuyệt đối không xóa file tùy biến do người dùng tự tạo nếu không có trong `installed.json`.

## 3. Scope & Key Modules (Phạm vi & Các Module Chính)
- **Asset Types & Manifests**:
  - [`assets/types.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/types.ts): Bổ sung `version: string` cho tất cả manifest interfaces.
  - Manifest registries: [`assets/rules/index.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/rules/index.ts), [`assets/packages/index.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/packages/index.ts), [`assets/mcps/index.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/mcps/index.ts), [`assets/vs/index.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/vs/index.ts), [`assets/skills/index.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/skills/index.ts), [`assets/workflows/index.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/index.ts), [`assets/combos/index.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/combos/index.ts), [`assets/git/index.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/git/index.ts).
- **Core Versioning & Lockfile**:
  - [`src/core/assets/version.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/version.ts): Thuật toán decimal rollover arithmetic.
  - [`src/core/assets/types.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/types.ts): Khai báo `InstalledAssetRecord`, `RemoteSkillLockMeta`, `OnlyOneInstalledState`, `AssetUpdateStatus` (`up-to-date`, `outdated`, `missing`, `removed`, `added`), `InspectAssetOptions`.
  - [`src/core/assets/lockfile.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/lockfile.ts): Đọc/ghi và xóa record `only-one/installed.json` atomic (`removeInstalledAsset`).
  - [`src/core/combo/index.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/combo/index.ts): Tự động lưu `installed.combos` vào lockfile trong `installCombo()`.
  - [`src/core/skill/remote/lockfile.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/skill/remote/lockfile.ts): Adapter layer cho GitHub remote skills lưu vào `installed.json`.
  - [`src/core/assets/sync.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/sync.ts): Engine kiểm tra file tồn tại trên đĩa, đối soát combo, auto-restore, auto-install added assets và prune asset mồ côi.
- **Developer Tooling & CI Gate**:
  - [`src/core/assets/bump.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/bump.ts) & [`scripts/bump-asset.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/scripts/bump-asset.ts): Tự động bump version.
  - [`src/core/assets/gate.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/gate.ts): Zero-bypass gate kiểm tra coverage và version bumps.
- **Installers & Update Command Integration**:
  - [`src/commands/update/command.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/commands/update/command.ts): Hỗ trợ cờ `--prune`.
  - [`src/commands/update/actions/step-2-update-artifacts.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/commands/update/actions/step-2-update-artifacts.ts): Kết nối logic auto-restore, added combo assets sync và prune.
  - [`src/tui/views/UpdateView.tsx`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/tui/views/UpdateView.tsx): Menu item Prune Orphaned Assets.

## 4. Verification Evidence (Bằng chứng Kiểm thử)
- **Unit & Integration Tests**:
  - `test/core/assets/version.test.ts` (9 tests passed)
  - `test/core/assets/lockfile.test.ts` (4 tests passed)
  - `test/core/assets/version-gate.test.ts` (2 tests passed)
  - `test/core/assets/sync.test.ts` (4 tests passed)
  - `test/commands/update/update.test.ts` (4 tests passed, bao gồm combo sync test)
  - `test/core/combo.test.ts` (12 tests passed)
  - `test/core/skill-lockfile.test.ts` (5 tests passed)
  - `test/commands/skill/skill.test.ts` (2 tests passed)
- **Full Test Suite**: 55 test files passed, 232 tests passed (100% pass rate).
- **TypeScript & Build**: `npm run format:check && npm run build` sạch 100% (0 errors).
