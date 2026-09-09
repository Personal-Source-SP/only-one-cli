# Concept: Dọn dẹp các script không còn sử dụng trong thư mục scripts/

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Thư mục [scripts/](file:///Users/kiem/Sources/PERSONAL/only-one-cli/scripts) hiện chứa 8 files phục vụ build, publish, runtime và một số script migration dùng 1 lần trong quá khứ. Đồng thời, `package.json` khai báo `"files": ["dist", "scripts", "assets"]` khiến toàn bộ thư mục `scripts/` bị đóng gói khi publish lên npm.
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - Tồn tại các script tạm (one-off migration scripts) và script trùng lặp (legacy shell script) không còn được tham chiếu ở bất kỳ npm script, source code, CI workflow hay tài liệu nào.
  - Tăng kích thước package tarball và gây nhiễu context bảo trì khi phát triển codebase.
- **Nguyên nhân cốt lõi (Root Cause)**:
  - Sau các đợt refactor cấu trúc test, import paths và openspec adapters, các script hỗ trợ chuyển đổi (`fix-imports.mjs`, `move-tests-to-test-dir.mjs`, `port-openspec-adapters.mjs`) chưa được dọn dẹp.
  - Script publish bằng Shell (`publish-npm.sh`) đã được viết lại bằng Node.js (`publish.js`) nhưng file bash cũ vẫn còn lưu lại.
- **Tác động (Impact / Blast Radius)**:
  - Thấp (Low Blast Radius) với code thực thi, nhưng cần đảm bảo không xoá nhầm các script đang trực tiếp phục vụ build (`postbuild-paths.cjs`), runtime (`cocoindex_documents.py`), dev workflow (`bump-asset.ts`) và publish (`publish.js`).

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Xác định chính xác và loại bỏ các file script không còn sử dụng, giữ lại các script thiết yếu và tối ưu hoá phạm vi phân phối npm package.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Xoá bỏ an toàn 4 file script mồ côi: `fix-imports.mjs`, `move-tests-to-test-dir.mjs`, `port-openspec-adapters.mjs`, `publish-npm.sh`.
  - Giữ nguyên và bảo toàn hoạt động của 4 file script thiết yếu: `cocoindex_documents.py`, `postbuild-paths.cjs`, `publish.js`, `bump-asset.ts`.
  - Toàn bộ test suite (`npm test`), format (`npm run format:check`) và build pipeline (`npm run build`) chạy qua 100% không phát sinh lỗi.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Kiểm tra và xoá các file script rác / legacy trong [scripts/](file:///Users/kiem/Sources/PERSONAL/only-one-cli/scripts).
  - Tinh chỉnh danh sách đóng gói `"files"` trong [package.json](file:///Users/kiem/Sources/PERSONAL/only-one-cli/package.json) (nếu cần chỉ định cụ thể các script runtime thay vì expose toàn bộ).
  - Chạy verify build và test suite toàn diện.
- **Explicit Out-of-Scope**:
  - Không refactor logic nội bộ của `publish.js`, `bump-asset.ts` hay `postbuild-paths.cjs`.
  - Không sửa đổi logic core indexing liên quan đến `cocoindex_documents.py`.

---

## 3. Analysis & Solution Options (Phân tích & Phương án Đề xuất)

### Script Audit Matrix (Bảng phân loại hiện trạng)

| Tên File | Vai trò Hiện tại | Trạng thái | Đề xuất |
| :--- | :--- | :--- | :--- |
| [cocoindex_documents.py](file:///Users/kiem/Sources/PERSONAL/only-one-cli/scripts/cocoindex_documents.py) | Runtime Python helper cho CocoIndex (gọi từ `src/core/indexing/tools.ts`, `doctor`) | **Active / Critical** | **Giữ lại (Keep)** |
| [postbuild-paths.cjs](file:///Users/kiem/Sources/PERSONAL/only-one-cli/scripts/postbuild-paths.cjs) | Build-time script xử lý alias paths sau khi `tsc` biên dịch (`npm run build`) | **Active / Critical** | **Giữ lại (Keep)** |
| [publish.js](file:///Users/kiem/Sources/PERSONAL/only-one-cli/scripts/publish.js) | Publish tooling cho npm & local (`npm run publish:npm`, `npm run publish:local`) | **Active / Core** | **Giữ lại (Keep)** |
| [bump-asset.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/scripts/bump-asset.ts) | CLI helper bump asset versions (`npm run asset:bump`) | **Active / Core** | **Giữ lại (Keep)** |
| [publish-npm.sh](file:///Users/kiem/Sources/PERSONAL/only-one-cli/scripts/publish-npm.sh) | Shell script publish cũ, đã được thay thế bởi `publish.js` | **Legacy / Stale** | **Xoá (Delete)** |
| [fix-imports.mjs](file:///Users/kiem/Sources/PERSONAL/only-one-cli/scripts/fix-imports.mjs) | Migration script sửa import `.js` dùng 1 lần trong đợt refactor ESM | **One-off / Dead** | **Xoá (Delete)** |
| [move-tests-to-test-dir.mjs](file:///Users/kiem/Sources/PERSONAL/only-one-cli/scripts/move-tests-to-test-dir.mjs) | Migration script di chuyển file test sang `test/` dùng 1 lần | **One-off / Dead** | **Xoá (Delete)** |
| [port-openspec-adapters.mjs](file:///Users/kiem/Sources/PERSONAL/only-one-cli/scripts/port-openspec-adapters.mjs) | Script chuyển đổi adapter openspec dùng 1 lần | **One-off / Dead** | **Xoá (Delete)** |

---

### Solution Options

#### Option 1: Clean Stale Scripts (Standard & Minimal Blast Radius) - **Recommended**
- **Chi tiết**: Xoá trực tiếp 4 file `publish-npm.sh`, `fix-imports.mjs`, `move-tests-to-test-dir.mjs`, `port-openspec-adapters.mjs`. Giữ nguyên cấu hình `package.json` `"files": ["dist", "scripts", "assets"]`.
- **Ưu điểm**: Triệt để, đơn giản, rủi ro bằng 0, không ảnh hưởng bất kỳ luồng build/runtime nào.
- **Nhược điểm**: `package.json` vẫn đóng gói cả `publish.js` và `bump-asset.ts` vào tarball publish npm (mặc dù kích thước không đáng kể).
- **Độ phức tạp**: Rất thấp (Very Low).

#### Option 2: Clean Stale Scripts + Package Whitelisting (Optimized Tarball)
- **Chi tiết**: Xoá 4 file thừa, đồng thời trong `package.json` `"files"`, thay `"scripts"` thành `"scripts/cocoindex_documents.py"` để npm package chỉ đóng gói duy nhất file runtime Python cần thiết cho end-user.
- **Ưu điểm**: Tarball npm sạch sẽ tối đa, chỉ chứa runtime artifacts.
- **Nhược điểm**: Cần kiểm tra kỹ xem có tooling nào khi cài đặt qua npm cần các script khác hay không.
- **Độ phức tạp**: Thấp (Low).

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

- **Nguy cơ xoá nhầm `cocoindex_documents.py`**:
  - *Rủi ro*: Lệnh `only-one doctor` và tính năng indexing CocoIndex sẽ bị fail vì kiểm tra path `scripts/cocoindex_documents.py`.
  - *Đối sách*: Xác định đây là file runtime bắt buộc giữ lại.
- **Nguy cơ xoá nhầm `postbuild-paths.cjs`**:
  - *Rủi ro*: Lệnh `npm run build` sẽ fail ở bước map path aliases sau `tsc`.
  - *Đối sách*: Xác định đây là file build pipeline bắt buộc giữ lại.
