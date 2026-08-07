# Next.js Caching & Performance Reference

## Quy chuẩn Cache & Tối ưu Hiệu năng

### 1. Caching & Freshness Strategy
- Hiểu rõ cơ chế Caching của Next.js (Router Cache, Full Route Cache, Data Cache).
- Chỉ cấu hình `"use cache"` hoặc `revalidate` cho các dữ liệu ít biến động.

### 2. Prefetching & Dynamic Boundaries
- Sử dụng `<Suspense>` bọc các phần tử bất đồng bộ để không làm nghẽn toàn bộ trang.
- Tránh đọc request data trực tiếp trong các phạm vi static render không phù hợp.
