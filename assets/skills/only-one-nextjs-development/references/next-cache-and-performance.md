# Next.js Caching & Performance Reference

## Quy chuẩn Cache & Tối ưu Hiệu năng (Next.js 16+)

### 1. Caching & Freshness Strategy
- Hiểu rõ cơ chế Caching của Next.js (Router Cache, Full Route Cache, Data Cache).
- Chỉ cấu hình `"use cache"` hoặc `revalidate` cho các dữ liệu ít biến động.

### 2. Cache Components & PPR (Partial Prefetching) Adoption
- Áp dụng cho ứng dụng Next.js 16.3+ sử dụng App Router.
- Di chuyển các tác vụ đọc request-time vào sau ranh giới `<Suspense>` nhỏ nhất phù hợp.
- Không đọc dữ liệu request trực tiếp bên trong phạm vi `"use cache"` không phù hợp.
- Cấu hình `cacheComponents` và PPR một cách an toàn, giữ nguyên các quy chuẩn dynamic/revalidate quan trọng của từng route.

### 3. Optimization & Instant Navigation
- Tối ưu hóa các route Cache Components nhằm đảm bảo điều hướng tức thì (instant navigation).
- Kiểm tra các ranh giới Static vs Dynamic để tối đa hóa khả năng prerender của ứng dụng.

