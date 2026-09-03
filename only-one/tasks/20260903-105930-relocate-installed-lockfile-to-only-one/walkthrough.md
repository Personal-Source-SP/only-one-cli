# Walkthrough: Chuyển đổi Thư mục Lưu trữ Lockfile installed.json sang "only-one" (Hard Cutover)

Tài liệu tóm lược kết quả thực thi và bằng chứng kiểm thử theo kế hoạch tại [plan.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/only-one/tasks/20260903-105930-relocate-installed-lockfile-to-only-one/plan.md).

---

## 1. Tóm tắt Thay đổi (Summary of Changes)

### 1.1. Core Lockfile Resolution
- Tại [src/core/assets/lockfile.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/lockfile.ts):
  - Khai báo hằng số `ONLY_ONE_DIR_NAME = 'only-one'`.
  - Đơn giản hóa hàm `resolveInstalledLockfilePath(projectDir: string): string` thành:
    ```ts
    export function resolveInstalledLockfilePath(projectDir: string): string {
        return join(projectDir, ONLY_ONE_DIR_NAME, ONLY_ONE_LOCKFILE_NAME);
    }
    ```
  - Áp dụng triệt để chính sách **Hard Cutover**: Loại bỏ hoàn toàn nhánh đọc/ghi thư mục ẩn `.only-one/`.

### 1.2. Test Suite Updates
- Tại [test/core/assets/lockfile.test.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/test/core/assets/lockfile.test.ts):
  - Cập nhật test case phân giải đường dẫn mặc định sang `only-one/installed.json`.
  - Bổ sung assertion xác nhận file `only-one/installed.json` được tạo thành công và không sinh ra bất kỳ thư mục `.only-one/` nào.

---

## 2. Bằng chứng Kiểm thử (Verification Evidence)

### 2.1. Kiểm thử Unit Tests
```bash
npx vitest run test/core/assets/lockfile.test.ts
# Kết quả: 4/4 tests passed (8ms)

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
  - **Pass Rate**: 100%

### 2.3. Typecheck & Build
```bash
npm run format:check && npx tsc --noEmit
npm run build
```
- **TypeScript**: 0 errors
- **Prettier**: Clean
- **Build**: Thành công
