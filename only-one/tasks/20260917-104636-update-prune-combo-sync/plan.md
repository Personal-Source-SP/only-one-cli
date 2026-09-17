---
status: done
slug: update-prune-combo-sync
started_at: 2026-09-17
completed_at: 2026-09-17
pr_url: ~
branch: ~
---

# Plan: Cải tiến Lệnh Update Tự Động Đồng Bộ Asset Mới Của Combo Khi Sử Dụng Cờ --prune

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- `inspectAssetUpdates()` trong `sync.ts` chỉ quét tập hợp asset đã tồn tại trong `lockfile.installed` (`workflows`, `skills`, `rules`), dẫn đến việc không phát hiện được asset mới xuất hiện trong combo upstream.
- Quá trình thực thi `installCombo()` trong `src/core/combo/index.ts` chỉ ghi nhận các item con riêng lẻ mà chưa lưu vết combo cha vào `installed.json` (`installed.combos`).
- Cờ `--prune` hiện tại chỉ xử lý 1 chiều (xóa orphan assets đã bị gỡ bỏ upstream).

### Invariants Bắt Buộc Duy Trì
- **Idempotency**: Chạy `only-one update --prune` nhiều lần liên tiếp không gây lỗi hoặc sinh file trùng lặp.
- **Single Source of Truth**: Toàn bộ trạng thái đã cài đặt (bao gồm combo và asset con) quy tụ duy nhất về `only-one/installed.json`.
- **Default Safety**: Lệnh `only-one update` (không kèm cờ `--prune`) tuyệt đối không tự ý cài thêm asset mới hoặc xóa asset cũ, bảo toàn tính an toàn mặc định.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

*(Kế thừa 100% cơ chế vận hành từ concept.md; không mô tả lại giải pháp tổng quan)*

### Type Signatures & Code Contracts

```typescript
// src/core/assets/types.ts
export type AssetUpdateStatus = 'up-to-date' | 'outdated' | 'missing' | 'removed' | 'added' | 'untracked';

export interface AssetSyncResult {
    inspected: AssetInspectionItem[];
    outdated: AssetInspectionItem[];
    upToDate: AssetInspectionItem[];
    missing: AssetInspectionItem[];
    removed: AssetInspectionItem[];
    added: AssetInspectionItem[]; // Newly added assets from installed combos
}

export interface AppliedAssetUpdateResult {
    updated: Array<{ type: AssetType; id: string; fromVersion: string; toVersion: string }>;
    restored: Array<{ type: AssetType; id: string; version: string }>;
    added: Array<{ type: AssetType; id: string; version: string }>; // Track installed added combo assets
    failed: Array<{ type: AssetType; id: string; error: string }>;
}

export interface InspectAssetOptions {
    prune?: boolean;
}
```

### AST Seams & Callers
- **`src/core/combo/index.ts:installCombo()`**: Bổ sung `recordInstalledAssetsBatch(projectDir, [{ type: 'combos', id: combo.id, version: combo.version }])` ở cuối luồng cài đặt combo.
- **`src/core/assets/sync.ts:inspectAssetUpdates()`**: Nhận tham số `options?: InspectAssetOptions`. Khi `options.prune === true`, đọc `lockfile.installed.combos`, nạp manifest tương ứng từ `COMBOS`, phát hiện asset mới chưa có trong lockfile/disk và gán `status: 'added'`.
- **`src/core/assets/sync.ts:applyAssetUpdates()`**: Xử lý `item.status === 'added'` tương tự cơ chế copy asset template và phân loại vào mảng `result.added`.
- **`src/commands/update/actions/step-2-update-artifacts.ts:updateArtifactsStep()`**: Truyền `options.prune` vào `inspectAssetUpdates()`, đưa `assetSync.added` vào danh sách `itemsToUpdate`, đồng thời format hiển thị `✨ Added New Combo Assets:` trên terminal và JSON payload.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes

```text
src/
├── core/
│   ├── assets/
│   │   ├── [MODIFY] types.ts           # Bổ sung trạng thái 'added' vào AssetUpdateStatus & AssetSyncResult
│   │   └── [MODIFY] sync.ts            # Nạp combo manifests và đối soát added assets khi prune=true
│   └── combo/
│       └── [MODIFY] index.ts           # Ghi nhận installed.combos vào lockfile khi installCombo
└── commands/
    └── update/
        └── actions/
            └── [MODIFY] step-2-update-artifacts.ts # Reconcile itemsToUpdate & báo cáo CLI/JSON
test/
└── commands/
    └── update/
        └── [MODIFY] update.test.ts     # Test case tự động sync added combo workflows khi update --prune
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/core/assets/types.ts` | `AssetUpdateStatus`, `AssetSyncResult`, `AppliedAssetUpdateResult` | `None` | `npm test test/commands/update/update.test.ts` |
| **2** | `[x]` | `[MODIFY]` | `src/core/combo/index.ts` | `installCombo` | `Order 1` | `npm test test/core/combo.test.ts` |
| **3** | `[x]` | `[MODIFY]` | `src/core/assets/sync.ts` | `inspectAssetUpdates`, `applyAssetUpdates` | `Order 1` | `npm test test/core/assets/sync.test.ts` |
| **4** | `[x]` | `[MODIFY]` | `src/commands/update/actions/step-2-update-artifacts.ts` | `updateArtifactsStep` | `Order 3` | `npm test test/commands/update/update.test.ts` |
| **5** | `[x]` | `[MODIFY]` | `test/commands/update/update.test.ts` | `Update Command Integration Tests` | `Order 4` | `npm test test/commands/update/update.test.ts` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/core/assets/types.ts`
> **Action**: Bổ sung `'added'` vào `AssetUpdateStatus` và thêm mảng `added` vào kết quả `AssetSyncResult`, `AppliedAssetUpdateResult`.

```diff
@@ -26,3 +26,3 @@
-export type AssetUpdateStatus = 'up-to-date' | 'outdated' | 'missing' | 'removed' | 'untracked';
+export type AssetUpdateStatus = 'up-to-date' | 'outdated' | 'missing' | 'removed' | 'added' | 'untracked';
 
 export interface AssetInspectionItem {
```

```diff
@@ -35,2 +35,6 @@
 }
+
+export interface InspectAssetOptions {
+    prune?: boolean;
+}
```

### 2. `[MODIFY]` `src/core/combo/index.ts`
> **Action**: Lưu vết combo đã cài vào `installed.json` sau khi hoàn thành các bước cài đặt.

```diff
@@ -28,2 +28,3 @@
 import { WORKFLOWS } from '@assets/workflows/index.js';
 import { MCPS } from '@assets/mcps/index.js';
+import { recordInstalledAssetsBatch } from '@/core/assets/lockfile.js';
 
@@ -654,2 +655,8 @@
     }
 
+    await recordInstalledAssetsBatch(projectDir, [
+        {
+            type: 'combos',
+            id: combo.id,
+            version: combo.version || '1.0.0',
+        },
+    ]);
+
     return results;
```

### 3. `[MODIFY]` `src/core/assets/sync.ts`
> **Action**: Đối chiếu `installed.combos` với `COMBOS` khi `options.prune === true`, đánh dấu asset mới là `added` và install trong `applyAssetUpdates`.

```diff
@@ -6,4 +6,5 @@
 import { RULES } from '../../../assets/rules/index.js';
+import { COMBOS } from '../../../assets/combos/index.js';
 import { resolvePackageRoot } from '@/core/runtime/package-root.js';
 import { compareDecimalVersions } from './version.js';
 import { readInstalledLockfile, recordInstalledAssetsBatch, removeInstalledAsset } from './lockfile.js';
-import type { AssetInspectionItem, AssetType } from './types.js';
+import type { AssetInspectionItem, AssetType, InspectAssetOptions } from './types.js';
 
 export interface AssetSyncResult {
     inspected: AssetInspectionItem[];
     outdated: AssetInspectionItem[];
     upToDate: AssetInspectionItem[];
     missing: AssetInspectionItem[];
     removed: AssetInspectionItem[];
+    added: AssetInspectionItem[];
 }
 
 export interface AppliedAssetUpdateResult {
     updated: Array<{ type: AssetType; id: string; fromVersion: string; toVersion: string }>;
     restored: Array<{ type: AssetType; id: string; version: string }>;
+    added: Array<{ type: AssetType; id: string; version: string }>;
     failed: Array<{ type: AssetType; id: string; error: string }>;
 }
```

```diff
@@ -57,3 +60,3 @@
-export async function inspectAssetUpdates(projectDir: string): Promise<AssetSyncResult> {
+export async function inspectAssetUpdates(projectDir: string, options?: InspectAssetOptions): Promise<AssetSyncResult> {
     const lockfile = await readInstalledLockfile(projectDir);
     const inspected: AssetInspectionItem[] = [];
```

```diff
@@ -147,2 +150,53 @@
     }
+
+    // If prune is requested, reconcile installed combos to pull in any newly added combo assets
+    if (options?.prune) {
+        const installedCombos = lockfile.installed.combos || {};
+        for (const [comboId] of Object.entries(installedCombos)) {
+            const comboManifest = COMBOS.find((c) => c.id.toLowerCase() === comboId.toLowerCase() || c.name.toLowerCase() === comboId.toLowerCase());
+            if (!comboManifest) continue;
+
+            // Check combo workflows
+            if (comboManifest.workflows?.length) {
+                for (const wfName of comboManifest.workflows) {
+                    if (!installedWorkflows[wfName]) {
+                        const wfManifest = WORKFLOWS.find((w) => w.name === wfName);
+                        if (wfManifest && !inspected.some((i) => i.type === 'workflows' && i.id === wfName)) {
+                            inspected.push({
+                                type: 'workflows',
+                                id: wfName,
+                                name: wfName,
+                                latestVersion: wfManifest.version,
+                                status: 'added',
+                            });
+                        }
+                    }
+                }
+            }
+
+            // Check combo skills
+            if (comboManifest.skills?.length) {
+                for (const skillName of comboManifest.skills) {
+                    if (!installedSkills[skillName]) {
+                        const skillManifest = SKILLS.find((s) => s.name === skillName);
+                        if (skillManifest && !inspected.some((i) => i.type === 'skills' && i.id === skillName)) {
+                            inspected.push({
+                                type: 'skills',
+                                id: skillName,
+                                name: skillName,
+                                latestVersion: skillManifest.version,
+                                status: 'added',
+                            });
+                        }
+                    }
+                }
+            }
+        }
+    }
 
     const outdated = inspected.filter((i) => i.status === 'outdated');
     const upToDate = inspected.filter((i) => i.status === 'up-to-date');
     const missing = inspected.filter((i) => i.status === 'missing');
     const removed = inspected.filter((i) => i.status === 'removed');
+    const added = inspected.filter((i) => i.status === 'added');
 
     return {
         inspected,
         outdated,
         upToDate,
         missing,
         removed,
+        added,
     };
```

```diff
@@ -167,2 +221,3 @@
     const restored: AppliedAssetUpdateResult['restored'] = [];
+    const added: AppliedAssetUpdateResult['added'] = [];
     const failed: AppliedAssetUpdateResult['failed'] = [];
@@ -218,2 +273,8 @@
                 });
+            } else if (item.status === 'added') {
+                added.push({
+                    type: item.type,
+                    id: item.id,
+                    version: item.latestVersion,
+                });
             } else {
@@ -239,3 +300,3 @@
-    return { updated, restored, failed };
+    return { updated, restored, added, failed };
 }
```

### 4. `[MODIFY]` `src/commands/update/actions/step-2-update-artifacts.ts`
> **Action**: Cập nhật hàm `updateArtifactsStep` để truyền cờ prune vào `inspectAssetUpdates`, đưa item `added` vào `itemsToUpdate`, và format output `✨ Added New Combo Assets:`.

```diff
@@ -15,5 +15,7 @@
-    const assetSync = await inspectAssetUpdates(projectDir);
+    const assetSync = await inspectAssetUpdates(projectDir, { prune: options.prune });
 
     let assetUpdateResult = null;
     const itemsToUpdate = options.force
         ? assetSync.inspected.filter((i) => i.status !== 'removed')
-        : [...assetSync.outdated, ...assetSync.missing];
+        : [...assetSync.outdated, ...assetSync.missing, ...assetSync.added];
```

```diff
@@ -58,2 +60,4 @@
             } else if (item.status === 'removed') {
                 statusBadge = COLORS.error(`✕ Removed upstream (Orphaned)`);
+            } else if (item.status === 'added') {
+                statusBadge = COLORS.primary(`✚ New combo asset (Installing...)`);
             } else {
@@ -77,2 +81,9 @@
         }
 
+        if (assetUpdateResult && assetUpdateResult.added && assetUpdateResult.added.length > 0) {
+            deps.stdout(`\n${COLORS.success('✨ Added New Combo Assets:')}`);
+            for (const a of assetUpdateResult.added) {
+                deps.stdout(`  - [${a.type}] ${COLORS.secondary(a.id)}: Installed template (${COLORS.primary(a.version)})`);
+            }
+        }
+
         if (assetPruneResult && assetPruneResult.pruned.length > 0) {
```

### 5. `[MODIFY]` `test/commands/update/update.test.ts`
> **Action**: Thêm unit test kiểm tra luồng tự động cập nhật asset mới của combo khi chạy `only-one update --prune`.

```diff
@@ -87,2 +87,28 @@
     });
+
+    it('automatically syncs newly added combo assets when --prune is provided', async () => {
+        const stdoutLines: string[] = [];
+        const deps: Partial<ProgramDeps> = {
+            stdout: (msg: string) => stdoutLines.push(msg),
+            stderr: () => {},
+            cwd: testProjectDir,
+        };
+
+        // Record full-sdlc-flow combo in lockfile with only 1 workflow
+        await recordInstalledAssetsBatch(testProjectDir, [
+            { type: 'combos', id: 'full-sdlc-flow', version: '1.0.0' },
+            { type: 'workflows', id: 'only-one-clockify', version: '1.0.0' },
+        ]);
+
+        const cmd = createUpdateCommand(deps as ProgramDeps);
+        await cmd.parseAsync(['node', 'test', testProjectDir, '--prune']);
+
+        const output = stdoutLines.join('\n');
+        expect(output).toContain('Added New Combo Assets');
+        
+        const lockfile = await readInstalledLockfile(testProjectDir);
+        expect(lockfile.installed.workflows).toBeDefined();
+        expect(lockfile.installed.workflows?.['only-one-idea']).toBeDefined();
+    });
```

---

## Section 5. Test Cases & Verification
- **Automated Tests**:
  - `[x]` `npm test test/commands/update/update.test.ts` (PASS - 4/4 tests passed)
  - `[x]` `npm test test/core/combo.test.ts` (PASS - 12/12 tests passed)
  - `[x]` `npm test test/core/assets/sync.test.ts` (PASS - 4/4 tests passed)
  - `[x]` `npm test` (PASS - 55 test files passed, 232 tests passed)
  - `[x]` `npm run build` (PASS - TypeScript & Prettier check 100% clean)
- **Manual Checks**:
  - `[x]` `only-one update` mặc định: Giữ nguyên các asset hiện có, an toàn không can thiệp.
  - `[x]` `only-one update --prune`: Quét danh sách combo đã cài (`installed.combos`), tự động phát hiện asset mới (`status: 'added'`) và cài đặt thành công, đồng thời dọn dẹp các asset mồ côi (`removed`).
