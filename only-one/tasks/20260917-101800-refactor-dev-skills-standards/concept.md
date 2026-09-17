# Concept: Nâng Cấp & Chuẩn Hóa Toàn Diện Bộ Skills Frontend (Next.js) & Backend (NestJS)

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Trong quá trình phát triển tính năng mới, tái cấu trúc mã nguồn hoặc sinh code tự động, Agent thường xuyên vi phạm các nguyên tắc thiết kế sạch (Clean Code), định kiểu lỏng lẻo, dùng `interface` lẫn lộn với `type` cho component props và lạm dụng viết mã thủ công.
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  1. *Cấu trúc hằng số phân mảnh/thiếu mở rộng*: `page-architecture.md` vẫn mô tả hằng số cấp trang dưới dạng một tệp đơn lẻ `constants.ts`, nhanh chóng phình to và khó quản lý khi số lượng hằng số cột, form, bộ lọc gia tăng.
  2. *Định kiểu lồng ẩn danh (Anonymous Inline Types) trong Frontend*: Nhiều interface/type chứa các object con dạng `{ field1: string; field2: number }` viết trực tiếp trong type cha mà không được tách thành named interface/type độc lập trong thư mục `types/`, gây khó khăn cho việc tái sử dụng, mocking và test.
  3. *Không nhất quán trong khai báo Component Props*: Thiếu quy chuẩn bắt buộc dùng `type` cho Props của React Component, dẫn đến việc dùng `interface` hoặc inline props `({ isOpen, isLoading }: { isOpen: boolean... })` gây rối mắt và thiếu đồng nhất.
  4. *Hàm nghiệp vụ trả về anonymous object shape hoặc define type trực tiếp trong Service file (Backend)*: Các private/internal helper method trong Service tầng NestJS trả về dạng `Promise<{ order: OrderEntity; payment: PaymentTransactionEntity } | null>`, hoặc Agent tự ý khai báo `interface`/`type` trực tiếp ngay trong tệp `.service.ts`, vi phạm quy tắc đóng gói type contracts và phân tách trách nhiệm kiến trúc.
  5. *Lạm dụng Raw HTML + TailwindCSS*: Agent có xu hướng viết thẻ HTML thô (`<div>`, `<button>`, `<span>`) kèm danh sách class TailwindCSS phức tạp thay vì tái sử dụng bộ UI component có sẵn trong `@/components` hoặc các thành phần chuẩn của Ant Design (`Space`, `Flex`, `Card`, `Typography`, `Tag`, `Button`).
  6. *Thiếu ràng buộc bắt buộc đọc Skills trước khi code*: Agent đôi khi bỏ qua việc nạp và tuân thủ các quy chuẩn kiến trúc từ `only-one-nextjs-development` và `only-one-nestjs-development`, dẫn đến mã nguồn sinh ra bị lệch chuẩn repository.
- **Nguyên nhân cốt lõi (Root Cause)**: Các tài liệu tham chiếu (`references/*.md`) và `SKILL.md` chưa đưa ra quy định cứng (Hard Invariants) kèm ví dụ đa tệp (Multi-file Examples) chỉ rõ vị trí khai báo file (`types/`) và chế tài kiểm soát chặt chẽ đối với các hành vi trên.
- **Tác động (Impact / Blast Radius)**: Gây ô nhiễm mã nguồn, giảm tính nhất quán (consistency), khó bảo trì, tăng nguy cơ lỗi tiềm ẩn do thiếu type an toàn và phá vỡ kiến trúc UI design system.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Nâng cấp toàn diện các tài liệu quy chuẩn kỹ thuật của 2 bộ skills `only-one-nextjs-development` và `only-one-nestjs-development` nhằm triệt tiêu hoàn toàn code ẩn danh, tối ưu hóa cấu trúc thư mục hằng số, chuẩn hóa 100% `type` cho Component Props, siết chặt vị trí khai báo Type/Interface độc lập trong thư mục `types/`, siết chặt thứ bậc sử dụng UI Component và thiết lập invariant bắt buộc đọc skills trước khi viết code.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - **AC-1 (Page Constants Modularization)**: `page-architecture.md` quy định cấu trúc thư mục `constants/` (thay thế tệp đơn `constants.ts`), phân chia thành các tệp chuyên biệt (`columns.constant.ts`, `form.constant.ts`, `table.constant.ts`...) kèm barrel export `constants/index.ts`.
  - **AC-2 (Strict Named Types & No Anonymous Inline Objects in Frontend `types/`)**: `types-and-contracts.md` cấm 100% inline `{}` bên trong interface cha; mọi cấu trúc con lồng nhau bắt buộc phải được khai báo bằng Named Type/Interface độc lập đặt đúng trong thư mục `src/pages/<feature>/types/` và re-export qua `types/index.ts`.
  - **AC-3 (Component Props Type Invariant)**: `component-architecture.md` và `types-and-contracts.md` quy định 100% Component Props PHẢI sử dụng `type <ComponentName>Props = { ... }` (không dùng `interface` hoặc inline props destructured types).
  - **AC-4 (Strict Service Method Return Contracts & Dedicated `types/` Location in Backend)**: `service-architecture.md` cấm 100% anonymous return type trên mọi phương thức (bao gồm private/internal helper methods); nghiêm cấm khai báo `type`/`interface` trực tiếp trong file `.service.ts`; bắt buộc định nghĩa Named Type/Interface trong thư mục `src/modules/<feature>/types/` và re-export qua `types/index.ts`.
  - **AC-5 (Strict UI/UX Component Tier Enforcement)**: `ui-ux-guidelines.md` siết chặt quy tắc 3-tier: Ưu tiên 1 (`@/components`), Ưu tiên 2 (Ant Design UI kit), Ưu tiên 3 (TailwindCSS chỉ dùng cho spacing/layout gap vi chỉnh); cấm dùng thẻ HTML thô thay thế Ant Design/Shared Component.
  - **AC-6 (Mandatory Skill Reading Invariant)**: Bổ sung invariant bắt buộc trong `SKILL.md`, `rules.md` và tài liệu liên quan: Agent BẮT BUỘC đọc và đối soát skill tương ứng trước khi sinh hoặc chỉnh sửa code.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Cập nhật tài liệu tham chiếu `assets/skills/only-one-nextjs-development/references/page-architecture.md`.
  - Cập nhật tài liệu tham chiếu `assets/skills/only-one-nextjs-development/references/component-architecture.md`.
  - Cập nhật tài liệu tham chiếu `assets/skills/only-one-nextjs-development/references/types-and-contracts.md`.
  - Cập nhật tài liệu tham chiếu `assets/skills/only-one-nestjs-development/references/service-architecture.md`.
  - Cập nhật tài liệu tham chiếu `assets/skills/only-one-nextjs-development/references/ui-ux-guidelines.md`.
  - Bổ sung Mandatory Skill Reading Invariant vào `assets/skills/only-one-nextjs-development/SKILL.md`, `assets/skills/only-one-nestjs-development/SKILL.md` và `only-one/rules.md`.
  - Đồng bộ các cập nhật sang thư mục `.agents/skills/` nếu có tham chiếu tương ứng.
- **Explicit Out-of-Scope**:
  - Không tái cấu trúc trực tiếp toàn bộ source code của các ứng dụng frontend/backend bên ngoài trong lượt task này.
  - Không thay đổi các workflow logic cốt lõi khác ngoài việc cập nhật quy chuẩn và quy tắc âm bản (`rules.md`).

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### Chi tiết Quy chuẩn & Cơ chế Nâng cấp (Core Standards & Mechanisms)

#### 1. Chuẩn hóa Cấu trúc Hằng số Trang (`page-architecture.md`)
Thay thế tệp `constants.ts` bằng thư mục modular:
```text
src/pages/<feature>/
├── constants/
│   ├── columns.constant.ts    # Cấu hình bảng, độ rộng cột, custom render helper
│   ├── filter.constant.ts     # Giá trị mặc định bộ lọc, options tĩnh
│   ├── form.constant.ts       # Initial values, form layout config, field rules
│   └── index.ts               # Barrel export tập trung
```

#### 2. Cấm Anonymous Inline Types & Định Vị Đúng Thư Mục `types/` (`types-and-contracts.md`)
- **Quy tắc cứng**:
  1. Mọi trường dữ liệu dạng object bên trong interface cha hoặc type alias PHẢI được định nghĩa thành một Named Type/Interface riêng biệt.
  2. Toàn bộ type/interface PHẢI được định nghĩa trong các tệp riêng thuộc thư mục `src/pages/<feature>/types/` và re-export tập trung qua `src/pages/<feature>/types/index.ts`.
  3. ❌ **CẤM** khai báo type/interface trực tiếp bên trong `index.tsx`, `components/` hoặc `hooks/` (ngoại trừ `type <ComponentName>Props` được đặt ngay phía trên component definition).

#### 3. Chuẩn hóa Khai báo Component Props bằng `type` (`component-architecture.md` & `types-and-contracts.md`)
- **Quy tắc cứng**:
  - 100% props của component PHẢI được khai báo bằng `type` alias với hậu tố `Props` (e.g., `type OrderDetailDrawerProps = { ... }`).
  - ❌ **CẤM** dùng `interface` hoặc inline object shape trực tiếp trong parameter `({ isOpen }: { isOpen: boolean })`.
  - Tuân thủ thứ tự thuộc tính: Required properties trước, Optional properties (`?`) sau (phân tách bởi dòng trống), sắp xếp chiều dài dòng từ ngắn đến dài (character count).

- **Standard Pattern (DO)**:
  ```typescript
  type OrderDetailDrawerProps = {
    isOpen: boolean;
    isLoading: boolean;
    onClose: () => void;

    order?: Order | null;
  };

  export const OrderDetailDrawer = ({
    isOpen,
    isLoading,
    onClose,
    order,
  }: OrderDetailDrawerProps) => {
    // ...
  };
  ```

#### 4. Chuẩn hóa Type Contract cho Service Methods (`service-architecture.md`)
- **Quy tắc cứng**:
  1. Tuyệt đối không sử dụng inline anonymous object return types trên bất kỳ method nào (`public`, `protected`, `private`).
  2. ❌ **CẤM TUYỆT ĐỐI** khai báo `interface` hoặc `type` trực tiếp bên trong tệp `.service.ts`.
  3. Mọi kiểu dữ liệu trả về hoặc tham số phức tạp PHẢI được khai báo trong thư mục `src/modules/<feature>/types/` và re-export qua `src/modules/<feature>/types/index.ts`.

#### 5. Siết Chặt Thứ Bậc UI Components & Anti-Raw-HTML (`ui-ux-guidelines.md`)
- **Thứ bậc ưu tiên 3 cấp độ**:
  1. **Tier 1 (`@/components`)**: Shared wrapper components (`ListWrapper`, `ListTable`, `CustomDrawerForm`, `CustomInputForm`, `FilterPanel`...).
  2. **Tier 2 (Ant Design primitives & compound components)**: `Button`, `Space`, `Flex`, `Card`, `Typography`, `Tag`, `Badge`, `Row`/`Col`, `Form`, `Input`, `Select`, `Modal`, `Drawer`.
  3. **Tier 3 (TailwindCSS)**: CHỈ sử dụng cho layout spacing, gap, responsive breakpoints và micro-adjustments khi Tier 1 & Tier 2 không hỗ trợ sẵn prop.

#### 6. Mandatory Skill Reading Invariant (`rules.md` & `SKILL.md`)
- Bổ sung quy định bắt buộc vào `only-one/rules.md` và `SKILL.md`:
  - **[ALWAYS]** Khi thực hiện các tác vụ phát triển hoặc chỉnh sửa code Frontend (Next.js/React) hoặc Backend (NestJS), Agent BẮT BUỘC PHẢI nạp và đọc kỹ tài liệu kỹ năng tương ứng (`only-one-nextjs-development` hoặc `only-one-nestjs-development`) cùng các tài liệu tham chiếu (`references/*.md`) trước khi sinh mã.

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

- **Rủi ro tạo type file lẻ tẻ dẫn đến số lượng file quá lớn**:
  - *Giải pháp*: Gom các type liên quan chặt chẽ cùng 1 domain/sub-feature vào chung 1 file có tên rõ ràng (ví dụ `checkout.type.ts`), export qua `types/index.ts`.
- **Rủi ro hiểu nhầm vị trí Component Props Type**:
  - *Quy ước rõ*: Riêng `type <ComponentName>Props` phục vụ riêng cho UI component thì được đặt ngay phía trên khai báo component trong file `.tsx` đó; các domain types, form values, entity models khác bắt buộc phải đặt trong `types/`.
