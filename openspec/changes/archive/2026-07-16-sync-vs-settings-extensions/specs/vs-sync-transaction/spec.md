## ADDED Requirements

### Requirement: Ghi journal trước mọi thay đổi

Command MUST ghi backup và journal bền vững trước mutation đầu tiên của transaction.

#### Scenario: Bắt đầu transaction
- **GIVEN** toàn bộ input và editor đích đã được validate
- **WHEN** command chuẩn bị thay đổi settings hoặc extensions
- **THEN** backup và journal phục hồi được ghi bền vững trước mutation đầu tiên
- **AND** journal xác định các tài nguyên thuộc phiên chạy

### Requirement: Rollback khi command thất bại hoặc bị dừng

Transaction MUST khôi phục dữ liệu trước phiên khi lỗi hoặc nhận tín hiệu dừng được hỗ trợ.

#### Scenario: Lỗi giữa quá trình đồng bộ settings
- **GIVEN** một editor đã được cập nhật và editor kế tiếp gặp lỗi
- **WHEN** transaction xử lý lỗi
- **THEN** mọi file settings đã thay đổi trong phiên được khôi phục về nội dung trước khi chạy
- **AND** command kết thúc với trạng thái thất bại

#### Scenario: Lỗi giữa quá trình cài extensions
- **GIVEN** command đã cài một số extension và thao tác sau gặp lỗi
- **WHEN** transaction rollback
- **THEN** extension do chính phiên đó cài thành công được yêu cầu gỡ
- **AND** extension tồn tại trước phiên không bị gỡ

#### Scenario: Terminal gửi tín hiệu dừng có thể xử lý
- **GIVEN** transaction đang hoạt động
- **WHEN** tiến trình nhận tín hiệu dừng được hỗ trợ
- **THEN** command thực hiện rollback trước khi thoát
- **AND** không báo tiến độ hoàn tất 100

### Requirement: Phục hồi phiên bị tắt đột ngột

Command MUST phục hồi journal chưa hoàn tất trước khi cho phép transaction mới thay đổi dữ liệu.

#### Scenario: Phát hiện journal dở dang ở lần chạy sau
- **GIVEN** lần chạy trước bị kết thúc mà không commit hoặc rollback hoàn tất
- **WHEN** người dùng chạy lại một command đồng bộ VS
- **THEN** command rollback phiên dở dang trước khi tạo transaction mới
- **AND** chỉ tiếp tục đồng bộ mới sau khi recovery thành công

#### Scenario: Recovery không hoàn tất
- **GIVEN** journal dở dang tồn tại và một thao tác rollback thất bại
- **WHEN** command khởi động
- **THEN** command giữ journal để có thể thử recovery lại
- **AND** từ chối bắt đầu mutation mới
- **AND** hiển thị lỗi cùng bước khắc phục

### Requirement: Commit chỉ sau khi toàn bộ work unit thành công

Transaction MUST commit chỉ sau khi mọi work unit thành công và MUST không báo 100 trước commit.

#### Scenario: Hoàn tất transaction
- **GIVEN** mọi thay đổi settings hoặc extensions trong kế hoạch đã thành công
- **WHEN** command finalize
- **THEN** journal được đánh dấu commit trước khi dọn backup
- **AND** command báo tiến độ 100 và trạng thái thành công
