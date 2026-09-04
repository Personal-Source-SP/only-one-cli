# Walkthrough: Loại Bỏ MCP Server `memory` Khỏi Cấu Hình Built-in

## 1. Tóm tắt Thay đổi (Summary of Changes)
Đã thực hiện loại bỏ hoàn toàn manifest MCP server `memory` (`@modelcontextprotocol/server-memory`) khỏi mảng `MCPS` trong `assets/mcps/index.ts`, đồng thời bổ sung unit test khẳng định tính vắng mặt của `memory` và cập nhật tài liệu kỹ thuật ([README.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/README.md) & [BACKLOG.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/BACKLOG.md)).

### Chi tiết các file đã sửa đổi:
- **[assets/mcps/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/mcps/index.ts)**: Xóa object entry `{ id: 'memory', ... }` khỏi mảng `MCPS`.
- **[test/core/mcp/registry.test.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/test/core/mcp/registry.test.ts)**: Thêm unit test kiểm tra `readMcpManifests()` không còn chứa `memory` manifest.
- **[README.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/README.md)**: Xóa `memory` khỏi ví dụ lệnh `only-one mcp`.
- **[BACKLOG.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/BACKLOG.md)**: Cập nhật danh mục MCP registry sẵn có (7 servers: `clockify`, `fetch`, `github`, `playwright-browser`, `postgres`, `tavily`, `zodinet-timesheet`).

---

## 2. Bằng chứng Xác thực (Verification Evidence)

### 2.1. Fast Test: MCP Registry Unit Tests
```bash
npm test test/core/mcp/registry.test.ts
```
**Kết quả**:
```text
 ✓ test/core/mcp/registry.test.ts (3 tests) 3ms
   ✓ registers playwright-browser with required command and user-data-dir argument
   ✓ ensures playwright-browser has a valid decimal version in assets manifest
   ✓ ensures memory MCP is excluded from active manifests

 Test Files  1 passed (1)
      Tests  3 passed (3)
```

### 2.2. Full Test Suite Execution
```bash
npm test
```
**Kết quả**:
```text
 Test Files  55 passed | 2 skipped (57)
      Tests  224 passed | 4 skipped (228)
   Duration  9.19s
```

### 2.3. Project Build & Format Check
```bash
npm run build
```
**Kết quả**:
```text
> only-one@1.0.3 build
> npm run format:check && node -e "require('node:fs').rmSync('dist', { recursive: true, force: true })" && tsc -p tsconfig.json && node scripts/postbuild-paths.cjs && node -e "if (process.platform !== 'win32') require('node:fs').chmodSync('dist/src/index.js', 0o755)"

Checking formatting...
All matched files use Prettier code style!
```

---

## 3. Trạng thái Hoàn thành (Definition of Done)
- [x] Manifest `memory` được loại bỏ hoàn toàn khỏi mã nguồn.
- [x] Không còn dangling reference trong tài liệu hướng dẫn và backlog.
- [x] 100% unit tests và build pipeline vượt qua thành công.
