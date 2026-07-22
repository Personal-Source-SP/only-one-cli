## MODIFIED Requirements

### Requirement: Chọn editor để đồng bộ extensions

Command `extensions-vs` MUST cho phép người dùng chọn một hoặc nhiều editor thuộc tập Antigravity và Cursor, đồng thời chỉ thay đổi editor đã chọn.

#### Scenario: Cài cho nhiều editor
- **GIVEN** Antigravity và Cursor có CLI khả dụng
- **WHEN** người dùng chạy `extensions-vs` và chọn cả hai editor
- **THEN** danh sách extension nguồn được áp dụng cho từng editor đã chọn
- **AND** editor không được chọn không bị thay đổi

#### Scenario: VS Code được chọn tường minh
- **GIVEN** VS Code không thuộc allowlist
- **WHEN** người dùng yêu cầu `extensions-vs` cho VS Code
- **THEN** command dừng trước thao tác cài đầu tiên
- **AND** báo rằng editor hợp lệ là Antigravity và Cursor
