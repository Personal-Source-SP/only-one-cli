# Component Architecture

## Quy chuẩn Thiết Kế UI & Sub-components

- ✅ **Tái sử dụng Common Components (`src/components`)**:
  - BẮT BUỘC ưu tiên khảo sát và tái sử dụng các common components có sẵn tại `@/components` (`ListWrapper`, `ListTable`, `FilterPanel`, `CardAction`, `CustomDrawerForm`, `CustomInputForm`, `CustomSelectInput`, `CustomModal`, `UploadImage`,...) thay vì tự code lại thủ công.
- ✅ **Form Drawer Component Pattern (`<CustomDrawerForm>`)**:
  - Nhận prop `drawerForm` (từ `useCustomDrawerForm`).
  - Dùng `<CustomDrawerForm>` làm wrapper chính với `createInitialValues`.
  - Dùng `<CustomInputForm>` (hỗ trợ `type="text" | "number" | "html" | ...`) cho các trường nhập liệu.
  - Dùng `<CustomSelectInput>` cho các trường dropdown (kết hợp `selectProps={{ showSearch: true, options }}`).
  - Quy định rules xác thực bằng `FormRuleType` enum từ `@/utilities` (ví dụ: `type: FormRuleType.Required`).
- ✅ **Cấu trúc Component (Đơn giản vs Phức tạp)**:
  - **Component Đơn giản**: Viết trong **1 file `.tsx` đơn lẻ** (ví dụ: `components/ModeFormDrawer.tsx`). Giới hạn tối đa **200 dòng/file**.
  - **Component Phức tạp**: Tách thành **một thư mục riêng** (ví dụ: `components/ModeFormDrawer/`) chứa file chính `index.tsx` cùng với các sub-components con bên trong (`ModeFormBasic.tsx`, `ModeFormAdvanced.tsx`,...).
  - Tất cả sub-components re-export tập trung qua `components/index.ts`.
- ✅ **Semantic HTML & List Keys**:
  - Sử dụng các thẻ HTML5 ngữ nghĩa (`<section>`, `<article>`, `<header>`), hạn chế lạm dụng thẻ `<div>`.
  - BẮT BUỘC truyền thuộc tính `key` cho mọi phần tử lặp trong danh sách `.map()`.
- ✅ **Design System & Styling**:
  - Tái sử dụng Ant Design components (`Button`, `Tag`, `Typography`, `Card`, `Space`).
  - Màu sắc status/boolean dùng constants chung (`ACTIVE_STATUS_COLORS`, `BOOLEAN_TAG_COLORS`).
- ✅ **Return bằng biến cụ thể (Debug-friendly Return)**:
  - BẮT BUỘC lưu các giá trị render (JSX / computed elements) vào biến rõ nghĩa trước khi `return`.
