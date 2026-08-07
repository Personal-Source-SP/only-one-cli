# UI/UX & Styling Guidelines

## Quy chuẩn Giao diện & Trải nghiệm Người dùng

### 1. Tham khảo Mẫu Thiết Kế (`ux-ui-pro-max`)
- **Tư vấn & Lên Mẫu Design**: Khi thiết kế màn hình mới hoặc thay đổi lớn giao diện UI/UX, BẮT BUỘC kiểm tra và sử dụng skill `ux-ui-pro-max` (khi sẵn có) để tham khảo phong cách thiết kế, bố cục (layout), phối màu, typography và micro-interactions nâng cao.

### 2. Thứ tự Ưu tiên Tái sử dụng Component & Styling (Priority Cascade)

BẮT BUỘC tuân thủ nghiêm ngặt thứ tự ưu tiên 3 cấp dưới đây khi phát triển UI:

$$\text{1. Common Components (@/components)} \longrightarrow \text{2. Ant Design (@/antd)} \longrightarrow \text{3. TailwindCSS}$$

1. **Cấp 1 (Ưu tiên cao nhất - `@/components`)**:
   - Khảo sát và tái sử dụng toàn bộ các components dùng chung đã đóng gói sẵn trong `src/components/` (như `ListWrapper`, `ListTable`, `FilterPanel`, `CardAction`, `CustomDrawerForm`, `CustomInputForm`, `CustomSelectInput`, `CustomModal`, `UploadImage`,...).
2. **Cấp 2 (Ưu tiên thứ hai - Ant Design `antd`)**:
   - Nếu `@/components` không có wrapper sẵn, sử dụng các nguyên mẫu UI components từ thư viện Ant Design (`Button`, `Table`, `Tag`, `Typography`, `Card`, `Space`, `Drawer`, `Modal`, `Form`, `Input`, `Select`, `Badge`,...).
3. **Cấp 3 (Ưu tiên thứ ba - TailwindCSS)**:
   - CHỈ sử dụng TailwindCSS cho việc sắp xếp bố cục layout (Flexbox, Grid, spacing gap/margin/padding), cấu hình responsive breakpoints hoặc custom styling khi Cấp 1 và Cấp 2 không đáp ứng đủ.

- **Color Constants**: Tái sử dụng các hằng số màu sắc chuẩn trong ứng dụng (`ACTIVE_STATUS_COLORS`, `BOOLEAN_TAG_COLORS`).

### 3. Responsive & Accessibility
- Kiểm tra hiển thị tương thích tốt trên cả Mobile, Tablet và Desktop.
- Đảm bảo các phần tử tương tác có thể điều khiển bằng bàn phím (Keyboard operable) và hiển thị rõ trạng thái Focus.
- Các nút chỉ chứa icon (Icon-only buttons) BẮT BUỘC phải có `Tooltip` hoặc thuộc tính `aria-label`.
