# Walkthrough: Khắc phục lỗi Spawn ENOENT khi đồng bộ VS Extensions cho Antigravity trên Windows

## 1. Tổng quan Thay đổi (Changes Summary)
- **Mục tiêu**: Xử lý triệt để lỗi crash `Error: spawn antigravity-ide ENOENT` khi thực thi lệnh `only-one extensions-vs` trên hệ điều hành Windows.
- **Các module đã can thiệp**:
  1. [`src/core/vs/runtime.ts`](file:///d:/Sources/Personal/only-one-cli/src/core/vs/runtime.ts): Bật cờ `shell: process.platform === 'win32'` và `windowsHide: true` trong `NodeVsProcessRunner.run` để Node.js tự động tìm và chạy các file wrapper dạng batch script `.cmd` (như `antigravity-ide.cmd`, `code.cmd`, `cursor.cmd`).
  2. [`src/core/vs/extensions-sync.ts`](file:///d:/Sources/Personal/only-one-cli/src/core/vs/extensions-sync.ts): Cải tiến hàm `resolveVsEditorCommand` để fail-fast và ném ngoại lệ rõ ràng (*Actionable Error*) nếu không tìm thấy executable nào hợp lệ trong `PATH`.
  3. [`test/core/vs/vs-core.test.ts`](file:///d:/Sources/Personal/only-one-cli/test/core/vs/vs-core.test.ts): Bổ sung 2 kịch bản unit test bao phủ luồng phân giải executable thành công và luồng ném lỗi khi không tìm thấy candidate.

---

## 2. Chi tiết Sửa đổi (Diff Details)

### 2.1. `src/core/vs/runtime.ts`
```diff
 export class NodeVsProcessRunner implements VsProcessRunner {
     public async run(command: string, args: string[]): Promise<VsProcessResult> {
         return new Promise((resolve) => {
-            const child = spawn(command, args, { shell: false });
+            const isWin = process.platform === 'win32';
+            const child = spawn(command, args, {
+                shell: isWin,
+                windowsHide: true,
+            });
             let stderr = '';
             let stdout = '';
-            child.stderr.on('data', (chunk: Buffer) => {
+            child.stderr?.on('data', (chunk: Buffer) => {
                 stderr += chunk.toString();
             });
-            child.stdout.on('data', (chunk: Buffer) => {
+            child.stdout?.on('data', (chunk: Buffer) => {
                 stdout += chunk.toString();
             });
```

### 2.2. `src/core/vs/extensions-sync.ts`
```diff
 export const resolveVsEditorCommand = async (runner: VsProcessRunner, editor: VsEditorDescriptor): Promise<string> => {
     for (const candidate of editor.commandCandidates) {
         const check = await runner.run(candidate, ['--version']);
         if (check.code === 0) {
             return candidate;
         }
     }
-    return editor.commandCandidates[0];
+    throw new Error(
+        `Executable for "${editor.name}" not found in PATH (${editor.commandCandidates.join(', ')}). Please verify that ${editor.name} is installed and available in PATH.`,
+    );
 };
```

---

## 3. Bằng chứng Kiểm thử (Verification Evidence)

### 3.1. Unit Tests
```bash
npx vitest run test/core/vs/vs-core.test.ts test/commands/vs/vs-commands.test.ts test/core/vs/vs-library.test.ts
```
- **Kết quả**:
  - `test/core/vs/vs-core.test.ts`: **12/12 passed** (bao gồm 2 test cases mới cho resolver & error surfacing).
  - `test/commands/vs/vs-commands.test.ts`: **7/7 passed**.
  - `test/core/vs/vs-library.test.ts`: **2/2 passed**.

### 3.2. Build & Code Formatting
```bash
npm run build
```
- Prettier format check: **Passed** (`All matched files use Prettier code style!`).
- TypeScript Compilation (`tsc`): **Passed**.
- Path aliases & postbuild scripts: **Passed**.

### 3.3. Thực nghiệm Trực tiếp trên Windows (Live Verification)
- Khi chạy lệnh:
  ```bash
  node dist/src/index.js extensions-vs --editors antigravity --extensions dracula-theme.theme-dracula
  ```
- CLI đã tìm thấy `antigravity-ide.cmd` trên Windows thông qua shell spawn, thực thi `antigravity-ide --list-extensions` thành công và nhận diện chính xác extension `dracula-theme.theme-dracula` đã tồn tại trong Antigravity IDE mà không phát sinh lỗi `ENOENT`.
