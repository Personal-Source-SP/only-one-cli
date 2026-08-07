# React State & Hooks Reference

## Quy chuẩn Quản lý State & Component Optimization

### 1. Tổ chức Component `.tsx`
Cấu trúc thứ tự code trong một component file:
1. Imports (thứ tự: React/Next -> Third-party libraries -> Internal components/hooks -> Types/Utils)
2. Constants & Enums
3. Main Component:
   - Hooks (`useTranslation`, Refine hooks, `useState`)
   - `useMemo` (Calculated values, Options, Columns)
   - `useCallback` (Event handlers)
   - `useEffect` (Đồng bộ hệ thống bên ngoài)
   - Return JSX (bọc trong biến hoặc fragment)

### 2. Sử dụng Memos & Hooks đúng cách
- `useMemo`: Chỉ dùng cho các tính toán đắt đỏ hoặc giữ referential stability cho options/columns/filters.
- `useCallback`: Chỉ dùng khi truyền function xuống child components nhạy cảm re-render.
- `useEffect`: Chỉ dùng để synchronize với external systems (subscriptions, timers). Không lạm dụng `useEffect` để tính toán state phụ thuộc.

### 3. Async UI & Recoverability
- Đảm bảo có hiển thị trạng thái `Loading`, `Error`, `Empty` cho các tác vụ bất đồng bộ.
- Bảo toàn dữ liệu đã nhập trong Form khi xảy ra lỗi recoverable.
