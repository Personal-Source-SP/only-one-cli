---
name: only-one-nextjs-development
description: MUST use when creating, modifying, reviewing, or refactoring Frontend Pages, Components, Refine Hooks, React State, Forms, Types, Utils, Router, UI/UX, or Runtime Dev Loops in Next.js / React applications. The agent MUST read this skill and selectively load ONLY relevant reference docs based on task type.
---

# Master Next.js / Frontend Development Skill (Central Coordinator)

## Directives for Context Efficiency (Lazy Loading Rules)

⚠️ **QUAN TRỌNG VỀ TIẾT KIỆM TOKEN**: Agent KHÔNG ĐỌC TOÀN BỘ CÁC FILE REFERENCE CÙNG LÚC.
Chỉ dùng `view_file` để đọc **đúng file reference** tương ứng với nhiệm vụ/component đang làm việc dựa theo bảng điều hướng dưới đây.

### Master Reference Routing Matrix (Bảng Điều Hướng Trung Tâm)

| Nhiệm vụ / Component đang thực hiện | File Reference duy nhất cần đọc (`view_file`) |
| :--- | :--- |
| **Trang chính (Feature Page `index.tsx`) / Layout / Feature Flow** | [references/page-architecture.md](references/page-architecture.md) |
| **Component UI / Sub-components / Form Drawers / Modals** | [references/component-architecture.md](references/component-architecture.md) |
| **Data Fetching / Refine Hooks (`useCustomTable`, `useCustomDrawerForm`)** | [references/refine-hooks.md](references/refine-hooks.md) |
| **Types / Interfaces / FormValues / Barrel Exports (`index.ts`)** | [references/types-and-contracts.md](references/types-and-contracts.md) |
| **Utils / Converters / Lodash & Dayjs Timezone** | [references/utils-and-helpers.md](references/utils-and-helpers.md) |
| **i18n Translations (`useTranslation`) & Constants** | [references/i18n-and-constants.md](references/i18n-and-constants.md) |
| **Next.js Router (App Router vs Pages Router, RSC/Client Boundary)** | [references/app-and-pages-router.md](references/app-and-pages-router.md) |
| **React State, Hooks (`useMemo`, `useCallback`, `useEffect`), Async UI** | [references/react-state-and-hooks.md](references/react-state-and-hooks.md) |
| **UI/UX Design, Accessibility, Styling, Ant Design & Skill `ui-ux-pro-max`** | [references/ui-ux-guidelines.md](references/ui-ux-guidelines.md) |
| **Runtime Browser Verification & Debugging Dev Loop** | [references/next-runtime-dev-loop.md](references/next-runtime-dev-loop.md) |
| **Next.js Caching, Performance & Partial Prefetching** | [references/next-cache-and-performance.md](references/next-cache-and-performance.md) |
| **Review Code theo nghiệp vụ (BA/Product Review) / Quality Audit** | [references/code-review-guidelines.md](references/code-review-guidelines.md) |

---

## Quick Workflow, Sáng Tạo & Phản Biện (Conflict Resolution)

💡 **Triết lý Bộ Skill**: Bộ Skill này là **quy chiếu tham chiếu ban đầu (baseline reference)**, KHÔNG PHẢI là quy chuẩn cứng nhắc áp đặt ở đầu ra. Agent được **khuyến khích chủ động đề xuất giải pháp mới, tối ưu UI/UX hơn** dựa trên ngữ cảnh thực tế của bài toán.

1. **Tra cứu Quy chuẩn Ban đầu**:
   - Tra bảng điều hướng ở trên và chỉ mở 1-2 file reference tương ứng với component đang thực hiện.

2. **Quy tắc Return bằng biến (Debug-friendly Return)**:
   - BẮT BUỘC gán giá trị hoặc kết quả xử lý vào một biến rõ nghĩa trước khi `return` (ví dụ: `const columns = useMemo(...); return columns;`).
   - ❌ **Không** `return` trực tiếp biểu thức JSX/Function/Hook lồng phức tạp trên cùng một dòng.

3. **Cơ chế Phản Biện & Trao Đổi (Agent Reflection)**:
   - Sau khi đọc file reference, nếu Agent nghĩ ra giải pháp mới tối ưu hơn hoặc phát hiện mâu thuẫn giữa quy chuẩn với codebase hiện tại, Agent **ĐƯỢC KHUYẾN KHÍCH PHẢN BIỆN** và trao đổi qua Skill [grill-me](../grill-me/SKILL.md) để chốt hướng đi với người dùng.
