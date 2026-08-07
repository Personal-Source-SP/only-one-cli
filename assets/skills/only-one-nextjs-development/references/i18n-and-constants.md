# i18n & Constants Reference

## Quy chuẩn Đa ngôn ngữ (i18n) & Hằng số

### 1. Cấu trúc Key dịch theo Page / Module (`pages.<feature>.*`)
Mỗi feature page BẮT BUỘC tổ chức các keys dịch trong i18n theo đúng cấu trúc tiêu chuẩn dưới tiền tố `pages.<feature>.*`:

- **`actions`**: Các hành động/nút bấm trên trang (ví dụ: `pages.washModes.actions.create`).
- **`columns`**: Tiêu đề các cột dữ liệu hiển thị trên bảng `ListTable` (ví dụ: `pages.washModes.columns.name`).
- **`filters`**: Nhãn hoặc placeholders của các trường lọc/tìm kiếm trong `FilterPanel` (ví dụ: `pages.washModes.filters.searchPlaceholder`).
- **`status`**: Định nghĩa nhãn cho các trạng thái dữ liệu để hiển thị trên Badge/Tag (ví dụ: `pages.washModes.status.active`).
- **`content`**: Tiêu đề Drawer/Modal và các nội dung văn bản thông thường (ví dụ: `pages.washModes.content.createTitle`).
- **`notifications`**: Chứa toàn bộ thông báo Toast/Notification:
  - **`success`**: Thông báo thành công khi tạo mới, cập nhật, xóa (`pages.washModes.notifications.success.create`).
  - **`error`**: Thông báo lỗi nghiệp vụ hoặc hệ thống (`pages.washModes.notifications.error.create`).
- **`form`**: Tất cả tài nguyên ngôn ngữ của form nhập liệu, phân nhỏ thành:
  - **`labels`**: Nhãn (Label) hiển thị của các Form Item (`pages.washModes.form.labels.name`).
  - **`placeholders`**: Gợi ý nhập liệu (Placeholder) tương ứng (`pages.washModes.form.placeholders.name`).
  - **`rules`**: Cảnh báo lỗi xác thực dữ liệu / Validation rules (`pages.washModes.form.rules.nameRequired`).

### 2. Các Thành phần Tùy biến (Custom Keys)
Đối với các tính năng hoặc thành phần giao diện đặc thù không thuộc Form hay Table chuẩn (ví dụ: Drawer hiển thị thông tin bảo mật, hướng dẫn từng bước):
- **Vị trí**: Đặt các nhóm key này trực tiếp ở cấp đầu của trang `pages.<feature>.*` (cùng cấp với `actions`, `form`, `content`), ví dụ `pages.devices.credentialsDrawer` hoặc `pages.devices.connectionSteps`.
- **Mục đích**: Giữ cấu trúc phẳng vừa phải, tránh lồng quá nhiều cấp độ sâu và tránh làm phình to các nhóm chuẩn.

### 3. Quy chuẩn tích hợp trong Code
- ✅ **i18next Integration**:
  - Sử dụng `const { t } = useTranslation()`.
  - BẮT BUỘC sử dụng `useMemo` khi tạo danh sách `columns`, `filters`, `actions`, `options` có gọi hàm `t(...)` để tối ưu hiệu năng re-render.
- ✅ **Constants**:
  - Khai báo độ rộng cột (`MODE_COLUMN_WIDTH`), index keys (`MODE_COLUMN_INDEX`) và hằng số tĩnh trong file `constants.ts` của trang.

