---
id: 20260903-111050-asset-versioning-and-unified-lockfile
title: Architecture of Independent Asset Versioning, Decimal Rollover, Unified Lockfile, and Synchronization
archived_at: 2026-09-03
status: active
references:
  - only-one/archives/20260903-114000-workflow-and-skill-systems.md
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
  - src/core/skill/remote
  - src/commands/update
---

# Archive: Architecture of Independent Asset Versioning, Decimal Rollover, Unified Lockfile, and Synchronization

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**:
  1. **Thiếu cơ chế định danh phiên bản độc lập**: Trước đây các asset manifests (`RuleManifest`, `SkillManifest`, `WorkflowManifest`, `McpManifest`, `VsLibraryManifest`, `PackageManifest`, `ComboManifest`, `GitAssetManifest`) hoàn toàn không có trường `version`. Cập nhật asset bị ghép cặp chặt (tightly coupled) với phiên bản CLI tổng thể (`cliVersion`), buộc phải cập nhật toàn bộ hoặc không thể phát hiện asset nào thực sự thay đổi.
  2. **Phân mảnh Lockfile**: Trạng thái cài đặt bị lưu trữ phân tán ở thư mục ẩn `.only-one/installed.json` và file riêng `only-one/skills-lock.json` cho remote GitHub skills.
  3. **Rủi ro Lockfile Drift & Bypass CI**: Không có công cụ tự động tăng phiên bản và chốt chặn CI để đảm bảo khi template asset thay đổi thì version tương ứng bắt buộc phải được bump.
  4. **Thành phần Bị Xóa & File Bị Mất (Deletion & Missing Assets)**: Khi asset bị xóa upstream khỏi catalog, file mồ côi tồn đọng trên đĩa và lockfile không được dọn sạch; hoặc khi người dùng lỡ tay xóa file vật lý trên đĩa thì lệnh update cũ không thể phát hiện và khôi phục.
- **Giá trị Cốt lõi (Core Value)**:
  - **100% Manifest Version Coverage**: Bổ sung `version: string` chuẩn hóa cơ số 10 (`X.Y.Z`) cho toàn bộ manifests trong danh mục `assets/`.
  - **Decimal Rollover Engine**: Triển khai thuật toán tăng phiên bản cơ số 10 (`0.0.1` -> `0.0.9` -> `0.1.0` -> `0.9.9` -> `1.0.0`).
  - **Unified Asset Lockfile (`only-one/installed.json`)**: Áp dụng triệt để chính sách Hard Cutover, loại bỏ thư mục ẩn `.only-one/` và hợp nhất hoàn toàn `skills-lock.json` vào `only-one/installed.json`.
  - **Reconciliation, Auto-Restore & Pruning Engine**: Lệnh `only-one update` tự động:
    - Đối soát version đã cài với upstream và cập nhật asset outdated.
    - Phát hiện file vật lý bị mất (`status: 'missing'`) và tự động khôi phục từ template gốc.
    - Phát hiện asset đã bị gỡ upstream (`status: 'removed'`), cảnh báo và hỗ trợ cờ `--prune` để dọn sạch file trên đĩa cùng lockfile.
  - **Developer Tooling & Zero-Bypass CI Gate**: Cung cấp `scripts/bump-asset.ts` (`pnpm asset:bump <type> <id>`) và bài test `test/core/assets/version-gate.test.ts` chặn commit vi phạm.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)

### 2.1. Cấu trúc Quản lý Trạng thái Tài nguyên Hợp nhất (Unified State Architecture)
```mermaid
flowchart TD
    CLI["CLI Command (install / update / skill / rule)"] --> LockfileMgr["src/core/assets/lockfile.ts"]
    LockfileMgr --> SingleLock["only-one/installed.json\n(Single Source of Truth)"]
    SingleLock --> RulesState["rules: Record<string, InstalledAssetRecord>"]
    SingleLock --> SkillsState["skills: Record<string, InstalledAssetRecord & { remote?: RemoteSkillLockMeta } >"]
    SingleLock --> WorkflowsState["workflows: Record<string, InstalledAssetRecord>"]
    SingleLock --> OtherState["mcps / packages / combos / vs / git"]
    
    UpdateCmd["only-one update [--prune] [--force]"] --> SyncEngine["src/core/assets/sync.ts"]
    SyncEngine --> CheckDisk["checkAssetFilesExist(projectDir, type, id)"]
    CheckDisk --> Compare["Phân loại: up-to-date | outdated | missing | removed"]
    Compare --> AutoRestore["missing -> Apply template & restore files"]
    Compare --> Reconcile["outdated -> Apply overwrite & update lockfile"]
    Compare --> PruneOrphan["removed -> pruneAssetUpdates (khi có --prune)"]
```

### 2.2. Các Quyết định Kỹ thuật Chính
1. **Decimal Rollover Arithmetic ([src/core/assets/version.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/version.ts))**: Hàm thuần túy kiểm tra định dạng `^\d+\.\d+\.\d+$`, cuộn vòng từ 9 về 0 và tăng chữ số liền trước.
2. **Hard Cutover Single Source of Truth ([src/core/assets/lockfile.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/lockfile.ts))**: Hàm `resolveInstalledLockfilePath` trỏ trực tiếp đến `join(projectDir, 'only-one', 'installed.json')`, loại bỏ toàn bộ code path dự phòng của thư mục `.only-one/`.
3. **Unified Remote Skill Schema ([src/core/assets/types.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/types.ts) & [src/core/skill/remote/lockfile.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/skill/remote/lockfile.ts))**:
   - `InstalledAssetRecord` được mở rộng với `remote?: RemoteSkillLockMeta`.
   - `saveSkillToLockfile` và `readSkillsLockfile` đóng vai trò adapter layer tương thích ngược, thao tác trực tiếp trên `only-one/installed.json` và ngừng tạo `skills-lock.json`.
4. **Resilient Auto-Restore & Safe Pruning ([src/core/assets/sync.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/sync.ts))**:
   - Tự động khôi phục missing files bằng cách tạo đệ quy thư mục đích và copy template gốc.
   - Chỉ xóa file mồ côi khi có cờ tường minh `--prune`, tuyệt đối không xóa file tùy biến do người dùng tự tạo nếu không có trong `installed.json`.

## 3. Scope & Key Modules (Phạm vi & Các Module Chính)
- **Asset Types & Manifests**:
  - [`assets/types.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/types.ts): Bổ sung `version: string` cho tất cả manifest interfaces.
  - Manifest registries: [`assets/rules/index.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/rules/index.ts), [`assets/packages/index.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/packages/index.ts), [`assets/mcps/index.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/mcps/index.ts), [`assets/vs/index.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/vs/index.ts), [`assets/skills/index.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/skills/index.ts), [`assets/workflows/index.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/index.ts), [`assets/combos/index.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/combos/index.ts), [`assets/git/index.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/git/index.ts).
- **Core Versioning & Lockfile**:
  - [`src/core/assets/version.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/version.ts): Thuật toán decimal rollover arithmetic.
  - [`src/core/assets/types.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/types.ts): Khai báo `InstalledAssetRecord`, `RemoteSkillLockMeta`, `OnlyOneInstalledState`, `AssetUpdateStatus` (`up-to-date`, `outdated`, `missing`, `removed`).
  - [`src/core/assets/lockfile.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/lockfile.ts): Đọc/ghi và xóa record `only-one/installed.json` atomic (`removeInstalledAsset`).
  - [`src/core/skill/remote/lockfile.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/skill/remote/lockfile.ts): Adapter layer cho GitHub remote skills lưu vào `installed.json`.
  - [`src/core/assets/sync.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/sync.ts): Engine kiểm tra file tồn tại trên đĩa, đồng bộ, auto-restore và prune asset mồ côi.
- **Developer Tooling & CI Gate**:
  - [`src/core/assets/bump.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/bump.ts) & [`scripts/bump-asset.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/scripts/bump-asset.ts): Tự động bump version.
  - [`src/core/assets/gate.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/gate.ts): Zero-bypass gate kiểm tra coverage và version bumps.
- **Installers & Update Command Integration**:
  - [`src/commands/update/command.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/commands/update/command.ts): Hỗ trợ cờ `--prune`.
  - [`src/commands/update/actions/step-2-update-artifacts.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/commands/update/actions/step-2-update-artifacts.ts): Kết nối logic auto-restore và prune.
  - [`src/tui/views/UpdateView.tsx`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/tui/views/UpdateView.tsx): Menu item Prune Orphaned Assets.

## 4. Verification Evidence (Bằng chứng Kiểm thử)
- **Unit & Integration Tests**:
  - `test/core/assets/version.test.ts` (9 tests passed)
  - `test/core/assets/lockfile.test.ts` (4 tests passed)
  - `test/core/assets/version-gate.test.ts` (2 tests passed)
  - `test/core/assets/sync.test.ts` (4 tests passed)
  - `test/commands/update/update.test.ts` (3 tests passed)
  - `test/core/skill-lockfile.test.ts` (5 tests passed)
  - `test/commands/skill/skill.test.ts` (2 tests passed)
- **Full Test Suite**: 56 test files passed, 229 tests passed (100% pass rate).
- **TypeScript & Build**: `npm run format:check && npm run build` sạch 100% (0 errors).
