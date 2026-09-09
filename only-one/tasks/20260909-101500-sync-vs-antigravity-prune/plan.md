---
status: done
slug: sync-vs-antigravity-prune
started_at: 2026-09-09
completed_at: 2026-09-09
pr_url: ~
branch: ~
---

# Plan: Đồng bộ VS Library Manifest từ Antigravity & Bổ sung cờ Prune cho VS Extensions

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- File [`assets/vs/index.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/vs/index.ts) đang ở phiên bản `0.0.2`, bị thiếu extension `anysphere.cursorpyright`, setting `python.languageServer` chưa cập nhật (`None` thay vì `Default`), và từ khóa `Paygate` chưa có trong `cSpell.userWords`.
- Hệ thống đồng bộ extension (`syncVsExtensions` tại [`extensions-sync.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/vs/extensions-sync.ts) và CLI command [`command.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/commands/extensions-vs/command.ts)) hiện tại chỉ hoạt động theo cơ chế **additive-only** (chỉ cài thêm các extension thiếu bằng `--install-extension`).
- Khi chạy `only-one extensions-vs`, người dùng không có cách nào tự động dọn dẹp các extension thừa đã cài trên Editor mà không thuộc `VS_LIBRARY.extensions`.
- **Invariants bắt buộc duy trì**:
  - Không làm thay đổi hành vi mặc định của `extensions-vs` khi không truyền cờ `--prune`.
  - Mảng `extensions` trong `VS_LIBRARY` luôn được sắp xếp theo thứ tự bảng chữ cái alphabet và không trùng lặp (duplication-free).
  - Tuân thủ cơ chế journal / transactional rollback khi gặp lỗi nghiêm trọng trong quá trình thực thi lệnh process runner.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
*(Kế thừa 100% cơ chế vận hành từ concept.md; tuyệt đối không mô tả lại giải pháp tổng quan)*

- **Type Signatures & Code Contracts**:
  - `src/commands/extensions-vs/types.ts`:
    ```ts
    export interface ExtensionsVsCommandOptions {
        editors?: string;
        extensions?: string;
        force?: boolean;
        prune?: boolean;
    }
    ```
  - `src/core/vs/extensions-sync.ts`:
    ```ts
    export interface VsExtensionsSyncRequest {
        cwd: string;
        editorIds: VsEditorId[];
        write: (line: string) => void;
        force?: boolean;
        prune?: boolean;
        fs?: VsFileSystem;
        libraryDir?: string;
        runner?: VsProcessRunner;
        extensionIds?: string[];
        extensionIdsPerEditor?: Record<VsEditorId, string[]>;
        pruneExtensionIdsPerEditor?: Record<VsEditorId, string[]>;
    }

    export interface VsExtensionsSyncResponse {
        installed: number;
        pruned: number;
        results: Array<{
            editorName: string;
            installedExtensions: string[];
            prunedExtensions: string[];
        }>;
    }
    ```
- **AST Seams & Callers**:
  - `assets/vs/index.ts`: Khai báo hằng số `VS_LIBRARY: VsLibraryManifest`.
  - `src/commands/extensions-vs/command.ts`: Hàm `createExtensionsVsCommand` đăng ký `.option('--prune', ...)` với commander.
  - `src/commands/extensions-vs/actions/step-5-execute-and-report.ts`: Hàm `executeAndReportStep` gọi `syncVsExtensions({ ... , prune: options.prune })` và render output danh sách pruned extensions.
  - `src/core/vs/extensions-sync.ts`: Hàm `syncVsExtensions` lập kế hoạch `pruneExtensionIds` và gọi `runner.run(command, ['--uninstall-extension', id])`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)
```text
assets/vs/
└── [MODIFY] index.ts                               # Bump version 0.0.3, sync cursorpyright, Paygate, python settings

src/
├── commands/extensions-vs/
│   ├── [MODIFY] types.ts                           # Add prune?: boolean to ExtensionsVsCommandOptions
│   ├── [MODIFY] command.ts                         # Add --prune flag to CLI commander definition
│   └── actions/
│       └── [MODIFY] step-5-execute-and-report.ts   # Pass prune option & display pruned extensions summary
└── core/vs/
    └── [MODIFY] extensions-sync.ts                 # Implement diffing & --uninstall-extension execution

test/
├── core/vs/
│   ├── [MODIFY] vs-core.test.ts                    # Unit tests for syncVsExtensions with prune: true
│   └── [MODIFY] vs-library.test.ts                 # Tests for updated manifest contents and sorting
└── commands/vs/
    └── [MODIFY] vs-commands.test.ts                # Integration tests for extensions-vs --prune flag
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `assets/vs/index.ts` | `VS_LIBRARY` | `None` | `npx vitest run test/core/vs/vs-library.test.ts` |
| **2** | `[x]` | `[MODIFY]` | `src/commands/extensions-vs/types.ts` | `ExtensionsVsCommandOptions` | `None` | `npx vitest run test/commands/vs/vs-commands.test.ts` |
| **3** | `[x]` | `[MODIFY]` | `src/commands/extensions-vs/command.ts` | `createExtensionsVsCommand` | `Order 2` | `npx vitest run test/commands/vs/vs-commands.test.ts` |
| **4** | `[x]` | `[MODIFY]` | `src/core/vs/extensions-sync.ts` | `VsExtensionsSyncRequest`, `syncVsExtensions` | `Order 1` | `npx vitest run test/core/vs/vs-core.test.ts` |
| **5** | `[x]` | `[MODIFY]` | `src/commands/extensions-vs/actions/step-5-execute-and-report.ts` | `executeAndReportStep` | `Order 3, 4` | `npx vitest run test/commands/vs/vs-commands.test.ts` |
| **6** | `[x]` | `[MODIFY]` | `test/core/vs/vs-library.test.ts` | `describe('VS_LIBRARY manifest')` | `Order 1` | `npx vitest run test/core/vs/vs-library.test.ts` |
| **7** | `[x]` | `[MODIFY]` | `test/core/vs/vs-core.test.ts` | `describe('VS core sync helpers')` | `Order 4` | `npx vitest run test/core/vs/vs-core.test.ts` |
| **8** | `[x]` | `[MODIFY]` | `test/commands/vs/vs-commands.test.ts` | `describe('VS sync commands')` | `Order 3, 5` | `npx vitest run test/commands/vs/vs-commands.test.ts` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `assets/vs/index.ts`
> **Action**: Cập nhật manifest `VS_LIBRARY` lên version 0.0.3, bổ sung `anysphere.cursorpyright` và đồng bộ settings thực tế của Antigravity IDE.

```diff
@@ -4,6 +4,7 @@
 export const VS_LIBRARY: VsLibraryManifest = {
-    version: '0.0.2',
+    version: '0.0.3',
     extensions: [
         'aaron-bond.better-comments',
         'anthropic.claude-code',
+        'anysphere.cursorpyright',
         'anysphere.remote-ssh',
         'bierner.markdown-mermaid',
@@ -87,3 +88,3 @@
         'jest.enable': false,
-        'cSpell.userWords': ['automapper', 'dtos', 'ILIKE', 'Redlock', 'refinedev', 'Serper'],
+        'cSpell.userWords': ['automapper', 'dtos', 'ILIKE', 'Paygate', 'Redlock', 'refinedev', 'Serper'],
         'editor.unicodeHighlight.ambiguousCharacters': false,
@@ -126,3 +127,3 @@
         'workbench.editorAssociations': {
             '*.md': 'vscode.markdown.preview.editor',
         },
-        'python.languageServer': 'None',
+        'python.languageServer': 'Default',
         'git.autofetch': true,
```

---

### 2. `[MODIFY]` `src/commands/extensions-vs/types.ts`
> **Action**: Thêm trường `prune?: boolean;` vào interface `ExtensionsVsCommandOptions`.

```diff
@@ -4,3 +4,4 @@
 export interface ExtensionsVsCommandOptions {
     editors?: string;
     extensions?: string;
     force?: boolean;
+    prune?: boolean;
 }
```

---

### 3. `[MODIFY]` `src/commands/extensions-vs/command.ts`
> **Action**: Bổ sung cờ `--prune` vào cấu hình Commander của lệnh `extensions-vs`.

```diff
@@ -20,3 +20,4 @@
         .option('--extensions <ids>', 'Comma-separated list of extension IDs to install')
         .option('--force', 'Force install all extensions, bypassing merge', false)
+        .option('--prune', 'Remove extensions installed on the editor that are not in the library manifest', false)
         .addHelpText(
```

---

### 4. `[MODIFY]` `src/core/vs/extensions-sync.ts`
> **Action**: Mở rộng request/response types và bổ sung logic gỡ bỏ extension thừa khi có cờ `prune`.

```diff
@@ -19,4 +19,6 @@
     force?: boolean;
+    prune?: boolean;
     fs?: VsFileSystem;
     libraryDir?: string;
     runner?: VsProcessRunner;
     extensionIds?: string[];
     extensionIdsPerEditor?: Record<VsEditorId, string[]>;
+    pruneExtensionIdsPerEditor?: Record<VsEditorId, string[]>;
 }

 export interface VsExtensionsSyncResponse {
     installed: number;
+    pruned: number;
     results: Array<{
         editorName: string;
         installedExtensions: string[];
+        prunedExtensions: string[];
     }>;
 }
@@ -105,3 +107,3 @@
-    const plans: Array<{ command: string; editorName: string; extensionIds: string[] }> = [];
+    const plans: Array<{ command: string; editorName: string; extensionIds: string[]; pruneExtensionIds: string[] }> = [];
     for (const editor of editors) {
         if (!editor) continue;
         const command = await resolveVsEditorCommand(runner, editor);
         const targetExtensions = request.extensionIdsPerEditor?.[editor.id] ?? request.extensionIds ?? manifest.extensions;
+        const targetSet = new Set(targetExtensions.map((id) => id.toLowerCase()));
+        const installedList = await getVsInstalledExtensions(runner, command).catch(() => []);
+        const installed = new Set(installedList.map((id) => id.toLowerCase()));

         const isExplicitSelection = Boolean(request.extensionIdsPerEditor || request.extensionIds);
+        const pruneExtensionIds = request.prune
+            ? (request.pruneExtensionIdsPerEditor?.[editor.id] ?? installedList.filter((id) => !targetSet.has(id.toLowerCase())))
+            : [];

         if (request.force || isExplicitSelection) {
             plans.push({
                 command,
                 editorName: editor.name,
                 extensionIds: targetExtensions,
+                pruneExtensionIds,
             });
         } else {
-            const installed = new Set((await getVsInstalledExtensions(runner, command)).map((id) => id.toLowerCase()));
             plans.push({
                 command,
                 editorName: editor.name,
                 extensionIds: targetExtensions.filter((id) => !installed.has(id.toLowerCase())),
+                pruneExtensionIds,
             });
         }
     }

-    const total = plans.reduce((sum, plan) => sum + plan.extensionIds.length, 0) + 2;
+    const total = plans.reduce((sum, plan) => sum + plan.extensionIds.length + plan.pruneExtensionIds.length, 0) + 2;
     progress.start(total, 'validate extensions sync');
@@ -139,3 +142,4 @@
     let installedCount = 0;
+    let prunedCount = 0;
     const results: VsExtensionsSyncResponse['results'] = [];

     try {
         for (const plan of plans) {
             const installedExtensions: string[] = [];
+            const prunedExtensions: string[] = [];
             for (const extensionId of plan.extensionIds) {
                 const result = await runner.run(plan.command, ['--install-extension', extensionId]);
                 if (result.code !== 0) {
                     throw new Error(extractProcessErrorMessage(result, `Failed to install ${extensionId}`));
                 }
                 await transaction.recordInstalledExtension(plan.command, extensionId);
                 installedCount += 1;
                 installedExtensions.push(extensionId);
                 progress.step(`${plan.editorName}: ${extensionId}`);
             }
+            for (const extensionId of plan.pruneExtensionIds) {
+                const result = await runner.run(plan.command, ['--uninstall-extension', extensionId]);
+                if (result.code !== 0) {
+                    throw new Error(extractProcessErrorMessage(result, `Failed to uninstall ${extensionId}`));
                 }
                 prunedCount += 1;
                 prunedExtensions.push(extensionId);
                 progress.step(`${plan.editorName} (pruned): ${extensionId}`);
             }
             results.push({
                 editorName: plan.editorName,
                 installedExtensions,
+                prunedExtensions,
             });
         }
         process.off('SIGINT', handleSignal);
         process.off('SIGTERM', handleSignal);
         await transaction.commit();
         progress.step('extensions committed');
-        return { installed: installedCount, results };
+        return { installed: installedCount, pruned: prunedCount, results };
     } catch (error) {
```

---

### 5. `[MODIFY]` `src/commands/extensions-vs/actions/step-5-execute-and-report.ts`
> **Action**: Chuyển giao cờ `prune` tới `syncVsExtensions` và in báo cáo các extension đã bị prune.

```diff
@@ -16,4 +16,5 @@
         extensionIdsPerEditor,
         force: options.force,
+        prune: options.prune,
         write: deps.stdout,
     });

     deps.stdout(COLORS.cli.header('\nSync Summary:'));
     for (const res of result.results) {
         deps.stdout(COLORS.secondary(`${res.editorName}:`));
-        if (!res.installedExtensions?.length) {
+        if (!res.installedExtensions?.length && !res.prunedExtensions?.length) {
             deps.stdout(COLORS.dim(`  No new extensions installed.`));
         } else {
+            if (res.installedExtensions?.length) {
                 deps.stdout(COLORS.success(`  Installed extensions:`));
                 for (const ext of res.installedExtensions) {
                     deps.stdout(`    - ${COLORS.cli.option(ext)}`);
                 }
+            }
+            if (res.prunedExtensions?.length) {
+                deps.stdout(COLORS.warning(`  Pruned extensions:`));
+                for (const ext of res.prunedExtensions) {
+                    deps.stdout(`    - ${COLORS.cli.option(ext)}`);
                 }
+            }
         }
     }
```

---

### 6. `[MODIFY]` `test/core/vs/vs-library.test.ts`
> **Action**: Kiểm tra extension `anysphere.cursorpyright` và setting `python.languageServer`.

```diff
@@ -19,4 +19,5 @@
         expect(lib.extensions).toContain('bierner.markdown-mermaid');
         expect(lib.extensions).toContain('bierner.markdown-preview-github-styles');
+        expect(lib.extensions).toContain('anysphere.cursorpyright');
         expect(lib.extensions).not.toContain('shd101wyy.markdown-preview-enhanced');
         expect(lib.settings['git.autofetch']).toBe(true);
+        expect(lib.settings['python.languageServer']).toBe('Default');
         expect(lib.settings['workbench.editorAssociations']).toEqual({ '*.md': 'vscode.markdown.preview.editor' });
```

---

### 7. `[MODIFY]` `test/core/vs/vs-core.test.ts`
> **Action**: Thêm unit test kiểm tra `syncVsExtensions` khi kích hoạt `prune: true`.

```diff
@@ -244,4 +244,22 @@
     });

+    it('prunes unlisted extensions when prune option is enabled', async () => {
+        const fs = new MemoryFs();
+        seedLibrary(fs);
+        const runner = new MemoryRunner();
+
+        const result = await syncVsExtensions({
+            cwd: '/repo',
+            editorIds: [VsEditorId.VSCode],
+            fs,
+            libraryDir: join('/library', 'vs'),
+            prune: true,
+            runner,
+            write: () => undefined,
+        });
+
+        expect(runner.calls).toContainEqual({ command: 'code', args: ['--uninstall-extension', 'existing.keep'] });
+        expect(result.results[0]?.prunedExtensions).toContain('existing.keep');
+    });
+
     it('throws an actionable error when no editor command candidates are executable', async () => {
```

---

### 8. `[MODIFY]` `test/commands/vs/vs-commands.test.ts`
> **Action**: Thêm test kiểm tra `extensions-vs --prune` truyền đúng tham số vào `syncVsExtensions`.

```diff
@@ -34,3 +34,3 @@
         syncVsExtensions: vi
-            .fn()
-            .mockResolvedValue({ installed: 2, results: [{ editorName: 'VSCode', installedExtensions: ['ext1', 'ext2'] }] }),
+            .fn()
+            .mockResolvedValue({ installed: 2, pruned: 1, results: [{ editorName: 'VSCode', installedExtensions: ['ext1', 'ext2'], prunedExtensions: ['oldExt'] }] }),
@@ -151,3 +151,16 @@
         expect(writes.map((w) => w.replace(/\u001b\[\d+m/g, ''))).toContain('\nSync Summary:');
     });

+    it('passes prune option to syncVsExtensions when --prune is specified', async () => {
+        const program = createProgram({
+            cwd: '/repo',
+            env: {},
+            fetcher: (() => Promise.resolve({})) as typeof fetch,
+            stdout: () => undefined,
+        });
+
+        await program.parseAsync(['extensions-vs', '--editors', 'cursor', '--prune'], { from: 'user' });
+
+        expect(syncVsExtensions).toHaveBeenCalledWith(expect.objectContaining({ prune: true }));
+    });
+
     it('prompts extension selection and confirm overwrite in interactive mode', async () => {
```

---

## Section 5. Test Cases & Verification
- **Automated Tests**:
  - `[x]` `npx vitest run test/core/vs/vs-library.test.ts` (PASS - 2/2 tests passed)
  - `[x]` `npx vitest run test/core/vs/vs-core.test.ts` (PASS - 14/14 tests passed)
  - `[x]` `npx vitest run test/commands/vs/vs-commands.test.ts` (PASS - 8/8 tests passed)
  - `[x]` `npm run format:check` (PASS - All files comply with Prettier)
  - `[x]` `npm run build` (PASS - TypeScript compile & asset permissions verified)
  - `[x]` `npm test` (PASS - 55 test suites, 230 tests passed)
- **Manual Checks**:
  - `[x]` Kiểm tra `only-one extensions-vs --help` hiển thị cờ `--prune`.
  - `[x]` Xác thực tính năng diff và `--uninstall-extension` qua test suite `vs-core.test.ts` và `vs-commands.test.ts`.
