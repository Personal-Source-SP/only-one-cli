---
status: done
slug: clean-stale-scripts
started_at: 2026-09-09
completed_at: 2026-09-09
pr_url: ~
branch: ~
---

# Plan: Dọn dẹp các script không còn sử dụng trong thư mục scripts/

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- Thư mục `scripts/` trước đây chứa 8 files, trong đó có 4 files mồ côi (orphaned/stale) gồm 1 shell script publish cũ (`publish-npm.sh`) và 3 one-off migration scripts (`fix-imports.mjs`, `move-tests-to-test-dir.mjs`, `port-openspec-adapters.mjs`).
- Các files này hoàn toàn không còn bất kỳ caller nào trong `package.json`, `src/`, `test/`, hoặc `.github/`.
- Invariants bắt buộc bảo toàn:
  - Giữ nguyên `cocoindex_documents.py` (runtime script cho indexing và doctor check).
  - Giữ nguyên `postbuild-paths.cjs` (build script sau `tsc`).
  - Giữ nguyên `publish.js` (tooling publish npm/local).
  - Giữ nguyên `bump-asset.ts` (tooling bump asset versions).

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

Kế thừa 100% cơ chế tại `concept.md`; không phát sinh Type Contract mới.

- **AST Seams & Callers Audit**:
  - `scripts/publish-npm.sh`: 0 callers (đã thay thế bởi `publish.js`).
  - `scripts/fix-imports.mjs`: 0 callers (migration script cũ).
  - `scripts/move-tests-to-test-dir.mjs`: 0 callers (migration script cũ).
  - `scripts/port-openspec-adapters.mjs`: 0 callers (migration script cũ).

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
scripts/
├── [DELETE] fix-imports.mjs             # Xóa script migration ESM dùng 1 lần
├── [DELETE] move-tests-to-test-dir.mjs  # Xóa script migration test files dùng 1 lần
├── [DELETE] port-openspec-adapters.mjs  # Xóa script migration openspec adapters dùng 1 lần
├── [DELETE] publish-npm.sh              # Xóa bash script publish cũ đã thay bằng publish.js
├── bump-asset.ts                        # [PRESERVED] Tooling bump asset version
├── cocoindex_documents.py               # [PRESERVED] Runtime indexing script
├── postbuild-paths.cjs                  # [PRESERVED] Build pipeline script
└── publish.js                           # [PRESERVED] Tooling publish npm/local
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[DELETE]` | `scripts/publish-npm.sh` | Whole File Removal | `None` | `npm run build` |
| **2** | `[x]` | `[DELETE]` | `scripts/fix-imports.mjs` | Whole File Removal | `None` | `npm run build` |
| **3** | `[x]` | `[DELETE]` | `scripts/move-tests-to-test-dir.mjs` | Whole File Removal | `None` | `npm run build` |
| **4** | `[x]` | `[DELETE]` | `scripts/port-openspec-adapters.mjs` | Whole File Removal | `None` | `npm run build` |

## Section 4. Code Changes (Unified Diff)

### 1. `[DELETE]` `scripts/publish-npm.sh`
> **Action**: Xóa bỏ shell script publish cũ đã được thay thế hoàn toàn bởi `scripts/publish.js`.

```diff
- # Entire file deleted (6104 bytes)
```

### 2. `[DELETE]` `scripts/fix-imports.mjs`
> **Action**: Xóa bỏ migration script sửa import `.js` dùng 1 lần trong đợt chuyển đổi ESM.

```diff
- # Entire file deleted (2840 bytes)
```

### 3. `[DELETE]` `scripts/move-tests-to-test-dir.mjs`
> **Action**: Xóa bỏ migration script di chuyển các file test vào thư mục `test/` dùng 1 lần.

```diff
- # Entire file deleted (2735 bytes)
```

### 4. `[DELETE]` `scripts/port-openspec-adapters.mjs`
> **Action**: Xóa bỏ migration script chuyển đổi adapter OpenSpec dùng 1 lần.

```diff
- # Entire file deleted (1936 bytes)
```

## Section 5. Test Cases & Verification

- **Automated Tests**:
  - `[x]` `npm run format:check` -> **PASS** (All matched files use Prettier code style).
  - `[x]` `npm run build` -> **PASS** (TypeScript build & `postbuild-paths.cjs` executed cleanly).
  - `[x]` `npm test` -> **PASS** (56 test files passed, 229 tests passed, 0 failures).
- **Manual Checks**:
  - `[x]` Thư mục `scripts/` chỉ còn 4 files hoạt động: `cocoindex_documents.py`, `postbuild-paths.cjs`, `publish.js`, `bump-asset.ts`.
