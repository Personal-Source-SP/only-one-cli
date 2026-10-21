# Debug: Cửa sổ Desktop App không tự động bật lên khi chạy lệnh only-one ui trên Windows

---
status: planning
slug: debug-launch-browser-window
started_at: 2026-10-21 09:20:00
completed_at: ~
reproduction_test: test/commands/uiCommand.test.ts
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)

- **Triệu chứng & Stack Trace**:
  Khi người dùng gõ `only-one ui` trên Windows terminal, server Next.js khởi động thành công trong 154ms (`Ready in 154ms`), nhưng không có cửa sổ Desktop hoặc trình duyệt nào tự động mở lên. Terminal hiển thị:
  ```text
  🚀 Đang khởi chạy Only-One Dashboard tại: http://localhost:4200
    ▲ Next.js 15.5.28
    - Local: http://localhost:4200
    - Network: http://0.0.0.0:4200

    ✓ Starting...
    ✓ Ready in 154ms
    [cursor nhấp nháy chờ lệnh mà không thấy giao diện web bật lên]
  ```

- **Red Test Case**:
  Gọi `spawn('msedge', ['--app=http://localhost:4200'])` trên Windows thất bại do `msedge` không nằm trong biến môi trường `PATH`.
- **Lệnh chạy tái hiện**: `npm test test/commands/uiCommand.test.ts`

---

## Section 2. Root Cause Analysis & Proposed Solution (Phân tích & Đề xuất Giải pháp)

### 2.1 Mechanical Root Cause & Invariants

- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**:
  1. Trong file [src/commands/ui/command.ts](file:///d:/Sources/PERSONAL/only-one-cli/src/commands/ui/command.ts), hàm `launchDesktopApp` thực thi:
     ```ts
     if (process.platform === 'win32') {
         spawn('msedge', [`--app=${url}`], { shell: true, detached: true, stdio: 'ignore' }).unref();
     }
     ```
  2. Trên hệ điều hành Windows 10/11, file thực thi `msedge.exe` được cài đặt tại `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`. Đường dẫn này **mặc định không được thêm vào biến môi trường PATH** của hệ thống.
  3. Lệnh `spawn('msedge', ...)` tìm kiếm `msedge.exe` trong `PATH`, không tìm thấy nên tiến trình con bị lỗi thoát âm thầm (do có cờ `stdio: 'ignore'`).
  4. Hậu quả: Server Next.js đã sẵn sàng phục vụ tại `http://localhost:4200`, nhưng cửa sổ giao diện ứng dụng không được mở lên màn hình người dùng.

- **Invariants bị vi phạm**:
  - *Invariant 1*: Các lệnh khởi chạy trình duyệt trên Windows phải sử dụng đường dẫn cài đặt tuyệt đối chuẩn của hệ thống (`C:\Program Files (x86)\...`) hoặc ủy quyền cho `cmd.exe /c start` để tra cứu App Paths trong Windows Registry.
  - *Invariant 2*: Phải luôn có cơ chế fallback mở trình duyệt mặc định nếu chế độ Desktop App Mode không khởi động được.
  - *Invariant 3*: Terminal phải hiển thị liên kết URL có thể nhấp chuột trực tiếp (`Ctrl + Click`) để người dùng luôn có phương án dự phòng.

### 2.2 Proposed Solution & Target Source Structure

- **Cơ chế giải pháp cốt lõi (Core Fix Mechanism)**:
  1. Xây dựng hàm `getBrowserLaunchCommand(url, useBrowser)`:
     - Trên Windows: Kiểm tra lần lượt các đường dẫn tuyệt đối của Microsoft Edge và Google Chrome (`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`, `C:\Program Files\Google\Chrome\Application\chrome.exe`).
     - Nếu tìm thấy: Gọi trực tiếp đường dẫn file `.exe` kèm tham số `--app=<url>`.
     - Nếu không tìm thấy: Fallback về `cmd.exe /c start "" "<url>"` mở bằng trình duyệt mặc định.
  2. Bổ sung hướng dẫn click mở trực tiếp: In dòng thông báo `👉 Nhấn Ctrl + Click vào http://localhost:4200` ngay trên terminal.

- **Cấu trúc tệp thay đổi (Source Structure Changes)**:
```text
only-one-cli/
├── [MODIFY] src/commands/ui/command.ts        # Sử dụng đường dẫn tuyệt đối Edge/Chrome và fallback an toàn
└── [MODIFY] test/commands/uiCommand.test.ts   # Thêm test case cho getBrowserLaunchCommand
```

---

## Section 3. Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[ ]` | `[MODIFY]` | `src/commands/ui/command.ts` | `getBrowserLaunchCommand`, `launchDesktopApp` | `None` | `npm test test/commands/uiCommand.test.ts` |
| **2** | `[ ]` | `[MODIFY]` | `test/commands/uiCommand.test.ts` | `describe('uiCommand & port resolution')` | `Order 1` | `npm test test/commands/uiCommand.test.ts` |

---

## Section 4. Code Changes (Unified Diff & Chi tiết Thay đổi)

### 1. `[MODIFY]` `src/commands/ui/command.ts`

- **Mục đích thay đổi (Action / Rationale)**: Khởi chạy Desktop App Mode bằng đường dẫn tuyệt đối của Edge/Chrome trên Windows, fallback về `cmd /c start` và in thông báo Ctrl+Click.
- **Điểm can thiệp (AST Seams / Target Symbols)**: `getBrowserLaunchCommand`, `launchDesktopApp`, `createUiCommand`
- **Chi tiết thay đổi mã nguồn**:

```diff
@@ -37,14 +37,34 @@
-export function launchDesktopApp(url: string, useBrowser = false) {
+export function getBrowserLaunchCommand(url: string, useBrowser = false): { cmd: string; args: string[] } {
     if (useBrowser) {
-        const cmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
-        spawn(cmd, [url], { shell: true, detached: true, stdio: 'ignore' }).unref();
-        return;
+        if (process.platform === 'win32') {
+            return { cmd: 'cmd.exe', args: ['/c', 'start', '', url] };
+        } else if (process.platform === 'darwin') {
+            return { cmd: 'open', args: [url] };
+        } else {
+            return { cmd: 'xdg-open', args: [url] };
+        }
     }
 
     if (process.platform === 'win32') {
-        spawn('msedge', [`--app=${url}`], { shell: true, detached: true, stdio: 'ignore' }).unref();
+        const browserCandidates = [
+            'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
+            'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
+            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
+            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
+        ];
+        const found = browserCandidates.find((p) => fs.existsSync(p));
+        if (found) {
+            return { cmd: found, args: [`--app=${url}`] };
+        }
+        return { cmd: 'cmd.exe', args: ['/c', 'start', '', url] };
     } else if (process.platform === 'darwin') {
-        spawn('open', ['-na', 'Google Chrome', '--args', `--app=${url}`], { detached: true, stdio: 'ignore' }).unref();
+        return { cmd: 'open', args: ['-na', 'Google Chrome', '--args', `--app=${url}`] };
     } else {
-        spawn('google-chrome', [`--app=${url}`], { shell: true, detached: true, stdio: 'ignore' }).unref();
+        return { cmd: 'google-chrome', args: [`--app=${url}`] };
     }
 }
+
+export function launchDesktopApp(url: string, useBrowser = false) {
+    const { cmd, args } = getBrowserLaunchCommand(url, useBrowser);
+    try {
+        spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref();
+    } catch {
+        if (process.platform === 'win32') {
+            spawn('cmd.exe', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' }).unref();
+        }
+    }
+}
@@ -64,2 +84,5 @@
             deps.stdout(COLORS.cli.header(`\n🚀 Đang khởi chạy Only-One Dashboard tại: ${url}`));
+            deps.stdout(
+                COLORS.dim('   👉 Nhấn ') + COLORS.cli.command('Ctrl + Click') + COLORS.dim(` vào liên kết: ${url} để mở giao diện.\n`),
+            );
```

---

## Section 5. Verification & Regression Guard

- **Automated Tests**:
  - `npm test test/commands/uiCommand.test.ts`
- **Manual Verification**:
  - Chạy `npm run publish:local`.
  - Chạy `only-one ui`: Cửa sổ Desktop App Mode (MS Edge) tự động bật lên màn hình.
