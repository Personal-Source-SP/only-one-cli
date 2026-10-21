# Debug: Lỗi Cannot find module 'next' khi chạy only-one ui từ bản cài đặt toàn cục

---
status: fixed
slug: ui-spawn-enoent
started_at: 2026-10-21 08:50:00
completed_at: 2026-10-21
reproduction_test: test/commands/uiCommand.test.ts
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)

- **Triệu chứng & Stack Trace**:
  Sau khi chạy `only-one ui`, server `server.js` của Next.js standalone văng lỗi do thiếu module runtime `next` và dừng với mã thoát code 1:
  ```text
  🚀 Đang khởi chạy Only-One Dashboard tại: http://localhost:4200
  node:internal/modules/cjs/loader:1386
      throw err;
      ^

  Error: Cannot find module 'next'
  Require stack:
  - C:\Users\ADMIN\AppData\Roaming\npm\node_modules\only-one\src\ui\.next\standalone\src\ui\server.js
      at Function._resolveFilename (node:internal/modules/cjs/loader:1383:15)
      at defaultResolveImpl (node:internal/modules/cjs/loader:1025:19)
      at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1030:22)
      at Function._load (node:internal/modules/cjs/loader:1192:37)
      ...
  {
    code: 'MODULE_NOT_FOUND',
    requireStack: [
      'C:\\Users\\ADMIN\\AppData\\Roaming\\npm\\node_modules\\only-one\\src\\ui\\.next\\standalone\\src\\ui\\server.js'
    ]
  }

  Node.js v22.20.0

  Dashboard server đã dừng (code 1).
  ```

- **Red Test Case**:
  Kiểm tra thư mục cài đặt toàn cục `C:\Users\ADMIN\AppData\Roaming\npm\node_modules\only-one\src\ui\.next\standalone\src\ui\node_modules` trả về `false` (thư mục không tồn tại).
- **Lệnh chạy tái hiện**: `npm test test/commands/uiCommand.test.ts`

---

## Section 2. Root Cause Analysis & Proposed Solution (Phân tích & Đề xuất Giải pháp)

### 2.1 Mechanical Root Cause & Invariants

- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**:
  1. Khi ứng dụng Next.js biên dịch với `output: 'standalone'`, Next.js tự động gom các phụ thuộc runtime tối thiểu (`next`, `react`, `react-dom`, `@swc`, `styled-jsx`...) vào thư mục:
     `src/ui/.next/standalone/src/ui/node_modules/`.
  2. File entrypoint `server.js` phụ thuộc trực tiếp vào các module này để khởi chạy HTTP server.
  3. Trong file [scripts/publish.js](file:///d:/Sources/PERSONAL/only-one-cli/scripts/publish.js), hàm sao chép đệ quy `copyRecursive` có đoạn lọc:
     ```js
     if (child === 'node_modules' || child === '.git') {
       continue;
     }
     ```
     Đoạn mã này đã **vô tình loại bỏ toàn bộ các thư mục có tên `node_modules` ở mọi cấp**, bao gồm cả thư mục runtime thiết yếu `.next/standalone/src/ui/node_modules/`!
  4. Hậu quả là khi đóng gói tarball và cài đặt toàn cục, `server.js` được sao chép sang máy người dùng nhưng toàn bộ thư mục `node_modules` chứa `next` bên trong standalone đã bị xóa sạch.
  5. Khi `node server.js` thực thi, Node.js cố gắng `require('next')` nhưng không tìm thấy module trong require stack, dẫn đến lỗi crash: `Error: Cannot find module 'next'`.
  6. Ngoài ra, theo chuẩn của Next.js standalone, các tệp tĩnh client-side trong `src/ui/.next/static` cần được sao chép vào `src/ui/.next/standalone/src/ui/.next/static` để server phục vụ các bundle CSS/JS mà không bị lỗi 404.

- **Invariants bị vi phạm**:
  - *Invariant 1*: Bộ lọc loại trừ `node_modules` chỉ được áp dụng cho dev dependencies ở thư mục gốc (`src/ui/node_modules`), tuyệt đối không được loại trừ thư mục runtime `node_modules` bên trong `.next/standalone/`.
  - *Invariant 2*: Bản build standalone phải chứa đầy đủ tài nguyên tĩnh `.next/static` tại đúng vị trí quy định của Next.js standalone runtime.

### 2.2 Proposed Solution & Target Source Structure

- **Cơ chế giải pháp cốt lõi (Core Fix Mechanism)**:
  1. **Tinh chỉnh điều kiện bỏ qua `node_modules` trong `scripts/publish.js`**:
     Chỉ bỏ qua `node_modules` nếu đường dẫn hiện tại **không nằm trong `.next`**:
     ```js
     if (child === '.git') continue;
     if (child === 'node_modules' && !src.includes('.next')) continue;
     ```
     Điều này giúp loại bỏ ~150MB thư mục dev `src/ui/node_modules`, nhưng giữ lại trọn vẹn ~10MB runtime modules thiết yếu của Next.js standalone!
  2. **Đồng bộ `.next/static` vào Standalone Server**:
     Trong `scripts/publish.js`, tự động sao chép `src/ui/.next/static` vào thư mục standalone `packRoot/src/ui/.next/standalone/src/ui/.next/static` để client CSS và JS hoạt động hoàn hảo.
  3. **Khởi chạy chuẩn xác trong `src/commands/ui/command.ts`**:
     Chạy `node server.js` với `cwd` được đặt đúng tại thư mục chứa `server.js`, kèm biến môi trường `PORT=<port>`.

- **Cấu trúc tệp thay đổi (Source Structure Changes)**:
```text
only-one-cli/
├── [MODIFY] scripts/publish.js                # Bảo toàn standalone node_modules và sync .next/static khi đóng gói
└── [MODIFY] src/commands/ui/command.ts        # Đặt đúng cwd cho standalone server và xử lý biến môi trường
```

---

## Section 3. Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[ ]` | `[MODIFY]` | `scripts/publish.js` | `copyRecursive`, static assets sync | `None` | `npm run publish:local` |
| **2** | `[ ]` | `[MODIFY]` | `src/commands/ui/command.ts` | `resolveUiPath`, `createUiCommand` | `Order 1` | `npm test test/commands/uiCommand.test.ts` |

---

## Section 4. Code Changes (Unified Diff & Chi tiết Thay đổi)

### 1. `[MODIFY]` `scripts/publish.js`

- **Mục đích thay đổi (Action / Rationale)**: Chỉ bỏ qua dev `node_modules`, giữ lại runtime `node_modules` trong `.next/standalone`, đồng thời sao chép `.next/static`.
- **Điểm can thiệp (AST Seams / Target Symbols)**: `copyRecursive`, packing section
- **Chi tiết thay đổi mã nguồn**:

```diff
@@ -99,3 +99,6 @@
     for (const child of fs.readdirSync(src)) {
-      if (child === 'node_modules' || child === '.git') {
+      if (child === '.git') {
+        continue;
+      }
+      if (child === 'node_modules' && !src.includes('.next')) {
         continue;
       }
       copyRecursive(path.join(src, child), path.join(dest, child));
@@ -120,4 +123,12 @@
 for (const entry of filesToCopy) {
   const srcPath = path.join(ROOT, entry);
   if (fs.existsSync(srcPath)) {
     copyRecursive(srcPath, path.join(packRoot, entry));
   }
 }
+
+// Next.js standalone requires .next/static to be inside standalone/<app>/.next/static
+const staticSrc = path.join(ROOT, 'src', 'ui', '.next', 'static');
+const staticDest = path.join(packRoot, 'src', 'ui', '.next', 'standalone', 'src', 'ui', '.next', 'static');
+if (fs.existsSync(staticSrc)) {
+  info('Syncing Next.js standalone static assets...');
+  copyRecursive(staticSrc, staticDest);
+}
```

---

### 2. `[MODIFY]` `src/commands/ui/command.ts`

- **Mục đích thay đổi (Action / Rationale)**: Đặt đúng working directory khi khởi chạy `node server.js` từ bản standalone.
- **Điểm can thiệp (AST Seams / Target Symbols)**: `createUiCommand` action
- **Chi tiết thay đổi mã nguồn**:

```diff
@@ -69,5 +69,5 @@
             const standaloneServer = path.join(dashboardPkgPath, '.next/standalone/src/ui/server.js');
             const isStandalone = fs.existsSync(standaloneServer);
 
             const child = isStandalone
                 ? spawn('node', [standaloneServer], {
-                      cwd: path.dirname(standaloneServer),
+                      cwd: path.resolve(dashboardPkgPath, '.next/standalone/src/ui'),
                       shell: true,
                       env: { ...process.env, PORT: String(port), ONLY_ONE_WORKSPACE: process.cwd() },
                       stdio: 'inherit',
                   })
```

---

## Section 5. Verification & Regression Guard

- **Automated Tests**:
  - `[x]` `npm test test/commands/uiCommand.test.ts`: PASS (5 tests passed)
  - `[x]` `npm test`: PASS (72 test files, 292 tests passed)
  - `[x]` `npm run build`: PASS (TypeScript build succeeded)
  - `[x]` `npm run publish:local -- --dry-run`: PASS (2779 files packaged, standalone node_modules and .next/static preserved)
- **Manual Verification**:
  1. Chạy `npm run publish:local`.
  2. Standalone `node_modules` và `.next/static` được đóng gói nguyên vẹn.
  3. Lệnh `only-one ui` khởi động server `server.js` thành công và mở cửa sổ App Mode.
- **Bài học kinh nghiệm (Lessons Learned)**:
  - Khi triển khai Next.js Standalone, không được dùng bộ lọc bỏ qua `node_modules` dạng thô (`child === 'node_modules'`) vì standalone phụ thuộc vào `node_modules` riêng được biên dịch trong `.next/standalone`.
