# Walkthrough: Tích hợp Playwright Browser MCP Server vào only-one-cli

## 1. Tóm tắt Thay đổi (Summary of Changes)
- **Khai báo MCP Manifest**:
  - Cập nhật [assets/mcps/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/mcps/index.ts) để thêm manifest `playwright-browser`.
  - Định hình lệnh khởi chạy: `command: 'npx'`, `args: ['-y', '@playwright/mcp', '--user-data-dir=/Users/Tester/Library/Application Support/Google/Chrome/Default']`.
  - Thiết lập phiên bản chuẩn `version: '0.0.1'` thỏa mãn cơ chế Asset Version Gate.
- **Bổ sung Unit Tests**:
  - Tạo mới file kiểm thử [test/core/mcp/registry.test.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/test/core/mcp/registry.test.ts) kiểm tra:
    1. Hàm `readMcpManifests()` trả về đúng `playwright-browser` với lệnh `npx` và cờ `--user-data-dir`.
    2. Thuộc tính `version` trong `MCPS` tuân thủ cơ số 10 (`0.0.1`).

---

## 2. Bằng chứng Thực thi & Kiểm thử (Verification Evidence)

### 2.1. Fast Test Command (Order 1 & 2)
```bash
npx vitest run test/core/assets/version-gate.test.ts
```
```text
 ✓ test/core/assets/version-gate.test.ts (2 tests) 3ms
 Test Files  1 passed (1)
      Tests  2 passed (2)
```

```bash
npx vitest run test/core/mcp/registry.test.ts
```
```text
 ✓ test/core/mcp/registry.test.ts (2 tests) 2ms
 Test Files  1 passed (1)
      Tests  2 passed (2)
```

### 2.2. Toàn bộ Test Suite Repository
```bash
npm test
```
```text
Test Files  55 passed | 2 skipped (57)
     Tests  223 passed | 4 skipped (227)
```

### 2.3. Prettier Formatting Check
```bash
npm run format:check
```
```text
Checking formatting...
All matched files use Prettier code style!
```

---

## 3. Hướng dẫn Kiểm tra Thủ công (Manual Verification Steps)
1. **Kiểm tra hiển thị TUI**:
   - Chạy lệnh: `npm run dev`
   - Điều hướng tới mục **MCP Servers** (hoặc `McpView`).
   - Kiểm tra `playwright-browser` xuất hiện trong danh sách MCP có thể cấu hình.
2. **Kiểm tra đồng bộ cấu hình**:
   - Chọn `playwright-browser` để đồng bộ.
   - Kiểm tra file cấu hình của các IDE target (ví dụ: `~/.gemini/config/mcp_config.json`, `~/.claude.json`, `~/.cursor/mcp.json`) đã được bổ sung server `playwright-browser` với đầy đủ đối số.
