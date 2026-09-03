# Walkthrough: Hợp nhất skills-lock.json vào installed.json (Unified Asset Lockfile)

Tài liệu tóm lược kết quả thực thi và bằng chứng kiểm thử theo kế hoạch tại [plan.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/only-one/tasks/20260903-110500-consolidate-skills-lock-into-installed-json/plan.md).

---

## 1. Tóm tắt Thay đổi (Summary of Changes)

### 1.1. Schema Hợp nhất ([src/core/assets/types.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/types.ts))
- Bổ sung interface `RemoteSkillLockMeta`:
  ```ts
  export interface RemoteSkillLockMeta {
      source: string;
      sourceType: 'github';
      branch?: string;
      skillPath: string;
      computedHash: string;
      updatedAt?: string;
  }
  ```
- Mở rộng `InstalledAssetRecord` với trường tùy chọn `remote?: RemoteSkillLockMeta`.

### 1.2. Tái cấu trúc Module Remote Skills ([src/core/skill/remote/lockfile.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/skill/remote/lockfile.ts))
- Tái triển khai `saveSkillToLockfile`, `readSkillsLockfile`, `removeSkillFromLockfile` trên nền tảng `only-one/installed.json`:
  - `saveSkillToLockfile`: Lưu trực tiếp metadata của remote skill vào nhánh `installed.skills[skillName].remote` trong `installed.json`.
  - `readSkillsLockfile`: Trích xuất dữ liệu remote từ `installed.json` và trả về định dạng `SkillsLockfile` tương thích ngược. Hỗ trợ transparent fallback nếu phát hiện file cũ `skills-lock.json`.
  - `removeSkillFromLockfile`: Gọi hàm gỡ bỏ tài nguyên `removeInstalledAsset` chuẩn hóa.
- **Loại bỏ File phân mảnh**: CLI không còn tạo mới file `only-one/skills-lock.json`. Toàn bộ thông tin được quy tụ về một nơi duy nhất.

### 1.3. Cập nhật Test Suites ([test/core/skill-lockfile.test.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/test/core/skill-lockfile.test.ts))
- Cập nhật 5 bài kiểm thử unit tests:
  - Xác nhận khi lưu remote skill, file `only-one/installed.json` được tạo và chứa trường `remote.computedHash`.
  - Xác nhận `skills-lock.json` không còn xuất hiện.
  - Xác nhận khả năng transparent fallback khi gặp dữ liệu cũ.
  - Xác nhận thao tác gỡ bỏ skill cập nhật chính xác trong `installed.json`.

---

## 2. Bằng chứng Kiểm thử (Verification Evidence)

### 2.1. Kiểm thử Unit Tests
```bash
npx vitest run test/core/skill-lockfile.test.ts
# Kết quả: 5/5 tests passed (8ms)

npx vitest run test/commands/skill/skill.test.ts
# Kết quả: 2/2 tests passed (237ms)

npx vitest run test/core/assets/lockfile.test.ts
# Kết quả: 4/4 tests passed (9ms)
```

### 2.2. Kiểm thử Toàn bộ Repository (Full Test Suite)
```bash
npm test
```
- **Kết quả**:
  - **Test Files**: 54 passed | 2 skipped (56 files)
  - **Tests**: 221 passed | 4 skipped (225 tests)
  - **Pass Rate**: 100%

### 2.3. Typecheck & Build Bundle
```bash
npm run format:check && npx tsc --noEmit
npm run build
```
- **Prettier & TypeScript**: Clean (0 errors).
- **Production Build**: Output `./dist/` được đóng gói hoàn tất.
