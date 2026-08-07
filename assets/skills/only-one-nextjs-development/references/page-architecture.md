# Page Feature Architecture

## Cấu trúc chuẩn của một Feature Page

Mỗi Feature Page (ví dụ `src/pages/<feature>/`) bắt buộc tuân thủ cấu trúc thư mục tự đóng gói:

```text
src/pages/<feature>/
├── index.tsx              # Main Page component (ListWrapper, ListTable, FormDrawers, TableProps, Filters)
├── components/            # Sub-components dùng riêng cho page (FormDrawer, Modals, Details,...)
│   └── index.ts           # Barrel export tất cả sub-components
├── constants.ts           # Hằng số page (Column widths, index keys, default values, drawer titles)
├── enums/                 # Feature enums
│   └── index.ts           # Barrel export
├── types/                 # Interface & Type definitions (Data model, FormValues, Params)
│   └── index.ts           # Barrel export
└── utils/                 # Pure helper functions (Converters, Formatters, Parsers)
    └── index.ts           # Barrel export
```

## Quy chuẩn trong `index.tsx` (Main Page Component)

### 1. Thứ tự Imports
Imports sắp xếp theo 3 nhóm rõ ràng (mỗi nhóm cách 1 dòng trống):
1. Thư viện bên ngoài (React, Ant Design, Icons, i18next,...).
2. Components/Hooks/Utils dùng chung dự án (`@/components`, `@/hooks`, `@/utilities`, `@/enums`, `@/config`).
3. File cục bộ của trang (`./components`, `./constants`, `./enums`, `./types`, `./utils`).

### 2. Thứ tự & Quy tắc Khai báo trong Component
Tất cả khai báo trong `.tsx` BẮT BUỘC tuân theo thứ tự nhóm vai trò:

$$\text{Constants} \rightarrow \text{State \& Hooks} \rightarrow \text{Memos (useMemo)} \rightarrow \text{Effects (useEffect)} \rightarrow \text{Callbacks (useCallback)} \rightarrow \text{JSX (Return)}$$

- **Quy tắc độ dài dòng code**: Trong từng nhóm vai trò, các dòng khai báo phải được **sắp xếp theo độ dài từ ngắn đến dài** (tính theo số ký tự trên dòng).
- **Ngăn cách nhóm**: Ngăn cách giữa các nhóm bằng **đúng một dòng trống**.
- **Kích thước file**: Mỗi file component tối đa **200 dòng**. Tách nhỏ sub-components khi vượt quá.
- **Kiểm tra mảng rỗng**: Đồng bộ cách kiểm tra mảng rỗng bằng `!list?.length` trên toàn bộ dự án.

### 3. Layout Pattern & Component Composition (Tùy chọn theo dự án)

> [!NOTE]
> Các pattern dưới đây áp dụng khi codebase có hỗ trợ **Refine Framework** và các Portal common components (`ListWrapper`, `ListTable`, `useCustomTable`, `useCustomDrawerForm`). Với các dự án Next.js / React khác không dùng Refine, linh hoạt áp dụng pattern data-fetching & layout sẵn có của dự án đó.

- ✅ **ListWrapper & ListTable Pattern (Khi codebase hỗ trợ)**:
  - Quản lý danh sách sử dụng `<ListWrapper>` bọc layout (actions, filters, error, resource, isLoading, permissionGroup).
  - Sử dụng `<ListTable>` hiển thị bảng với `columns`, `tableProps`, `tableQuery`, `permissionGroup`, `deleteResource`, `onEdit`.
- ✅ **Refine Hooks Wiring (Khi codebase hỗ trợ)**:
  - `useCustomTable`: Quản lý phân trang, bộ lọc API và debounce search.
  - `useCustomDrawerForm`: Tách riêng 2 instance cho `createDrawerForm` (`action: "create"`) và `editDrawerForm` (`action: "edit"`). Đăng ký `onMutationSuccess` gọi `await tableQuery.refetch()`.
- ✅ **Return bằng biến cụ thể (Debug-friendly Return)**:
  - BẮT BUỘC lưu các cấu hình (`actions`, `filters`, `columns`) hoặc JSX element vào biến rõ nghĩa trước khi `return`.
  - Return JSX bọc trong React Fragment `<> ... </>`.
