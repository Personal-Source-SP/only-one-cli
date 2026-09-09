# Concept: Loại bỏ hoàn toàn tính năng và thành phần liên quan đến CocoIndex

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Codebase của `only-one-cli` đang tích hợp logic CocoIndex rải rác trên nhiều tầng: Python script placeholder (`scripts/cocoindex_documents.py`), Doctor verification/auto-installer (`src/core/doctor/`), Docker container lifecycle (`src/core/indexing/`), Prebuilt bundle/manifest generation (`src/core/prebuilt/`), Publish packaging (`scripts/publish.js`) và Types contract (`src/core/client/types.ts`).
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - Khi chạy `only-one doctor`, CLI bắt buộc kiểm tra môi trường Python 3.11+ / Docker image `cocoindex/cocoindex-code:latest` dù người dùng không có nhu cầu sử dụng CocoIndex.
  - Phân tán sự tập trung của CLI vào các công cụ index bên ngoài thay vì tập trung vào core feature chính (Agent workflows, skills, rules, MCP, combos, TUI).
  - Tăng độ phức tạp khi bảo trì và publish package.
- **Nguyên nhân cốt lõi (Root Cause)**:
  - Tính năng CocoIndex ban đầu được thiết kế như một submodule tạo code index artifact nhưng hiện tại đã lỗi thời và không còn phù hợp với định hướng phát triển của `only-one-cli`.
- **Tác động (Impact / Blast Radius)**:
  - Cần chỉnh sửa các module `doctor`, `indexing`, `prebuilt`, `publish.js` và test suite. Không ảnh hưởng đến các core commands chính như `init`, `skill`, `workflow`, `rule`, `combo`, `mcp`, `tui`, `setting-vs`, `extensions-vs`.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Gỡ bỏ 100% logic, dependencies, runtime scripts, doctor checks, manifest schemas và tests liên quan đến CocoIndex, trả về codebase tinh gọn và không còn phụ thuộc vào Python / CocoIndex Docker image.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Xoá hoàn toàn tệp [scripts/cocoindex_documents.py](file:///Users/kiem/Sources/PERSONAL/only-one-cli/scripts/cocoindex_documents.py).
  - Gỡ bỏ check và installer của `cocoindex` trong `only-one doctor` (`src/core/doctor/checks.ts`, `src/core/doctor/install.ts`).
  - Gỡ bỏ các hàm gọi container/script CocoIndex trong `src/core/indexing/` và `src/core/prebuilt/indexers.ts`.
  - Gỡ bỏ `cocoindexVersion` và thư mục `.cocoindex` khỏi `manifest.ts`, `bundle.ts`, `types.ts`.
  - Dọn dẹp logic copy `cocoindex_documents.py` trong [scripts/publish.js](file:///Users/kiem/Sources/PERSONAL/only-one-cli/scripts/publish.js).
  - Cập nhật toàn bộ test suite: 100% tests pass và không còn test nào assert CocoIndex.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - **Scripts**: Xoá `scripts/cocoindex_documents.py`, bỏ copy script trong `scripts/publish.js`.
  - **Core Doctor**: Gỡ check `cocoindex` (local & docker mode) trong `src/core/doctor/checks.ts`, gỡ installer `pip3 install cocoindex` trong `src/core/doctor/install.ts`.
  - **Core Indexing & Docker Runtime**: Dọn dẹp `src/core/indexing/tools.ts`, `src/core/indexing/docker-runtime.ts` (giữ lại các Docker generic helpers nếu cần hoặc loại bỏ các CocoIndex specifics).
  - **Core Prebuilt & Manifest**: Dọn dẹp `.cocoindex` trong `src/core/prebuilt/bundle.ts`, `manifest.ts`, `indexers.ts`.
  - **Client Types**: Gỡ trường `cocoindexVersion` trong `src/core/client/types.ts`.
  - **Commands**: Dọn dẹp gợi ý `--skip-cocoindex` trong `src/commands/structure-generate/actions/step-4-generate-payload-and-report.ts`.
  - **Tests**: Cập nhật `test/core/indexing/tools.test.ts`, `test/commands/doctor/doctor.test.ts` và các test liên quan.
- **Explicit Out-of-Scope**:
  - Không thay đổi các tính năng Docker khác không liên quan CocoIndex.
  - Không thay đổi các core commands: `init`, `skill`, `rule`, `workflow`, `combo`, `mcp`, `tui`.

---

## 3. Analysis & Solution Options (Phân tích & Phương án Đề xuất)

### Affected Modules & Files Matrix

| Module | File liên quan | Thay đổi cần thực hiện |
| :--- | :--- | :--- |
| **Scripts** | `scripts/cocoindex_documents.py` | **[DELETE]** Xoá hoàn toàn file |
| **Publish** | `scripts/publish.js` | **[MODIFY]** Bỏ copy `cocoindex_documents.py` khi build pack |
| **Doctor** | `src/core/doctor/checks.ts`, `src/core/doctor/install.ts` | **[MODIFY]** Gỡ bỏ check & auto-install CocoIndex |
| **Indexing** | `src/core/indexing/tools.ts`, `src/core/indexing/docker-runtime.ts` | **[MODIFY/DELETE]** Gỡ bỏ CocoIndex tools & docker args |
| **Prebuilt** | `src/core/prebuilt/bundle.ts`, `manifest.ts`, `indexers.ts` | **[MODIFY/DELETE]** Gỡ bỏ `.cocoindex` artifact dir & version detection |
| **Types** | `src/core/client/types.ts` | **[MODIFY]** Xoá thuộc tính `cocoindexVersion` |
| **Commands** | `src/commands/structure-generate/...` | **[MODIFY]** Xoá flag `--skip-cocoindex` |
| **Tests** | `test/core/indexing/tools.test.ts`, `test/commands/doctor/doctor.test.ts` | **[MODIFY/DELETE]** Dọn dẹp bài test CocoIndex |

---

### Solution Options

#### Option 1: Surgical Full Purge (Loại bỏ triệt để 100%) - **Recommended**
- **Cơ chế**:
  1. Xoá hoàn toàn file script `scripts/cocoindex_documents.py`.
  2. Gỡ bỏ mọi logic, hàm, biến môi trường (`COCOINDEX_SCRIPT`, `COCOINDEX_IMAGE`, `COCOINDEX_BINARY`) và doctor checks liên quan CocoIndex.
  3. Làm sạch `manifest.ts`, `bundle.ts`, `types.ts` không còn bất kỳ dấu vết nào của `.cocoindex` hay `cocoindexVersion`.
  4. Cập nhật test suite tương ứng.
- **Ưu điểm**: Codebase sạch sẽ tuyệt đối, không còn dead code, giảm cognitive load cho developer, lệnh `doctor` chạy nhanh và không phụ thuộc Python/Docker image ngoài.
- **Nhược điểm**: Cần rà soát và cập nhật đồng bộ các file test liên quan.
- **Độ phức tạp**: Thấp (Low complexity).

#### Option 2: Retain Core Indexing generic abstractions, Purge CocoIndex only
- **Cơ chế**: Giữ lại các generic Docker utilities (`isDockerDaemonRunning`, `getDockerServerVersion`...) trong `docker-runtime.ts`, chỉ gỡ bỏ các hằng số và hàm riêng của CocoIndex (`COCOINDEX_CONTAINER_NAME`, `cocoindexContainerRunArgs`, `resolveCocoindexScript`...).
- **Ưu điểm**: Giữ lại các tiện ích Docker dùng chung cho các tính năng tương lai nếu cần.
- **Nhược điểm**: Vẫn cần cấu trúc lại thư mục `indexing/`.
- **Độ phức tạp**: Thấp (Low complexity).

*(Khuyến nghị kết hợp Option 1 & Option 2: Giữ các generic helpers hữu ích, xoá 100% logic cụ thể của CocoIndex).*

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

- **Rủi ro ảnh hưởng lệnh `only-one doctor`**:
  - *Hiện tượng*: Nếu gỡ check `cocoindex` mà không cập nhật các types hoặc mảng `missing` dependencies, lệnh doctor có thể bị lỗi cú pháp hoặc fail test.
  - *Đối sách*: Đảm bảo sửa cả `checks.ts`, `install.ts`, `types.ts` và chạy test `doctor.test.ts`.
- **Rủi ro tương thích Manifest schema**:
  - *Hiện tượng*: Trường `cocoindexVersion` trong `ManifestData` là optional (`cocoindexVersion?: string`). Việc gỡ bỏ hoàn toàn trường này không làm ảnh hưởng các schema khác.
