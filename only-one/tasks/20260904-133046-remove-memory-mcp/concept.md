# Concept: Loại Bỏ MCP Server `memory` Khỏi Cấu Hình Built-in

## 1. Problem Statement & Root Need (Bối cảnh & Vấn đề Cốt lõi)
- **Core Business Problem**: MCP server `memory` (`@modelcontextprotocol/server-memory`) hiện không còn cần thiết hoặc không đem lại giá trị thiết thực trong bộ công cụ mặc định của `only-one-cli`. Việc duy trì một MCP không sử dụng làm tăng bề mặt cấu hình (configuration surface), gây dư thừa tài nguyên và làm người dùng nhầm lẫn khi lựa chọn danh sách MCP servers có sẵn.
- **Target Audience & Core Value**:
  - **Đối tượng hưởng lợi**: Developer và AI Agent sử dụng `only-one-cli`.
  - **Giá trị cốt lõi**: Tinh gọn danh mục MCP registry tích hợp sẵn, loại bỏ dependency/cấu hình không cần thiết và giữ cho manifest luôn chính xác, gọn gàng.

## 2. Scope Boundaries (Ranh giới Phạm vi)
- **In-Scope**:
  - Loại bỏ định nghĩa MCP manifest `memory` (`id: 'memory'`) khỏi danh sách `MCPS` trong `assets/mcps/index.ts`.
  - Rà soát và cập nhật tài liệu liên quan (`README.md`, `BACKLOG.md`) nếu có đề cập tới `memory` MCP để đảm bảo tính nhất quán (consistency).
  - Đảm bảo build và type check của `only-one-cli` vượt qua thành công sau khi xóa.
- **Explicit Out-of-Scope**:
  - Không thay đổi cơ chế đăng ký, inject hoặc khởi tạo các MCP servers khác (`clockify`, `fetch`, `github`, `playwright-browser`, `postgres`, `tavily`, `zodinet-timesheet`).
  - Không thay đổi schema hoặc interface `McpManifest`.

## 3. Success Metrics (Thước đo Thành công / Definition of Done)
- Manifest `memory` được loại bỏ hoàn toàn khỏi `assets/mcps/index.ts`.
- Lệnh `npm run build` (hoặc `npm run test` / `tsc`) hoàn thành không lỗi.
- CLI khi liệt kê hoặc cài đặt MCP không còn hiển thị `memory`.

## 4. Proposed Solution & Core Mechanism (Phương pháp Giải quyết & Cơ chế Xử lý)

### 4.1. Explored Options & Trade-off Analysis (Các Phương án Đã Cân Nhắc)
| Option | Hướng tiếp cận | Ưu điểm (Pros) | Nhược điểm (Cons) | Độ phức tạp | Đánh giá |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Option 1: Clean Removal (Khuyên dùng)** | Xóa trực tiếp block manifest `memory` trong `assets/mcps/index.ts` và đồng bộ tài liệu liên quan | Triệt để, sạch mã nguồn (zero dead code), không để lại technical debt | Cần cập nhật nhẹ tài liệu hướng dẫn nếu có nhắc tới `memory` | Low | **Lựa chọn tối ưu** |
| **Option 2: Deprecate / Disable Flag** | Thêm cờ `deprecated: true` hoặc comment out block cấu hình | Có thể bật lại nhanh chóng nếu cần | Tạo mã rác (dead code / zombie config), gây nhiễu registry | Low | Không phù hợp với triết lý tinh gọn của CLI |

- **Chosen Strategy (Phương án Được Chọn)**: **Option 1 (Clean Removal)** — Xóa dứt điểm cấu hình `memory` khỏi `assets/mcps/index.ts` và đồng bộ các tài liệu tham chiếu.

### 4.2. Core Processing Flow (Luồng Xử lý / Chuyển trạng thái Chính)
- **Workflow / Logic Flow**:
  1. **Source Update**: Loại bỏ object entry `{ id: 'memory', ... }` khỏi mảng `MCPS` trong `assets/mcps/index.ts`.
  2. **Doc Synchronization**: Cập nhật ví dụ lệnh trong [README.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/README.md) và mục checklist trong [BACKLOG.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/BACKLOG.md).
  3. **Verification**: Chạy kiểm tra TypeScript (`tsc --noEmit` hoặc `npm run build`) đảm bảo không bị gãy liên kết mã.

### 4.3. UI Wireframe / Visual Mockup (Mẫu Phác thảo Giao diện)
*(Không áp dụng - Tính năng cấu hình CLI / TypeScript backend)*

### 4.4. Critical Edge Cases & Risk Handling (Kịch bản Biên & Xử lý Rủi ro)
- **Edge Cases & Failure Modes**: Người dùng cũ vẫn có file cấu hình local chứa `memory` MCP -> `only-one-cli` không bị crash vì MCP local được parse độc lập với manifest built-in.
- **Rollback / Fallback Mechanism**: Dễ dàng khôi phục lại manifest entry qua git commit history nếu phát sinh nhu cầu tái sử dụng.

## 5. Technical English Key Patterns
### 1. Deprecate and remove obsolete configurations
- **Meaning (VI)**: Ngưng sử dụng và loại bỏ các cấu hình lỗi thời / không còn dùng.
- **Grammar / Usage**: `deprecate and remove + [noun phrase]` (Động từ ghép thường dùng khi dọn dẹp codebase).
- **Engineering Example**: *"We should deprecate and remove obsolete configurations to minimize maintenance overhead."*

### 2. Streamline the manifest registry
- **Meaning (VI)**: Tinh gọn danh mục manifest / sổ bộ đăng ký.
- **Grammar / Usage**: `streamline + [system / process / registry]` (Dùng khi tối ưu hóa, cắt bỏ phần thừa để hệ thống hoạt động hiệu quả hơn).
- **Engineering Example**: *"Removing unused MCP servers helps streamline the manifest registry for new users."*

### 3. Clean removal vs. Soft deprecation
- **Meaning (VI)**: Xóa triệt để so với đánh dấu ngưng sử dụng mềm.
- **Grammar / Usage**: `[Approach A] vs. [Approach B]` (Cặp thuật ngữ so sánh trong phân tích trade-off kiến trúc).
- **Engineering Example**: *"We opted for a clean removal over soft deprecation because the memory MCP had zero downstream consumers."*
