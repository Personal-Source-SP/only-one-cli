# App Router vs Pages Router Reference

## Quy chuẩn Router & Data Fetching trong Next.js

### 1. Phân biệt App Router & Pages Router
- **App Router (`src/app/`)**: Mặc định là React Server Components (RSC). Chỉ thêm `'use client'` cho các components có state (`useState`), hooks (`useEffect`, custom hooks), browser APIs hoặc event handlers (`onClick`).
- **Pages Router (`src/pages/`)**: Sử dụng `getServerSideProps`, `getStaticProps`, hoặc client-side data fetching (như Refine Hooks / React Query).

### 2. Ranh giới Client & Server
- **Không bao giờ** import code server-only hoặc expose API keys / credentials bí mật vào Client bundles.
- Định nghĩa rõ ràng các trạng thái `Loading`, `Error`, `NotFound` và `Empty` theo chuẩn Next.js.
