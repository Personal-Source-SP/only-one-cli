# Walkthrough: Hoàn tất Triển khai Quản lý Phiên bản Độc lập (Asset Versioning) & Cơ chế Đồng bộ (Sync/Update) cho Assets

Tài liệu tóm lược toàn bộ kết quả thực thi và bằng chứng kiểm thử theo kế hoạch triển khai tại [plan.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/only-one/tasks/20260903-104500-asset-versioning-and-sync/plan.md).

---

## 1. Tóm tắt Thay đổi (Summary of Changes)

### 1.1. Schema & Asset Manifests Coverage
- **Bổ sung thuộc tính `version: string`**:
  - Đã cập nhật toàn bộ các interface trong [assets/types.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/types.ts) (`RuleManifest`, `PackageManifest`, `McpManifest`, `VsLibraryManifest`, `SkillManifest`, `WorkflowManifest`, `ConfigManifest`, `ComboManifest`, `GitAssetManifest`).
  - Gán phiên bản mặc định khởi tạo `"0.0.1"` cho 100% các thành phần asset trong:
    - [assets/rules/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/rules/index.ts) (3 rules)
    - [assets/packages/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/packages/index.ts) (3 packages)
    - [assets/mcps/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/mcps/index.ts) (7 mcps)
    - [assets/vs/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/vs/index.ts) (`VS_LIBRARY`)
    - [assets/skills/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/skills/index.ts) (29 skills)
    - [assets/workflows/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/index.ts) (12 workflows)
    - [assets/combos/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/combos/index.ts) (5 combos)
    - [assets/git/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/git/index.ts) (2 git profiles & 7 snippets)

### 1.2. Core Versioning & Lockfile Management
- **Decimal Rollover Arithmetic ([src/core/assets/version.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/version.ts))**:
  - Triển khai thuật toán tăng phiên bản cơ số 10: `0.0.1` $\rightarrow$ `0.0.9` $\rightarrow$ `0.1.0` $\rightarrow$ `0.9.9` $\rightarrow$ `1.0.0`.
  - Cung cấp các hàm `isValidDecimalVersion`, `bumpDecimalVersion`, `compareDecimalVersions`.
- **Project State Tracking ([src/core/assets/lockfile.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/lockfile.ts))**:
  - Quản lý file lockfile `.only-one/installed.json` trong dự án người dùng, ghi nhận chi tiết thời điểm cài đặt và phiên bản của từng asset độc lập.
  - Hỗ trợ fallback và ghi file atomic.

### 1.3. Developer Tooling & Zero-Bypass CI Gate
- **CLI Helper Bump Tool ([src/core/assets/bump.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/bump.ts) & [scripts/bump-asset.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/scripts/bump-asset.ts))**:
  - Hỗ trợ lệnh `pnpm asset:bump <type> <id>` để tự động tìm và tăng version trực tiếp trong manifest tương ứng mà không cần dev sửa tay.
- **CI Gate ([src/core/assets/gate.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/gate.ts))**:
  - Tích hợp kiểm tra git diff so với commit gốc; xác thực độ phủ 100% manifest version và phát hiện file template bị sửa đổi nhưng quên tăng version.

### 1.4. Integrations & Update Command Enhancement
- **Installers Integration**:
  - Đã tích hợp ghi nhận lockfile tự động khi cài đặt thành công tại [src/core/workflow/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/workflow/index.ts), [src/core/rule/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/rule/index.ts), [src/core/skill/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/skill/index.ts).
- **Reconciliation & Sync Engine ([src/core/assets/sync.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/sync.ts))**:
  - Nâng cấp [src/commands/update/actions/step-2-update-artifacts.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/commands/update/actions/step-2-update-artifacts.ts) để đối soát installed version so với latest version và tự động áp dụng cập nhật cho các assets outdated.

---

## 2. Bằng chứng Kiểm thử (Verification Evidence)

### 2.1. Kiểm thử Unit Tests Chuyên biệt cho Module Mới
```bash
# 1. Kiểm thử thuật toán Decimal Rollover
npx vitest run test/core/assets/version.test.ts
# Kết quả: 9/9 tests passed (4ms)

# 2. Kiểm thử Lockfile Persistence
npx vitest run test/core/assets/lockfile.test.ts
# Kết quả: 4/4 tests passed (8ms)

# 3. Kiểm thử Version Gate & 100% Manifest Coverage
npx vitest run test/core/assets/version-gate.test.ts
# Kết quả: 2/2 tests passed (3ms) - 100% manifests đều có valid version

# 4. Kiểm thử Synchronization & Reconciliation
npx vitest run test/core/assets/sync.test.ts
# Kết quả: 2/2 tests passed (7ms)
```

### 2.2. Kiểm thử Toàn bộ Repository (Full Test Suite)
```bash
npm test
```
- **Kết quả**:
  - **Test Files**: 54 passed | 2 skipped (56 files)
  - **Tests**: 221 passed | 4 skipped (225 tests)
  - **Pass Rate**: 100% tests đạt yêu cầu.

### 2.3. Typecheck & Build Production Bundle
```bash
npm run format:check && npx tsc --noEmit
npm run build
```
- **Prettier**: All matched files use Prettier code style!
- **TypeScript**: 0 errors (`tsc -p tsconfig.json` clean).
- **Build**: Output `./dist/` được đóng gói hoàn tất.

---

## 3. Hướng dẫn Sử dụng (Developer Usage)

### 3.1. Khi Developer chỉnh sửa một asset trong CLI:
Chỉ cần chạy lệnh helper để tự động tăng version cho thành phần đó:
```bash
# Tăng version cho workflow only-one-idea (ví dụ: 0.0.1 -> 0.0.2)
pnpm asset:bump workflow only-one-idea

# Tăng version cho skill c4-diagrams
pnpm asset:bump skill c4-diagrams

# Tăng version cho rule next-architecture-stack
pnpm asset:bump rule next-architecture-stack
```

### 3.2. Khi Người dùng chạy cập nhật trong dự án:
```bash
only-one update
```
CLI sẽ tự động:
1. Đọc trạng thái từ `.only-one/installed.json`.
2. Hiển thị danh sách các thành phần đang cài đặt kèm trạng thái (`✓ Up to date` hoặc `▲ Outdated (0.0.1 -> 0.0.2)`).
3. Tự động ghi đè file template mới và cập nhật version trong lockfile.
