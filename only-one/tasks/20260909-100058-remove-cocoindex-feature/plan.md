---
status: done
slug: remove-cocoindex-feature
started_at: 2026-09-09
completed_at: 2026-09-09
pr_url: ~
branch: ~
---

# Plan: Loại bỏ hoàn toàn tính năng và thành phần liên quan đến CocoIndex

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- CocoIndex hiện tại là một tính năng legacy không còn được sử dụng trong luồng vận hành chính của `only-one-cli`.
- Các tệp và điểm neo liên quan:
  - `scripts/cocoindex_documents.py`: File script Python placeholder.
  - `scripts/publish.js` & `package.json`: Copy script và đưa `scripts` vào danh sách đóng gói npm.
  - `src/core/doctor/`: Các hàm `checkCocoindex`, `checkCocoindexLocal`, `checkCocoindexDocker` và installer `pip3 install cocoindex`.
  - `src/core/indexing/`: `tools.ts` và các hàm container args trong `docker-runtime.ts`.
  - `src/core/prebuilt/`: `indexers.ts` (`runCocoindex`), `manifest.ts` (`cocoindexVersion`, `.cocoindex` dir), `bundle.ts` (`.cocoindex`).
  - `src/core/client/types.ts`: `cocoindexVersion` trong `IndexVersionMetadata` và `LatestIndexMetadata`.
  - `src/commands/structure-generate/`: Gợi ý `--skip-cocoindex`.
  - `test/core/indexing/tools.test.ts`: Test kiểm tra đường dẫn script.
- Invariants bắt buộc bảo toàn:
  - Bảo toàn toàn bộ các doctor checks cho Git, Node.js, IDE settings, MCP, Skills, Rules, Ignore files.
  - Bảo toàn các generic Docker helpers trong `docker-runtime.ts` (`isDockerDaemonRunning`, `getDockerServerVersion`, `hasDockerImage`, `getContainerState`, `ensureContainerRunning`).
  - Bảo toàn cơ chế tạo manifest của `src/core/prebuilt/indexers.ts` (`createManifest`).

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

- **Type Signatures & Code Contracts**:
  - `src/core/doctor/types.ts`: Định nghĩa trực tiếp `export type DoctorMode = 'docker' | 'local';` (thay vì import từ `tools.ts`).
  - `src/core/prebuilt/manifest.ts`: Bỏ trường `cocoindexVersion` khỏi `ManifestData`.
  - `src/core/client/types.ts`: Bỏ trường `cocoindexVersion` khỏi `IndexVersionMetadata` và `LatestIndexMetadata`.
- **AST Seams & Callers**:
  - `src/core/doctor/checks.ts`: Gỡ bỏ `checkCocoindex`, `checkCocoindexLocal`, `checkCocoindexDocker`. Đơn giản hóa `runIndexingChecks` chỉ chạy `checkDocker(mode)`.
  - `src/core/doctor/install.ts`: Gỡ bỏ xử lý `missing.includes('cocoindex')` trong `buildInstallScript` và `runMissingInstalls`.
  - `src/core/indexing/docker-runtime.ts`: Gỡ bỏ `COCOINDEX_CONTAINER_NAME`, `cocoindexContainerRunArgs`, `ensureCocoindexContainerRunning`, `verifyCocoindexInContainer`.
  - `src/core/prebuilt/indexers.ts`: Gỡ bỏ `runCocoindex`, `runCocoindexLocal`, `runCocoindexDocker`.
  - `src/core/prebuilt/manifest.ts`: Gỡ bỏ `detectCocoindexVersion` và loại bỏ `.cocoindex` khỏi `ARTIFACT_DIRS`.
  - `src/core/prebuilt/bundle.ts`: Loại bỏ `.cocoindex` khỏi `CORE_BUNDLE_ENTRIES`.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
package.json                                                # [MODIFY] Xoá scripts khỏi files phân phối
scripts/
├── [DELETE] cocoindex_documents.py                         # Xoá Python entrypoint placeholder
└── [MODIFY] publish.js                                     # Bỏ bước copy cocoindex_documents.py
src/
├── commands/structure-generate/actions/
│   └── [MODIFY] step-4-generate-payload-and-report.ts      # Bỏ flag --skip-cocoindex
├── core/
│   ├── client/
│   │   └── [MODIFY] types.ts                               # Bỏ cocoindexVersion metadata
│   ├── doctor/
│   │   ├── [MODIFY] types.ts                               # Khai báo DoctorMode nội bộ
│   │   ├── [MODIFY] checks.ts                              # Gỡ bỏ checkCocoindex
│   │   └── [MODIFY] install.ts                             # Gỡ bỏ cocoindex auto-installer
│   ├── indexing/
│   │   ├── [DELETE] tools.ts                               # Xoá helper chuyên biệt cocoindex
│   │   └── [MODIFY] docker-runtime.ts                      # Gỡ bỏ cocoindex container helpers
│   └── prebuilt/
│       ├── [MODIFY] bundle.ts                              # Gỡ bỏ .cocoindex khỏi bundle entries
│       ├── [MODIFY] indexers.ts                            # Gỡ bỏ runCocoindex runner
│       └── [MODIFY] manifest.ts                            # Gỡ bỏ cocoindexVersion & artifact dir
test/
└── core/indexing/
    └── [DELETE] tools.test.ts                              # Xoá bài test kiểm tra cocoindex script
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[DELETE]` | `scripts/cocoindex_documents.py` | Whole File Removal | `None` | `npm run format:check` |
| **2** | `[x]` | `[DELETE]` | `test/core/indexing/tools.test.ts` | Whole File Removal | `None` | `npm test` |
| **3** | `[x]` | `[MODIFY]` | `package.json` | `files` array | `None` | `npm run format:check` |
| **4** | `[x]` | `[MODIFY]` | `scripts/publish.js` | Packaging file copy logic | `None` | `npm run format:check` |
| **5** | `[x]` | `[MODIFY]` | `src/core/doctor/types.ts` | `DoctorMode` definition | `None` | `npm run format:check` |
| **6** | `[x]` | `[DELETE]` | `src/core/indexing/tools.ts` | Whole File Removal | `Order 5` | `npm run format:check` |
| **7** | `[x]` | `[MODIFY]` | `src/core/indexing/docker-runtime.ts` | Remove cocoindex helpers | `Order 6` | `npm test test/core/indexing/repo-discovery.test.ts` |
| **8** | `[x]` | `[MODIFY]` | `src/core/doctor/checks.ts` | Remove checkCocoindex | `Order 6, 7` | `npm test test/commands/doctor/doctor.test.ts` |
| **9** | `[x]` | `[MODIFY]` | `src/core/doctor/install.ts` | Remove cocoindex install | `Order 6, 7` | `npm test test/commands/doctor/doctor.test.ts` |
| **10** | `[x]` | `[MODIFY]` | `src/core/prebuilt/bundle.ts` | `CORE_BUNDLE_ENTRIES` | `None` | `npm test test/core/prebuilt/index-output.test.ts` |
| **11** | `[x]` | `[MODIFY]` | `src/core/prebuilt/manifest.ts` | `ManifestData`, `buildManifestData` | `Order 6` | `npm test test/core/prebuilt/index-output.test.ts` |
| **12** | `[x]` | `[MODIFY]` | `src/core/prebuilt/indexers.ts` | Remove `runCocoindex` | `Order 6, 11` | `npm test test/core/prebuilt/index-output.test.ts` |
| **13** | `[x]` | `[MODIFY]` | `src/core/client/types.ts` | `IndexVersionMetadata` | `None` | `npm run format:check` |
| **14** | `[x]` | `[MODIFY]` | `src/commands/structure-generate/actions/step-4-generate-payload-and-report.ts` | Output hints | `None` | `npm test test/commands/structure/structure.test.ts` |

## Section 4. Code Changes (Unified Diff)

### 1. `[DELETE]` `scripts/cocoindex_documents.py`
> **Action**: Xóa bỏ Python script entrypoint placeholder của CocoIndex.

```diff
- # Entire file deleted
```

### 2. `[DELETE]` `test/core/indexing/tools.test.ts`
> **Action**: Xóa bỏ test file kiểm tra CocoIndex script locator.

```diff
- # Entire file deleted
```

### 3. `[MODIFY]` `package.json`
> **Action**: Loại bỏ `scripts` khỏi danh sách `files` phân phối của npm package.

```diff
@@ -12,5 +12,4 @@
     "files": [
         "dist",
-        "scripts",
         "assets"
     ],
```

### 4. `[MODIFY]` `scripts/publish.js`
> **Action**: Bỏ logic copy `cocoindex_documents.py` khi build pack tarball.

```diff
@@ -113,7 +113,0 @@
-const scriptsDir = path.join(packRoot, 'scripts');
-fs.mkdirSync(scriptsDir, { recursive: true });
-const docScript = path.join(ROOT, 'scripts', 'cocoindex_documents.py');
-if (fs.existsSync(docScript)) {
-  fs.copyFileSync(docScript, path.join(scriptsDir, 'cocoindex_documents.py'));
-}
```

### 5. `[MODIFY]` `src/core/doctor/types.ts`
> **Action**: Khai báo trực tiếp `DoctorMode` thay vì import từ `indexing/tools.js`.

```diff
@@ -3,1 +3,1 @@
-import type { DoctorMode } from '@/core/indexing/tools.js';
+export type DoctorMode = 'docker' | 'local';
```

### 6. `[DELETE]` `src/core/indexing/tools.ts`
> **Action**: Xóa bỏ file `tools.ts` vì chỉ chứa các hằng số và hàm riêng của CocoIndex.

```diff
- # Entire file deleted
```

### 7. `[MODIFY]` `src/core/indexing/docker-runtime.ts`
> **Action**: Gỡ bỏ các hằng số và hàm riêng của container CocoIndex, giữ nguyên các generic Docker utilities.

```diff
@@ -2,5 +2,0 @@
-import { resolveCocoindexImage } from '@/core/indexing/tools.js';
-
-export const COCOINDEX_CONTAINER_NAME = 'only-one-cocoindex';
-
@@ -57,28 +52,0 @@
-export function cocoindexContainerRunArgs(image: string): string[] {
-    return ['run', '-d', '--name', COCOINDEX_CONTAINER_NAME, '--restart', 'unless-stopped', '--entrypoint', 'sleep', image, 'infinity'];
-}
-
-export function ensureCocoindexContainerRunning(image = resolveCocoindexImage()): void {
-    ensureContainerRunning(COCOINDEX_CONTAINER_NAME, cocoindexContainerRunArgs(image));
-}
-
@@ -77,11 +63,0 @@
-export function verifyCocoindexInContainer(): void {
-    const state = getContainerState(COCOINDEX_CONTAINER_NAME);
-    if (state !== 'running') {
-        throw new Error(`container ${COCOINDEX_CONTAINER_NAME} is not running`);
-    }
-    execFileSync(DOCKER, ['exec', COCOINDEX_CONTAINER_NAME, 'ccc', '--help'], {
-        encoding: 'utf-8',
-        stdio: 'pipe',
-        timeout: 120_000,
-    });
-}
```

### 8. `[MODIFY]` `src/core/doctor/checks.ts`
> **Action**: Gỡ bỏ import và các hàm check CocoIndex (`checkCocoindex`, `checkCocoindexLocal`, `checkCocoindexDocker`), cập nhật `runIndexingChecks`.

```diff
@@ -17,11 +17,3 @@
-import type { DoctorMode } from '@/core/indexing/tools.js';
-import { resolveCocoindexImage, resolveCocoindexScript } from '@/core/indexing/tools.js';
+import type { DoctorMode } from './types.js';
 import {
-    COCOINDEX_CONTAINER_NAME,
-    ensureCocoindexContainerRunning,
-    getContainerState,
     getDockerServerVersion,
-    hasDockerImage,
     isDockerDaemonRunning,
-    verifyCocoindexInContainer,
 } from '@/core/indexing/docker-runtime.js';
@@ -256,102 +248,0 @@
-export async function checkCocoindex(mode: DoctorMode, options: RunIndexingChecksOptions = {}): Promise<CheckResult> {
-...
-}
-
-async function checkCocoindexLocal(): Promise<CheckResult> {
-...
-}
-
-async function checkCocoindexDocker(options: RunIndexingChecksOptions): Promise<CheckResult> {
-...
-}
@@ -359,4 +250,3 @@
-export async function runIndexingChecks(mode: DoctorMode, options: RunIndexingChecksOptions = {}): Promise<CheckResult[]> {
-    const checksOptions = { autoStartContainers: options.autoStartContainers ?? true };
-    return Promise.all([checkDocker(mode), checkCocoindex(mode, checksOptions)]);
+export async function runIndexingChecks(mode: DoctorMode, _options: RunIndexingChecksOptions = {}): Promise<CheckResult[]> {
     return Promise.all([checkDocker(mode)]);
 }
@@ -436,2 +326,2 @@
-                description: 'Install missing CocoIndex dependencies',
+                description: 'Install missing dependencies',
```

### 9. `[MODIFY]` `src/core/doctor/install.ts`
> **Action**: Gỡ bỏ CocoIndex auto-installer và container runner khỏi luồng cài đặt dependency thiếu.

```diff
@@ -5,4 +5,1 @@
-import type { DoctorMode } from '@/core/indexing/tools.js';
-import { resolveCocoindexImage } from '@/core/indexing/tools.js';
 import type { CheckResult } from './checks.js';
-import { COCOINDEX_CONTAINER_NAME, ensureCocoindexContainerRunning } from '@/core/indexing/docker-runtime.js';
-import type { DoctorBuildInstallScriptRequest, DoctorInstallDependenciesRequest, InstallResult } from './types.js';
+import type { DoctorBuildInstallScriptRequest, DoctorInstallDependenciesRequest, DoctorMode, InstallResult } from './types.js';
@@ -28,8 +24,2 @@
     if (mode === 'docker') {
-        if (missing.includes('cocoindex')) {
-            const image = resolveCocoindexImage();
-            lines.push(`docker pull ${image}`);
-            lines.push(`docker run -d --name ${COCOINDEX_CONTAINER_NAME} --restart unless-stopped --entrypoint sleep ${image} infinity`);
-            lines.push('');
-        }
         return lines.join('\n').trimEnd();
     }
@@ -38,5 +28,0 @@
-    if (missing.includes('cocoindex')) {
-        lines.push('# Requires Python 3.11+');
-        lines.push('pip3 install cocoindex');
-        lines.push('');
-    }
@@ -62,20 +48,1 @@
     if (mode === 'docker') {
-        if (missing.includes('cocoindex')) {
-            try {
-                const image = resolveCocoindexImage();
-                await pullDockerImage(image);
-                ensureCocoindexContainerRunning(image);
-                results.push({
-                    ok: true,
-                    dependency: 'cocoindex',
-                    detail: `CocoIndex image pulled; container ${COCOINDEX_CONTAINER_NAME} running`,
-                });
-            } catch (err: any) {
-                results.push({
-                    ok: false,
-                    dependency: 'cocoindex',
-                    detail: err?.message ? String(err.message) : 'docker pull failed',
-                });
-            }
-        }
-
         return results;
     }
@@ -84,20 +51,0 @@
-    if (missing.includes('cocoindex')) {
-        try {
-            execFileSync('pip3', ['install', 'cocoindex'], {
-                stdio: 'pipe',
-                encoding: 'utf-8',
-            });
-            results.push({
-                ok: true,
-                dependency: 'cocoindex',
-                detail: 'installed via pip3',
-            });
-        } catch (err: any) {
-            results.push({
-                ok: false,
-                dependency: 'cocoindex',
-                detail: err?.message ? String(err.message) : 'pip3 install failed',
-            });
-        }
-    }
```

### 10. `[MODIFY]` `src/core/prebuilt/bundle.ts`
> **Action**: Xóa `.cocoindex` khỏi hằng số `CORE_BUNDLE_ENTRIES`.

```diff
@@ -6,1 +6,1 @@
-const CORE_BUNDLE_ENTRIES = ['.cocoindex', 'manifest.json'] as const;
+const CORE_BUNDLE_ENTRIES = ['manifest.json'] as const;
```

### 11. `[MODIFY]` `src/core/prebuilt/manifest.ts`
> **Action**: Bỏ `cocoindexVersion` khỏi `ManifestData`, loại bỏ `detectCocoindexVersion` và `.cocoindex` khỏi `ARTIFACT_DIRS`.

```diff
@@ -7,2 +7,0 @@
-import type { IndexMode } from '@/core/config/index.js';
-import { resolveCocoindexImage, resolveCocoindexScript } from '@/core/indexing/tools.js';
@@ -15,1 +13,0 @@
-    cocoindexVersion?: string;
@@ -25,1 +22,1 @@
-const ARTIFACT_DIRS = ['.cocoindex'] as const;
+const ARTIFACT_DIRS = [] as const;
@@ -49,15 +46,0 @@
-export async function detectCocoindexVersion(mode: IndexMode): Promise<string> {
-...
-}
@@ -108,8 +80,4 @@
-    mode: IndexMode,
 ): Promise<ManifestData> {
-    const [commitSha, cocoindexVersion, fileCount, artifactChecksum] = await Promise.all([
+    const [commitSha, artifactChecksum] = await Promise.all([
         getCommitSha(projectDir),
-        detectCocoindexVersion(mode),
-        countFiles(join(outputDir, '.cocoindex')),
         computeArtifactChecksum(outputDir),
     ]);
@@ -121,1 +88,0 @@
-        cocoindexVersion,
@@ -124,1 +90,1 @@
-        fileCount,
+        fileCount: structuralFiles.length,
```

### 12. `[MODIFY]` `src/core/prebuilt/indexers.ts`
> **Action**: Gỡ bỏ `runCocoindex`, `runCocoindexLocal`, `runCocoindexDocker` và các imports liên quan.

```diff
@@ -1,9 +1,4 @@
-import { execFile } from 'node:child_process';
-import { realpathSync } from 'node:fs';
 import { writeFile } from 'node:fs/promises';
-import { join } from 'node:path';
-import { promisify } from 'node:util';
-import type { ProgramDeps } from '@/cli/deps.js';
 import { loadConfig, resolveIndexMode, type IndexMode } from '@/core/config/index.js';
-import { assertCocoindexScriptExists, resolveCocoindexImage } from '@/core/indexing/tools.js';
-import { ensureIndexOutputDir, relocateArtifactDir, resolveManifestPath } from '@/core/prebuilt/index-output.js';
+import { ensureIndexOutputDir, resolveManifestPath } from '@/core/prebuilt/index-output.js';
 import { buildManifestData, type ManifestData } from '@/core/prebuilt/manifest.js';
@@ -26,58 +16,0 @@
-export async function runCocoindex(
-...
-}
-
-async function runCocoindexLocal(projectDir: string): Promise<void> {
-...
-}
-
-async function runCocoindexDocker(projectDir: string): Promise<void> {
-...
-}
@@ -87,2 +20,1 @@
-    const mode = await resolveIndexerMode(projectDir, modeOverride);
-    const manifest = await buildManifestData(projectDir, outputDir, projectName, mode);
+    const manifest = await buildManifestData(projectDir, outputDir, projectName);
```

### 13. `[MODIFY]` `src/core/client/types.ts`
> **Action**: Gỡ bỏ `cocoindexVersion` khỏi `IndexVersionMetadata` và `LatestIndexMetadata`.

```diff
@@ -141,1 +141,0 @@
-    cocoindexVersion?: string;
@@ -161,1 +160,0 @@
-    cocoindexVersion?: string;
```

### 14. `[MODIFY]` `src/commands/structure-generate/actions/step-4-generate-payload-and-report.ts`
> **Action**: Loại bỏ cờ `--skip-cocoindex` khỏi gợi ý lệnh terminal.

```diff
@@ -87,1 +87,1 @@
-    deps.stdout(`     ${COLORS.cli.command('only-one push-index --skip-cocoindex')}`);
+    deps.stdout(`     ${COLORS.cli.command('only-one push-index')}`);
```

## Section 5. Test Cases & Verification

- **Automated Tests**:
  - `[x]` `npm run format:check` -> **PASS** (All matched files use Prettier code style).
  - `[x]` `npm run build` -> **PASS** (TypeScript build & postbuild paths executed cleanly).
  - `[x]` `npm test` -> **PASS** (55 test files passed, 228 tests passed, 0 failures).
- **Manual Checks**:
  - `[x]` Loại bỏ hoàn toàn mọi tệp và tham chiếu CocoIndex khỏi codebase và test suite.
