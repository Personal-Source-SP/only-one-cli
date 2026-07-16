# vs-settings-sync Specification

## Requirements

### Requirement: Chọn editor để đồng bộ settings

Command `setting-vs` MUST cho phép chọn một hoặc nhiều editor được hỗ trợ và chỉ thay đổi editor đã chọn.

Feature: Đồng bộ settings editor
Rule: Một lần chạy có thể áp dụng cho một hoặc nhiều editor được hỗ trợ.

#### Scenario: Đồng bộ cho nhiều editor
- **GIVEN** VS Code, Cursor và Antigravity có thể được phát hiện trên hệ thống
- **WHEN** người dùng chạy `setting-vs` và chọn VS Code cùng Cursor
- **THEN** command lập kế hoạch đồng bộ cho đúng hai editor đã chọn
- **AND** Antigravity không bị thay đổi

#### Scenario: Editor được chọn không khả dụng
- **GIVEN** executable hoặc thư mục user config của một editor được chọn không khả dụng
- **WHEN** người dùng xác nhận chạy `setting-vs`
- **THEN** command dừng trước khi thay đổi dữ liệu
- **AND** hiển thị editor và thành phần còn thiếu

### Requirement: Merge settings không phá dữ liệu hiện có

Command MUST giữ key chỉ có ở máy đích và dùng giá trị nguồn khi cùng key xung đột.

Rule: Settings nguồn thắng khi xung đột, còn settings chỉ có tại máy đích được giữ lại.

#### Scenario: Merge nested settings
- **GIVEN** settings đích chứa key riêng và một nested key trùng với settings nguồn
- **WHEN** `setting-vs` đồng bộ editor
- **THEN** nested key trùng nhận giá trị từ nguồn
- **AND** key riêng của settings đích vẫn tồn tại
- **AND** file kết quả là JSON settings hợp lệ

#### Scenario: Source thay thế array hoặc scalar
- **GIVEN** cùng key có array hoặc scalar khác nhau giữa nguồn và đích
- **WHEN** settings được merge
- **THEN** giá trị đầy đủ từ nguồn thay thế giá trị đích tại key đó

### Requirement: Resolve đúng vị trí settings theo hệ điều hành

Command MUST ghi `settings.json` vào đúng vị trí user config của editor trên macOS hoặc Windows.

#### Scenario: Đồng bộ trên macOS
- **GIVEN** command chạy trên macOS và editor đích được hỗ trợ
- **WHEN** `setting-vs` ghi kết quả
- **THEN** kết quả được ghi vào vị trí user `settings.json` của editor trên macOS

#### Scenario: Đồng bộ trên Windows
- **GIVEN** command chạy trên Windows và editor đích được hỗ trợ
- **WHEN** `setting-vs` ghi kết quả
- **THEN** kết quả được ghi vào vị trí user `settings.json` của editor trên Windows

### Requirement: Báo tiến độ settings

Command MUST hiển thị phần trăm không giảm từ 0 và chỉ báo 100 sau commit thành công.

#### Scenario: Đồng bộ thành công
- **GIVEN** kế hoạch settings có ít nhất một work unit
- **WHEN** `setting-vs` thực thi
- **THEN** command hiển thị phần trăm tiến độ không giảm từ 0 đến 100
- **AND** 100 chỉ được hiển thị sau khi transaction commit
