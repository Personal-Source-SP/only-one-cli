# Refine & Custom API Hooks Reference

Tài liệu hướng dẫn chi tiết về bộ custom API hooks tại `@/hooks/api` (dựa trên Refine Framework & Ant Design) phục vụ tương tác dữ liệu, bảng, forms, và mutations trong hệ thống Portal.

---

## 1. `useCustomTable` (Bảng dữ liệu & Phân trang)

Hook khởi tạo props cho Antd Table, tự động quản lý pagination, sorters, search debouncing và notification.

- **Import**: `import { useCustomTable } from "@/hooks";`
- **Generics**: `useCustomTable<TData>`
- **Options chính**:
  - `resource`: Đường dẫn API endpoint (VD: `API_ENDPOINT.WASH_MODES.BASE`).
  - `pagination`: Cấu hình phân trang (`pageSize`, `currentPage`, hoặc `{ mode: "off" }` nếu tắt phân trang).
  - `sorters`: Cấu hình sắp xếp mặc định (`{ initial: [{ field: "position", order: "asc" }] }`).
  - `rowKey`: Khóa định danh dòng (mặc định lấy `id`, hoặc truyền function/property name).
- **Return Values**:
  - `tableProps`: Gắn trực tiếp vào `<ListTable tableProps={tableProps} />` (đã gồm `onChange`, `rowKey`).
  - `tableQuery`: Object query (chứa `isLoading`, `error`, `refetch`, `data`).
  - `debouncedSearch(value)`: Hàm tìm kiếm có debounce (truyền vào `onChange` của Filter Input).
  - `setFilters(filters)`: Hàm cập nhật bộ lọc linh hoạt.
  - `setCurrentPage(page)`: Hàm thay đổi trang hiện tại.

```tsx
const {
  tableProps,
  tableQuery,
  debouncedSearch,
  setFilters,
  setCurrentPage,
} = useCustomTable<WashMode>({
  pagination: { mode: "off" },
  resource: API_ENDPOINT.WASH_MODES.BASE,
});
```

---

## 2. `useCustomDrawerForm` (Form Drawer Thêm mới / Chỉnh sửa)

Hook điều phối Drawer chứa Form nhập liệu, tự động fetch data khi Edit, biến đổi dữ liệu đầu vào/đầu ra và tự động refetch bảng sau khi lưu.

- **Import**: `import { useCustomDrawerForm } from "@/hooks";`
- **Generics**: `useCustomDrawerForm<TQueryFnData, TVariables, TData>`
- **Options chính**:
  - `action`: Hành động form (`"create"` | `"edit"` | `"clone"`).
  - `resource`: Đường dẫn API endpoint.
  - `onMutationSuccess`: Callback sau khi lưu thành công (thường dùng `async () => { await tableQuery.refetch(); }`).
  - `initialValuesMapper(data)`: Function biến đổi dữ liệu API fetch về thành giá trị khởi tạo của Form (VD: đổi giây -> phút).
  - `onFinish(values)`: Function biến đổi giá trị từ Form trước khi gửi API (VD: đổi phút -> giây).
- **Return Values**:
  - `drawerProps`: Gắn vào Antd Drawer (`visible`, `onClose`).
  - `formProps`: Gắn vào Form (`form`, `onFinish`).
  - `show(id?)`: Hàm mở Drawer (truyền `id` khi edit).
  - `close()`: Hàm đóng Drawer.
  - `mode`: Hành động hiện tại (`"create"` hoặc `"edit"`).

```tsx
const editDrawerForm = useCustomDrawerForm<WashMode, WashModeFormValues, WashMode>({
  action: "edit",
  resource: API_ENDPOINT.WASH_MODES.BASE,
  onMutationSuccess: async () => {
    await tableQuery.refetch();
  },
  initialValuesMapper: (washMode) => ({
    estimatedDurationSec: convertSecondsToMinutes(washMode.estimatedDurationSec),
  }),
  onFinish: (values) => ({
    ...values,
    estimatedDurationSec: convertMinutesToSeconds(values.estimatedDurationSec),
  }),
});
```

---

## 3. `useCustomModalForm` (Form Modal Thêm mới / Chỉnh sửa)

Tương tự `useCustomDrawerForm` nhưng dùng cho giao diện dạng ModalDialog.

- **Import**: `import { useCustomModalForm } from "@/hooks";`
- **Generics**: `useCustomModalForm<TQueryFnData, TVariables, TData>`
- **Options & Return Values**: `modalProps`, `formProps`, `show(id?)`, `close()`, `onFinish`, `initialValuesMapper`.

---

## 4. `useCustomSelect` (Dropdown Select Options Loader)

Hook tự động tải danh sách từ API resource và chuyển đổi thành mảng `SelectOption[]` phục vụ `<Select>` hoặc `<CustomSelectInput>`.

- **Import**: `import { useCustomSelect } from "@/hooks";`
- **Options**: `resource`, `optionLabel`, `optionValue`, `filters`, `sorters`.
- **Return Values**: `options`, `selectProps`, `queryResult`.

```tsx
const { options: stationOptions } = useCustomSelect<DeviceStation>({
  resource: API_ENDPOINT.STATIONS.BASE,
  optionLabel: "name",
  optionValue: "id",
});
```

---

## 5. `useCustomData` & `useCustomMutationData` (Custom Requests)

Dùng cho các endpoint API tùy biến không thuộc chuẩn REST CRUD của Refine.

- **`useCustomData`** (GET Query):
  ```tsx
  const { data, isLoading } = useCustomData<MyData>({
    url: `${API_ENDPOINT.CUSTOM}/stats`,
    method: "get",
  });
  ```
- **`useCustomMutationData`** (POST/PUT/PATCH/DELETE Mutation):
  ```tsx
  const { mutate, isLoading } = useCustomMutationData<TData, TVariables>();
  // Gọi mutation:
  mutate({
    url: `${API_ENDPOINT.DEVICES.BASE}/${id}/rotate-secret`,
    method: "post",
    values: {},
  });
  ```

---

## 6. `useCustomOne`, `useCustomList`, `useCustomDelete`

- **`useCustomOne`**: Query 1 record chi tiết theo ID.
- **`useCustomList`**: Query danh sách records với filters/sorters custom.
- **`useCustomDelete`**: Mutation thực hiện xóa 1 hoặc nhiều records.

---

## Quy chuẩn dùng Hooks trong Code

- ✅ **Bắt buộc dùng Custom Hooks**: Không viết `axios` / `fetch` thủ công trong UI components.
- ✅ **Gom nhóm Hooks**: Khai báo các hooks ở phần **State & Hooks** trong component theo đúng thứ tự độ dài dòng từ ngắn đến dài.
- ✅ **Debug-friendly Return**: Lưu kết quả trả về từ hook hoặc data mapper vào biến trước khi `return`.
