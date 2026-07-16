## Why

Thiết lập VS Code, Cursor hoặc Antigravity trên máy mới đang yêu cầu cài extension và cấu hình thủ công, gây tốn thời gian và dễ tạo sai khác giữa các môi trường. CLI cần cung cấp quy trình đồng bộ lặp lại được từ `libraries` mà vẫn bảo toàn dữ liệu hiện có trên máy đích.

## What Changes

- Thêm command `setting-vs` để chọn một hoặc nhiều editor đích và merge `settings.json` từ `libraries` vào đúng thư mục user config trên macOS hoặc Windows.
- Thêm command `extensions-vs` để chọn một hoặc nhiều editor đích, merge danh sách extension ID và cài extension còn thiếu qua CLI chính thức của từng editor.
- Áp dụng chính sách merge trong đó cấu hình từ `libraries` thắng khi trùng key, còn key và extension chỉ có trên máy đích được giữ lại.
- Hiển thị tiến độ phần trăm trong quá trình chuẩn bị, merge, cài đặt và hoàn tất.
- Dùng transaction có backup và journal để rollback dữ liệu về trạng thái trước khi chạy nếu tiến trình lỗi, nhận tín hiệu dừng, hoặc lần chạy trước bị tắt đột ngột.
- Bổ sung manifest/config trong `libraries` cho `settings.json` và danh sách extension ID dùng chung hoặc theo editor.

## Capabilities

### New Capabilities

- `vs-settings-sync`: Đồng bộ `settings.json` có merge, chọn nhiều editor, định tuyến đường dẫn đa nền tảng, báo tiến độ và rollback an toàn.
- `vs-extensions-sync`: Đồng bộ extension ID qua CLI chính thức của editor, giữ extension hiện có, báo tiến độ và rollback trạng thái quản lý được.
- `vs-sync-transaction`: Quản lý backup, journal, phát hiện lần chạy dở dang và rollback toàn bộ thay đổi thuộc phiên đồng bộ.

### Modified Capabilities

Không có.

## Impact

- CLI command registration và interactive prompts trong `src/commands`, `src/cli`, `src/prompts`.
- Core service mới cho editor discovery, path resolution, JSON merge, extension CLI adapter, progress và transaction recovery.
- Dữ liệu nguồn mới trong `libraries`.
- Unit/integration tests cho macOS, Windows, merge conflict, nhiều editor, tiến độ, lỗi giữa chừng, signal termination và recovery lần chạy kế tiếp.
- Không thay đổi hành vi command hiện có; yêu cầu executable CLI của editor tương ứng để cài extension.
