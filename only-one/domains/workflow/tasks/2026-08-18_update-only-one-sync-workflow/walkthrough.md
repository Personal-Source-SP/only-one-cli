# Walkthrough: Nâng cấp workflow /only-one-sync

Đã hoàn thành triển khai nâng cấp workflow `/only-one-sync` theo kế hoạch [plan.md](file:///Users/kiem/Sources/Personal/only-one-cli/only-one/domains/workflow/tasks/2026-08-18_update-only-one-sync-workflow/plan.md).

## 1. Tóm tắt các thay đổi đã thực hiện

### 1.1. Cập nhật tài liệu workflow gốc [assets/workflows/only-one-sync.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/only-one-sync.md)
- **Ràng buộc Domain bắt buộc (Mandatory Domain)**: Yêu cầu cú pháp `/only-one-sync <domain>`. Nếu không truyền domain, workflow dừng lại và hướng dẫn người dùng chọn domain cụ thể.
- **Đọc Tasks trong Domain (Tùy chọn)**: Quét `only-one/domains/<domain>/tasks/*/` để đọc `plan.md` và `walkthrough.md` nhằm trích xuất ngữ cảnh nghiệp vụ và scenarios đã triển khai. Nếu không có task, luồng tiếp tục bình thường mà không báo lỗi.
- **Quét Codebase đối chiếu**: Quét controllers, services, handlers, models và tests để đối chiếu với logic từ tasks và use cases.
- **Báo cáo & Review Gate**: Hiển thị bảng phân loại use cases kèm mục `🧹 TASKS TO CLEAN UP` (danh sách task folders sẽ xóa) và yêu cầu xác nhận rõ ràng từ người dùng trước khi áp dụng.
- **Dọn dẹp Task folders sau xác nhận**: Tự động xóa các thư mục task đã đồng bộ vào use case catalog để giữ repository tinh gọn.

### 1.2. Đồng bộ runtime workflow [.agents/workflows/only-one-sync.md](file:///Users/kiem/Sources/Personal/only-one-cli/.agents/workflows/only-one-sync.md)
- Đồng bộ toàn bộ nội dung mới để có thể sử dụng ngay trong các phiên làm việc của agent.

### 1.3. Cập nhật Manifest [assets/workflows/index.ts](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/index.ts)
- Cập nhật mô tả tóm tắt của `only-one-sync`: *"Sync domain use cases from tasks (if present) and current codebase for a specific domain, then clean up consolidated tasks."*

---

## 2. Kết quả kiểm thử & Xác thực (Verification)

### 2.1. Kiểm thử tự động (Unit & Integration Tests)
Chạy lệnh `npm run test`:
```text
Test Files  45 passed | 2 skipped (47)
Tests       179 passed | 4 skipped (183)
Duration    3.14s
```
Toàn bộ 179 test cases đều vượt qua thành công mà không có lỗi hồi quy (regression).

### 2.2. Kiểm thử Build (TypeScript & Prettier)
Chạy lệnh `npm run build`:
```text
> prettier --check "src/**/*.{ts,tsx}" "test/**/*.ts"
All matched files use Prettier code style!
tsc -p tsconfig.json -> Success
```
Biên dịch dự án và xuất bundle `dist/` thành công.
