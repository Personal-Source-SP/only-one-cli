# vs-extensions-sync Specification

## Requirements

### Requirement: Chọn editor để đồng bộ extensions

Command `extensions-vs` MUST cho phép người dùng chọn một hoặc nhiều editor được hỗ trợ và chỉ thay đổi editor đã chọn.

#### Scenario: Cài cho nhiều editor
- **GIVEN** nhiều editor được hỗ trợ có CLI khả dụng
- **WHEN** người dùng chạy `extensions-vs` và chọn nhiều editor
- **THEN** danh sách extension nguồn được áp dụng cho từng editor đã chọn
- **AND** editor không được chọn không bị thay đổi

### Requirement: Giữ extension hiện có và cài phần còn thiếu

Command MUST giữ extension hiện có, chỉ cài extension ID nguồn còn thiếu và không gỡ extension ngoài manifest.

Rule: Extension ID nguồn được merge với extension hiện có, không thay thế toàn bộ.

#### Scenario: Cài extension còn thiếu
- **GIVEN** editor đã có một phần extension trong danh sách nguồn và có extension riêng
- **WHEN** `extensions-vs` chạy
- **THEN** chỉ extension nguồn còn thiếu được yêu cầu cài qua CLI chính thức của editor
- **AND** extension đã có không bị cài lại
- **AND** extension riêng không bị gỡ

#### Scenario: Danh sách nguồn có ID trùng lặp
- **GIVEN** danh sách nguồn chứa extension ID trùng nhau khác kiểu chữ
- **WHEN** command lập kế hoạch
- **THEN** mỗi extension ID chỉ tạo tối đa một thao tác cài cho mỗi editor

### Requirement: Xử lý thiếu editor CLI an toàn

Command MUST validate CLI của mọi editor đã chọn trước thao tác cài đầu tiên.

#### Scenario: CLI của một editor được chọn không tồn tại
- **GIVEN** người dùng chọn editor không có executable CLI khả dụng
- **WHEN** `extensions-vs` validate kế hoạch
- **THEN** command dừng trước thao tác cài đầu tiên
- **AND** hiển thị hướng dẫn xác định editor bị thiếu CLI

### Requirement: Báo tiến độ extensions

Command MUST hiển thị tiến độ phần trăm không giảm và chỉ báo 100 sau commit thành công.

#### Scenario: Cài nhiều extension
- **GIVEN** kế hoạch có nhiều extension cần cài trên một hoặc nhiều editor
- **WHEN** từng thao tác hoàn tất
- **THEN** command cập nhật phần trăm tiến độ không giảm theo số work unit hoàn thành
- **AND** hiển thị editor và extension đang xử lý
- **AND** chỉ hiển thị 100 sau khi transaction commit
