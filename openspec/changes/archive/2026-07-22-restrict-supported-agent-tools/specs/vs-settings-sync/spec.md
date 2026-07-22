## MODIFIED Requirements

### Requirement: Chọn editor để đồng bộ settings

Command `setting-vs` MUST cho phép chọn một hoặc nhiều editor thuộc tập Antigravity và Cursor, đồng thời chỉ thay đổi editor đã chọn.

Feature: Đồng bộ settings editor
Rule: Một lần chạy có thể áp dụng cho một hoặc nhiều editor VS-capable thuộc allowlist.

#### Scenario: Đồng bộ cho nhiều editor
- **GIVEN** Cursor và Antigravity có thể được phát hiện trên hệ thống
- **WHEN** người dùng chạy `setting-vs` và chọn cả Cursor cùng Antigravity
- **THEN** command lập kế hoạch đồng bộ cho đúng hai editor đã chọn

#### Scenario: VS Code được chọn tường minh
- **GIVEN** VS Code không thuộc allowlist
- **WHEN** người dùng yêu cầu `setting-vs` cho VS Code
- **THEN** command dừng trước khi thay đổi dữ liệu
- **AND** báo rằng editor hợp lệ là Antigravity và Cursor

#### Scenario: Editor được chọn không khả dụng
- **GIVEN** executable hoặc thư mục user config của một editor được chọn không khả dụng
- **WHEN** người dùng xác nhận chạy `setting-vs`
- **THEN** command dừng trước khi thay đổi dữ liệu
- **AND** hiển thị editor và thành phần còn thiếu
