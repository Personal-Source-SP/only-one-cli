## Why

`only-one mcp` chưa cung cấp GitNexus, khiến các agent được hỗ trợ không thể nhận ngữ cảnh kiến trúc, dependency và blast-radius từ knowledge graph qua luồng cấu hình MCP chuẩn của dự án. Bổ sung manifest GitNexus read-only giúp workflow lập kế hoạch code có dữ liệu cấu trúc sâu mà không mở các công cụ sửa đổi hoặc truy vấn raw nguy hiểm.

## What Changes

- Thêm `gitnexus` vào MCP registry với lệnh `npx -y gitnexus@latest mcp`.
- Đặt `GITNEXUS_MCP_READ_ONLY=1` trong manifest mặc định để chỉ cung cấp bề mặt đọc phục vụ khám phá và lập kế hoạch.
- Cho phép `only-one mcp gitnexus` đồng bộ cấu hình sang Antigravity, Claude, Cursor và Codex bằng luồng merge/transaction hiện có.
- Bổ sung kiểm thử registry, chuyển đổi cấu hình theo từng target và hành vi CLI liên quan.
- Cập nhật tài liệu MCP để nêu yêu cầu index repository trước bằng GitNexus và phạm vi read-only mặc định.

## Capabilities

### New Capabilities
- `gitnexus-mcp-integration`: Định nghĩa manifest GitNexus read-only và khả năng chọn, xác thực, đồng bộ nó qua lệnh MCP hiện có.

### Modified Capabilities
- `mcp-library-registry`: Registry nhận thêm server `gitnexus` với cấu hình không chứa credential và chính sách read-only mặc định.
- `mcp-global-sync`: Đồng bộ GitNexus tới mọi target được hỗ trợ, bảo toàn biến môi trường chính sách trong định dạng JSON/TOML tương ứng.

## Impact

- Registry MCP trong `assets/mcps/` và kiểu manifest liên quan.
- Luồng `only-one mcp` hiện có cho Antigravity, Claude, Cursor và Codex.
- Kiểm thử MCP registry, target adapter, merge và output CLI.
- README/hướng dẫn sử dụng MCP.
- Runtime phụ thuộc `npx` tải `gitnexus@latest`; không thêm dependency npm trực tiếp vào `only-one`.
