# Concept: Codebase Structure Adherence & Anti-Reinvention Guardrails

## 1. Problem Statement & Root Need (Bối cảnh & Vấn đề Cốt lõi)
- **Core Business Problem**: Khi thực thi các task phát triển tính năng hoặc sửa lỗi, Agent thường có xu hướng "tái phát minh bánh xe" (reinventing the wheel): tự viết mới các hàm tiện ích (utils/helpers), custom hooks, DTOs, hoặc logic xử lý dữ liệu dù trong codebase đã có sẵn module tương đương. Điều này làm phình mã nguồn (code bloat), phá vỡ tính nhất quán kiến trúc (architectural consistency) và gia tăng chi phí bảo trì.
- **Target Audience & Core Value**: 
  - Kỹ sư phát triển & AI Agent trong dự án.
  - Mang lại codebase tinh gọn, đồng nhất theo đúng cấu trúc chuẩn của dự án (NestJS / Next.js), triệt tiêu hoàn toàn code trùng lặp.

## 2. Scope Boundaries (Ranh giới Phạm vi)
- **In-Scope**:
  - Bổ sung nguyên tắc bất biến **"Reuse-First Invariant"** vào bộ Skills phát triển (`only-one-nestjs-development`, `only-one-nextjs-development`).
  - Nâng cấp `/only-one-plan`: Bắt buộc quét và định danh rõ các tiện ích/hàm/module có sẵn cần tái sử dụng trong Section 3 & 4 của `plan.md`.
  - Nâng cấp `/only-one-apply`: Bổ sung bước **"Pre-apply Context & Import Inspection"** trước khi sửa file, đối chiếu và ưu tiên dùng code có sẵn thay vì dán code mới một cách cơ học.
- **Explicit Out-of-Scope**:
  - Không viết custom compiler/AST parser phức tạp (tránh lạm dụng công cụ nặng nề - giữ tinh thần YAGNI & Defense-in-Depth).

## 3. Success Metrics (Thước đo Thành công / Definition of Done)
- 100% các file `plan.md` sau này đều định danh rõ các hàm/module tái sử dụng.
- 0 trường hợp tự viết lại các hàm utils đã có trong `src/utils`, `src/helpers`, `src/hooks`, `src/common`.
- Toàn bộ test suite của `only-one-cli` chạy pass 100%.

## 4. Proposed Solution & Core Mechanism (Phương pháp Giải quyết & Cơ chế Xử lý)

### 4.1. Explored Options & Trade-off Analysis (Các Phương án Đã Cân Nhắc)
| Option | Hướng tiếp cận | Ưu điểm (Pros) | Nhược điểm (Cons) | Độ phức tạp | Đánh giá |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Option 1: Directive-Only** | Chỉ thêm câu cảnh báo chữ vào cuối file `SKILL.md` và `only-one-apply.md`. | Nhanh, nhẹ. | Agent dễ quên hoặc lướt qua khi ngữ cảnh dài. | Low | ❌ Loại |
| **Option 2: 3-Layer Defense-in-Depth** | Thiết lập 3 chốt chặn: Skill Invariant $\rightarrow$ Plan Reuse Mapping $\rightarrow$ Apply Pre-check Inspection. | Chặn từ gốc đến ngọn, bảo đảm tính nhất quán tuyệt đối. | Cần cập nhật đồng bộ Skills và Workflows. | Medium | ⭐ **Được chọn (PM Approved)** |
| **Option 3: Custom AST/Linter Rule** | Viết linter plugin / AST scanner kiểm tra duplicate logic. | Tự động hóa bằng máy. | Chi phí phát triển cao, khó khái quát hóa cho nhiều framework. | High | ❌ Loại |

- **Chosen Strategy (Phương án Được Chọn)**: **Option 2 (3-Layer Defense-in-Depth)** - Kiểm soát có cấu trúc từ chuẩn kỹ năng (Skill), lập kế hoạch (Plan) cho đến bước thực thi (Apply).

### 4.2. Core Processing Flow (Luồng Xử lý / Chuyển trạng thái Chính)
```
1. [Lập Kế hoạch - /only-one-plan]
   └── Quét codebase: Xác định chính xác các Helper, Service, Hook, Entity đã tồn tại
   └── Section 3 & 4: Khai báo rõ danh sách hàm/module sẽ tái sử dụng (Reused Seams)

2. [Kỹ năng Tiêu chuẩn - only-one-skills]
   └── Enforce "Reuse-First Invariant": Bắt buộc kiểm tra thư mục dùng chung trước khi viết logic mới

3. [Thực thi Mã nguồn - /only-one-apply]
   └── Step 4a: Pre-apply File Context & Existing Import Inspection (Đọc import và code xung quanh)
   └── Step 4b: Áp dụng code theo Seam có tái sử dụng
   └── Step 4c: Chạy Fast Test Command
```

### 4.3. Critical Edge Cases & Risk Handling (Kịch bản Biên & Xử lý Rủi ro)
- **Edge Case: Hàm có sẵn thiếu một số tính năng nhỏ so với yêu cầu mới**:
  - *Handling Strategy*: Ưu tiên mở rộng hàm có sẵn (thêm optional parameter / overload) thay vì đẻ ra hàm mới trùng lặp, bảo đảm không phá vỡ backward compatibility (OCP - Open/Closed Principle).
- **Edge Case: Agent bị trôi ngữ cảnh khi file áp dụng quá dài**:
  - *Handling Strategy*: Step 4a bắt buộc Agent dùng `grep_search` hoặc `view_file` đọc phần header imports và các helpers trong file trước khi viết.

## 5. Technical English Key Patterns
### 1. Reuse-First Invariant
- **Meaning (VI)**: Nguyên tắc bất biến ưu tiên tái sử dụng (không viết mới khi đã có sẵn).
- **Grammar / Usage**: Noun phrase (`Noun + Adjective/Noun Modifier`).
- **Engineering Example**: *"The **reuse-first invariant** prevents engineers and agents from re-implementing existing utilities."*

### 2. Defense-in-Depth
- **Meaning (VI)**: Chiến lược phòng thủ theo chiều sâu / nhiều lớp bảo vệ độc lập.
- **Grammar / Usage**: Idiomatic technical noun phrase.
- **Engineering Example**: *"By applying **defense-in-depth**, we catch redundant code at the planning, skill guidance, and application stages."*

### 3. Reinvent the wheel
- **Meaning (VI)**: Tái phát minh bánh xe / làm lại thứ đã có một cách vô ích.
- **Grammar / Usage**: Idiomatic verb phrase (`reinvent + object`).
- **Engineering Example**: *"Always inspect shared modules first to avoid **reinventing the wheel**."*
