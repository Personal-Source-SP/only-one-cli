# UI/UX & Styling Guidelines

## Quy chuẩn Giao diện & Trải nghiệm Người dùng

### 1. Kích hoạt Trí tuệ Thiết kế (Tham chiếu Skill `ui-ux-pro-max`)
Khi thực hiện các công việc liên quan đến giao diện, Agent BẮT BUỘC tham chiếu và sử dụng skill [ui-ux-pro-max](../ui-ux-pro-max/SKILL.md) (hoặc `.agents/skills/ui-ux-pro-max/SKILL.md` / `.cursor/skills/ui-ux-pro-max/SKILL.md` trong workspace) theo các trường hợp sau:

| Nhiệm vụ UI/UX | Khi nào cần mở skill `ui-ux-pro-max`? |
| :--- | :--- |
| **Thiết kế Trang / Feature mới** | Tham khảo phong cách thiết kế tổng thể (Design System), bố cục layout và SaaS patterns. |
| **Phối màu & Typography** | Tra cứu bảng màu chuẩn (Palette profiles), độ tương phản và font pairings. |
| **Trải nghiệm Người dùng (UX)** | Tra cứu quy chuẩn micro-interactions, 5 trạng thái component (Loading, Empty, Error, Success, Skeleton), và form/table ergonomics. |
| **Biểu đồ & Data Visualization** | Tra cứu loại biểu đồ (Chart types) phù hợp với loại dữ liệu cần trực quan hóa. |
| **Accessibility (a11y) & Audit** | Đối chiếu checklist tương thích thiết bị, độ tương phản màu WCAG AA và phím điều hướng. |

---

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

---

### 3. Responsive & Accessibility (a11y)
- Kiểm tra hiển thị tương thích tốt trên cả Mobile, Tablet và Desktop.
- Đảm bảo các phần tử tương tác có thể điều khiển bằng bàn phím (Keyboard operable) và hiển thị rõ trạng thái Focus.
- Các nút chỉ chứa icon (Icon-only buttons) BẮT BUỘC phải có `Tooltip` hoặc thuộc tính `aria-label`.

