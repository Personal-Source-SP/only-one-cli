---
status: done
slug: refactor-dev-skills-standards
started_at: 2026-09-17
completed_at: 2026-09-17
pr_url: ~
branch: ~
---

# Plan: Nâng Cấp & Chuẩn Hóa Toàn Diện Bộ Skills Frontend (Next.js) & Backend (NestJS)

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- **Hiện trạng kiến trúc hằng số Frontend**: `page-architecture.md` hiện tại chỉ định tệp đơn `constants.ts`, nhanh chóng phình to và trở thành bottleneck khi phát triển trang tính năng phức tạp có nhiều cột, form values và options.
- **Hiện trạng định kiểu (Type Contracts) & Component Props**: Cả `types-and-contracts.md` (Next.js) và `service-architecture.md` (NestJS) đều chưa có chế tài cấm triệt để anonymous inline types `{}` và chưa có ví dụ đa tệp (Multi-file) chỉ rõ vị trí đặt type (`types/`). Đồng thời `component-architecture.md` chưa bắt buộc dùng `type` cho Component Props dẫn đến việc dùng `interface` hoặc inline object props tùy tiện.
- **Hiện trạng UI Component Hierarchy**: `ui-ux-guidelines.md` chưa có quy tắc chống lạm dụng thẻ raw HTML (`<div>`, `<button>`, `<span>`) kèm chuỗi class TailwindCSS dài dòng thay vì tái sử dụng Ant Design và `@/components`.
- **Invariants bắt buộc giữ nguyên**:
  - Giữ nguyên cơ chế Lazy Loading (Selective Reference Routing Matrix) trong cả 2 bộ skills để đảm bảo token efficiency.
  - Giữ nguyên quy tắc đặt tên file `.constant.ts`, `.type.ts`, `.service.ts` và mô hình Barrel Export (`index.ts`).
  - Đảm bảo tính tương thích của CI version gate thông qua việc nâng version semver trong `assets/skills/index.ts`.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
*(Kế thừa 100% cơ chế vận hành từ concept.md; tuyệt đối không mô tả lại giải pháp tổng quan)*

- **Type Signatures & Code Contracts**:
  - Không phát sinh model dữ liệu runtime mới; cập nhật các tài liệu Markdown đặc tả chuẩn kiến trúc TypeScript:
    - Modular `constants/` directory structure with `constants/index.ts`.
    - Strict Named Types for all nested object contracts across Frontend `src/pages/<feature>/types/`.
    - Component Props MUST 100% use `type <ComponentName>Props = { ... }` defined immediately above component.
    - Strict Named Service Return/Param Contracts across Backend `src/modules/<feature>/types/`.
    - Strict 3-Tier UI Component Cascade & Anti-Raw-HTML Invariants in `ui-ux-guidelines.md`.
    - Bump asset manifests: `only-one-nestjs-development` (0.0.1 $\rightarrow$ 0.0.2), `only-one-nextjs-development` (0.0.1 $\rightarrow$ 0.0.2).
- **AST Seams & Callers**:
  - `assets/skills/only-one-nextjs-development/references/page-architecture.md`: Cập nhật cây thư mục và quy tắc import `constants/`.
  - `assets/skills/only-one-nextjs-development/references/component-architecture.md`: Bổ sung quy tắc định nghĩa Component Props bằng `type`.
  - `assets/skills/only-one-nextjs-development/references/types-and-contracts.md`: Bổ sung mục Hard Invariant cấm anonymous inline `{}` và chuẩn hóa `type` cho Props.
  - `assets/skills/only-one-nestjs-development/references/service-architecture.md`: Bổ sung mục Hard Invariant cấm anonymous return types và cấm define type trong `.service.ts` kèm multi-file code examples.
  - `assets/skills/only-one-nextjs-development/references/ui-ux-guidelines.md`: Cập nhật bảng và ví dụ Do/Don't cho UI Component Cascade.
  - `assets/skills/only-one-nextjs-development/SKILL.md`: Thêm Mandatory Skill Reading Invariant tại Section 0.
  - `assets/skills/only-one-nestjs-development/SKILL.md`: Thêm Mandatory Skill Reading Invariant tại Section 0.
  - `assets/skills/index.ts`: Cập nhật `version` cho 2 manifest entries.
  - `only-one/rules.md`: Bổ sung các quy tắc âm bản `[ALWAYS]` và `[NEVER]` tương ứng.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
assets/skills/
├── [MODIFY] index.ts                                                     # Bump skill versions to 0.0.2
├── only-one-nestjs-development/
│   ├── [MODIFY] SKILL.md                                                # Add Mandatory Skill Reading Invariant
│   └── references/
│       └── [MODIFY] service-architecture.md                             # Strict return contracts & dedicated types/ location
└── only-one-nextjs-development/
    ├── [MODIFY] SKILL.md                                                # Add Mandatory Skill Reading Invariant
    └── references/
        ├── [MODIFY] page-architecture.md                                # Modular constants/ folder & barrel export
        ├── [MODIFY] component-architecture.md                           # Strict Component Props type standard
        ├── [MODIFY] types-and-contracts.md                              # Ban anonymous inline types & enforce types/ location
        └── [MODIFY] ui-ux-guidelines.md                                 # Strict 3-tier component cascade & Anti-Raw-HTML
only-one/
└── [MODIFY] rules.md                                                    # Add repo negative constraints for skills & type locations
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nextjs-development/references/page-architecture.md` | `Feature Page Directory Structure` | `None` | `git diff assets/skills/only-one-nextjs-development/references/page-architecture.md` |
| **2** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nextjs-development/references/component-architecture.md` | `Component Props Type Definition Standard` | `None` | `git diff assets/skills/only-one-nextjs-development/references/component-architecture.md` |
| **3** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nextjs-development/references/types-and-contracts.md` | `Type and Interface Design Standards` | `None` | `git diff assets/skills/only-one-nextjs-development/references/types-and-contracts.md` |
| **4** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nestjs-development/references/service-architecture.md` | `Guidelines & Rules` | `None` | `git diff assets/skills/only-one-nestjs-development/references/service-architecture.md` |
| **5** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nextjs-development/references/ui-ux-guidelines.md` | `Component & Styling Priority Cascade` | `None` | `git diff assets/skills/only-one-nextjs-development/references/ui-ux-guidelines.md` |
| **6** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nextjs-development/SKILL.md` | `0. Mandatory Reuse-First Invariant` | `Order 1, 2, 3, 5` | `git diff assets/skills/only-one-nextjs-development/SKILL.md` |
| **7** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nestjs-development/SKILL.md` | `0. Mandatory Reuse-First Invariant` | `Order 4` | `git diff assets/skills/only-one-nestjs-development/SKILL.md` |
| **8** | `[x]` | `[MODIFY]` | `assets/skills/index.ts` | `SKILLS` manifest versions | `Order 6, 7` | `git diff assets/skills/index.ts` |
| **9** | `[x]` | `[MODIFY]` | `only-one/rules.md` | `Repository Negative Rules & Constraints` | `Order 1-8` | `git diff only-one/rules.md` |


## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `assets/skills/only-one-nextjs-development/references/page-architecture.md`
> **Action**: Thay thế tệp đơn `constants.ts` bằng thư mục `constants/` kèm các tệp con và barrel export `index.ts`.

```diff
@@ -14,1 +14,5 @@
-├── constants.ts           # Page constants (Column widths, index keys, default values, drawer titles)
+├── constants/             # Page constants modular directory (Columns, filters, form configs, table limits)
+│   ├── columns.constant.ts # Table columns configuration & custom cell rendering helpers
+│   ├── filter.constant.ts  # Default filter values & static select options
+│   ├── form.constant.ts    # Drawer/modal form initial values & validation rules
+│   └── index.ts            # Barrel export for all page constants
```

### 2. `[MODIFY]` `assets/skills/only-one-nextjs-development/references/component-architecture.md`
> **Action**: Bổ sung quy tắc bắt buộc 100% Component Props phải sử dụng `type` alias với hậu tố `Props`.

```diff
@@ -3,3 +3,24 @@
 ## UI Component & Sub-Component Design Standards
 
+- ✅ **Component Props Type Standard**:
+  - ALWAYS define Component Props using a dedicated `type` alias with the `Props` suffix (e.g., `type OrderDetailDrawerProps = { ... }`).
+  - ❌ **NEVER** use `interface` for Component Props.
+  - ❌ **NEVER** use inline destructured type definitions in parameters (e.g., `({ isOpen }: { isOpen: boolean })`).
+  - Place the `type <ComponentName>Props` declaration immediately above the component function definition.
+  - Property ordering: Declare all required props first, followed by optional props (`?`) separated by a single blank line, sorted from shortest to longest line length.
+
+  ```typescript
+  type OrderDetailDrawerProps = {
+    isOpen: boolean;
+    isLoading: boolean;
+    onClose: () => void;
+
+    order?: Order | null;
+  };
+
+  export const OrderDetailDrawer = ({
+    isOpen,
+    isLoading,
+    onClose,
+    order,
+  }: OrderDetailDrawerProps) => { ... };
+  ```
+
 - ✅ **Leverage Common Components (`src/components`)**:
```

### 3. `[MODIFY]` `assets/skills/only-one-nextjs-development/references/types-and-contracts.md`
> **Action**: Bổ sung quy tắc cấm 100% anonymous inline object types, chuẩn hóa Component Props `type`, bắt buộc tách named type độc lập trong `types/`.

```diff
@@ -6,3 +6,52 @@
 - ✅ **Location & Barrel Exports**:
   - Encapsulate type definitions inside the `types/` folder of the feature and re-export via `types/index.ts`.
   - All supporting subdirectories (`types/`, `enums/`, `components/`, `utils/`) MUST provide an `index.ts` barrel.
   - Consumers import directly from directory barrels: `import type { WashMode, WashModeFormValues } from "./types"`.
+  - ❌ **NEVER** declare domain/entity/form `type` or `interface` definitions directly inside `index.tsx`, `components/`, or `hooks/` files (only `type <ComponentName>Props` is allowed directly inside component files).
+
+- 🛑 **Zero Anonymous Inline Types Invariant (Anti-Inline-Object)**:
+  - ❌ **NEVER** define nested anonymous object shapes `{}` directly within parent types or interfaces.
+  - Every nested property representing a structured object MUST be extracted into a dedicated **Named Type / Interface** inside `types/<name>.type.ts` and re-exported via `types/index.ts`.
+
+  ```typescript
+  // ❌ ANTI-PATTERN (DON'T): Anonymous inline object shape
+  // File: src/pages/product/types/product.type.ts
+  export type ProductDetail = AbstractRecord & {
+    name: string;
+    pricing: {
+      basePrice: number;
+      discountPercent?: number;
+    };
+  };
+  ```
+
+  ```typescript
+  // ✅ STANDARD MULTI-FILE PATTERN (DO):
+
+  // File: src/pages/product/types/product-pricing.type.ts
+  export type ProductPricingConfig = {
+    basePrice: number;
+    discountPercent?: number;
+  };
+
+  // File: src/pages/product/types/product-detail.type.ts
+  import type { AbstractRecord } from "@/common";
+  import type { ProductPricingConfig } from "./product-pricing.type";
+
+  export type ProductDetail = AbstractRecord & {
+    name: string;
+    pricing: ProductPricingConfig;
+  };
+
+  // File: src/pages/product/types/index.ts
+  export * from "./product-pricing.type";
+  export * from "./product-detail.type";
+  ```
+
+- ✅ **Component Props Typing Convention**:
+  - Component Props MUST always be typed using `type <ComponentName>Props = { ... }`. Never use `interface` for component props.
```

### 4. `[MODIFY]` `assets/skills/only-one-nestjs-development/references/service-architecture.md`
> **Action**: Cấm 100% anonymous return types trên service methods, cấm define type trong `.service.ts`, bắt buộc đặt type trong `src/modules/<feature>/types/`.

```diff
@@ -71,4 +71,49 @@
 - ✅ **Parameters & Type Contracts**:
   - Complex object parameters containing **3 or more properties** MUST be modeled as dedicated interfaces inside the `types/` folder, avoiding inline object types or ambiguous `Record<string, unknown>`.
-  - Do not define `interface` or `type` declarations directly inside the service file.
+  - ❌ **NEVER** declare `interface` or `type` definitions directly inside the `.service.ts` file.
+  - ❌ **NEVER** return anonymous inline object types (e.g., `Promise<{ order: OrderEntity; payment: PaymentTransactionEntity } | null>`) from any method (`public`, `protected`, `private`, or internal helper).
+  - ALL method return types, complex parameters, and intermediate structures MUST be explicitly modeled as Named Types / Interfaces inside `src/modules/<feature>/types/` and exported via `types/index.ts`.
+
+  ```typescript
+  // ❌ ANTI-PATTERN (DON'T): Anonymous inline return shape or declaring type in service file
+  // File: src/modules/order/services/guest-order.service.ts
+
+  // ❌ NEVER declare types inside service files!
+  type OpenCheckoutResult = { order: OrderEntity; payment: PaymentTransactionEntity };
+
+  @Injectable()
+  export class GuestOrderService extends BaseService<OrderEntity> {
+    // ❌ NEVER use anonymous inline object return shapes!
+    private async _findOwnOpenCheckout(deviceId: string): Promise<{
+      order: OrderEntity;
+      payment: PaymentTransactionEntity;
+    } | null> {
+      // ...
+    }
+  }
+  ```
+
+  ```typescript
+  // ✅ STANDARD MULTI-FILE ARCHITECTURE PATTERN (DO):
+
+  // 1. File: src/modules/order/types/checkout-result.type.ts
+  import type { OrderEntity } from "../entities/order.entity";
+  import type { PaymentTransactionEntity } from "../entities/payment-transaction.entity";
+
+  export type OpenCheckoutResult = {
+    order: OrderEntity;
+    payment: PaymentTransactionEntity;
+  };
+
+  // 2. File: src/modules/order/types/index.ts
+  export * from "./checkout-result.type";
+
+  // 3. File: src/modules/order/services/guest-order.service.ts
+  import { Injectable } from "@nestjs/common";
+  import { BaseService } from "@/common/base.service";
+  import { OrderEntity } from "../entities";
+  import type { OpenCheckoutResult } from "../types";
+
+  @Injectable()
+  export class GuestOrderService extends BaseService<OrderEntity> {
+    private async _findOwnOpenCheckout(deviceId: string): Promise<OpenCheckoutResult | null> {
+      const result = await this._orderRepository.findOne({ deviceId, status: OrderStatus.OPEN });
+      if (!result) {
+        return null;
+      }
+      return { order: result, payment: result.paymentTransaction };
+    }
+  }
+  ```
```

### 5. `[MODIFY]` `assets/skills/only-one-nextjs-development/references/ui-ux-guidelines.md`
> **Action**: Siết chặt quy tắc 3-tier component cascade, cấm viết raw HTML thay thế Ant Design / Shared components kèm ví dụ Do/Don't.

```diff
@@ -20,11 +20,44 @@
 Strictly adhere to the 3-tier component hierarchy during UI implementation:
 
-$$\text{1. Common Components (@/components)} \longrightarrow \text{2. Ant Design (@/antd)} \longrightarrow \text{3. TailwindCSS}$$
+$$\text{1. Common Components (@/components)} \longrightarrow \text{2. Ant Design (antd)} \longrightarrow \text{3. TailwindCSS (Layout Spacing Only)}$$
 
 1. **Tier 1 (Highest Priority — `@/components`)**:
    - Audit and reuse prebuilt shared components encapsulated in `src/components/` (`ListWrapper`, `ListTable`, `FilterPanel`, `CardAction`, `CustomDrawerForm`, `CustomInputForm`, `CustomSelectInput`, `CustomModal`, `UploadImage`).
 2. **Tier 2 (Secondary Priority — Ant Design `antd`)**:
-   - If `@/components` does not provide an exact wrapper, use standard primitives from Ant Design (`Button`, `Table`, `Tag`, `Typography`, `Card`, `Space`, `Drawer`, `Modal`, `Form`, `Input`, `Select`, `Badge`).
+   - If `@/components` does not provide an exact wrapper, use standard primitives and compound components from Ant Design (`Button`, `Table`, `Tag`, `Typography`, `Card`, `Space`, `Flex`, `Row`, `Col`, `Drawer`, `Modal`, `Form`, `Input`, `Select`, `Badge`, `Divider`, `Tooltip`).
 3. **Tier 3 (Tertiary Priority — TailwindCSS for Layout Spacing Only)**:
-   - Use TailwindCSS strictly for layout composition (Flexbox, Grid, spacing gap/margin/padding), responsive breakpoint adjustments, or specialized styling when Tier 1 and Tier 2 primitives require alignment.
+   - Use TailwindCSS strictly for layout composition (Flexbox, Grid, spacing gap/margin/padding) or responsive breakpoint adjustments when Tier 1 and Tier 2 primitives require outer wrapper alignment.
+
+🛑 **Anti-Raw-HTML Invariant**:
+- ❌ **NEVER** write raw HTML elements (`<div>`, `<span>`, `<button>`, `<input>`) combined with long TailwindCSS utility strings when an equivalent Ant Design component exists.
+- ❌ **NEVER** handcraft buttons, card containers, badge tags, or typography headings using raw HTML + TailwindCSS classes.
+
+```tsx
+// ❌ ANTI-PATTERN (DON'T): Handcrafted raw HTML + TailwindCSS replacing standard components
+<div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
+  <span className="text-sm font-semibold text-gray-800">Cấu hình tính năng</span>
+  <button
+    type="button"
+    onClick={handleSave}
+    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
+  >
+    Lưu thay đổi
+  </button>
+</div>
+```
+
+```tsx
+// ✅ STANDARD PATTERN (DO): Leverage Ant Design Card, Flex, Typography, and Button
+<Card size="small">
+  <Flex align="center" justify="space-between">
+    <Typography.Text strong>Cấu hình tính năng</Typography.Text>
+    <Button type="primary" onClick={handleSave}>
+      Lưu thay đổi
+    </Button>
+  </Flex>
+</Card>
+```
```

### 6. `[MODIFY]` `assets/skills/only-one-nextjs-development/SKILL.md`
> **Action**: Thêm điều khoản bắt buộc đọc kỹ skill và reference docs trước khi viết code Frontend.

```diff
@@ -8,3 +8,7 @@
 ## 0. Mandatory Reuse-First Invariant (Anti-Reinvention Rules)
 
+> [!IMPORTANT]
+> **MANDATORY SKILL READING & COMPLIANCE GATE**:
+> Before writing, generating, or modifying any Next.js / React frontend code, the Agent MUST inspect this skill file and selectively read (`view_file`) the dedicated reference doc (`references/*.md`) corresponding to the active task. Writing frontend code without checking the matching architectural reference is STRICTLY PROHIBITED.
+>
 > [!IMPORTANT]
```

### 7. `[MODIFY]` `assets/skills/only-one-nestjs-development/SKILL.md`
> **Action**: Thêm điều khoản bắt buộc đọc kỹ skill và reference docs trước khi viết code Backend.

```diff
@@ -8,3 +8,7 @@
 ## 0. Mandatory Reuse-First Invariant (Anti-Reinvention Rules)
 
+> [!IMPORTANT]
+> **MANDATORY SKILL READING & COMPLIANCE GATE**:
+> Before writing, generating, or modifying any NestJS backend code (Controllers, Services, DTOs, Entities, Mappers, Tests), the Agent MUST inspect this skill file and selectively read (`view_file`) the dedicated reference doc (`references/*.md`) corresponding to the active task. Writing backend code without checking the matching architectural reference is STRICTLY PROHIBITED.
+>
 > [!IMPORTANT]
```

### 8. `[MODIFY]` `assets/skills/index.ts`
> **Action**: Nâng phiên bản `version` lên `0.0.2` cho cả 2 skill `only-one-nestjs-development` và `only-one-nextjs-development`.

```diff
@@ -213,2 +213,2 @@
         name: 'only-one-nestjs-development',
-        version: '0.0.1',
+        version: '0.0.2',
@@ -219,2 +219,2 @@
         name: 'only-one-nextjs-development',
-        version: '0.0.1',
+        version: '0.0.2',
```

### 9. `[MODIFY]` `only-one/rules.md`
> **Action**: Thêm các quy tắc âm bản `[ALWAYS]` và `[NEVER]` về bắt buộc đọc skill, vị trí định nghĩa type, chuẩn hóa `type` cho Component Props, cấm anonymous inline return types và cấm lạm dụng raw HTML.

```diff
@@ -24,0 +24,5 @@
+- **[ALWAYS]** Khi thực hiện các tác vụ code Frontend (Next.js/React) hoặc Backend (NestJS), Agent BẮT BUỘC PHẢI nạp và đọc kỹ tài liệu kỹ năng tương ứng (`only-one-nextjs-development` hoặc `only-one-nestjs-development`) cùng các tài liệu tham chiếu (`references/*.md`) trước khi sinh mã.
+- **[ALWAYS]** Khai báo props của React Component bằng `type <ComponentName>Props = { ... }` đặt ngay phía trên component. Tuyệt đối không dùng `interface` cho Component Props.
+- **[NEVER]** Không định nghĩa `interface` hoặc `type` trực tiếp trong tệp `.service.ts` hoặc các component `.tsx` (ngoại trừ `type Props` của chính component đó). Toàn bộ domain type contract phải được định nghĩa trong thư mục `types/` của feature và re-export qua `types/index.ts`.
+- **[NEVER]** Không trả về anonymous inline object types (ví dụ: `Promise<{ order: OrderEntity; payment: PaymentTransactionEntity } | null>`) trên bất kỳ phương thức nào của Service hoặc sử dụng anonymous inline `{}` lồng trong interface cha ở Frontend.
+- **[NEVER]** Không viết thẻ HTML thô (`<div>`, `<button>`, `<span>`) nối chuỗi TailwindCSS để tái tạo lại các thành phần giao diện đã được hỗ trợ bởi Ant Design (`Card`, `Flex`, `Space`, `Typography`, `Button`, `Tag`) hoặc `@/components`.
```

## Section 5. Test Cases & Verification
- **Automated Tests**:
  - `npm test`: PASS - 55 test files passed, 230 tests passed, 0 failures (duration 8.58s).
  - `npm run build`: PASS - Clean build, all types and files validated.
  - `git status`: PASS - All 9 modified files tracked and verified cleanly.
- **Manual Checks**:
  - `assets/skills/index.ts`: Đã nâng version `0.0.2` cho `only-one-nestjs-development` và `only-one-nextjs-development`.
  - Toàn bộ tài liệu tham chiếu markdown đã được đối soát chính xác theo các yêu cầu kiến trúc.

