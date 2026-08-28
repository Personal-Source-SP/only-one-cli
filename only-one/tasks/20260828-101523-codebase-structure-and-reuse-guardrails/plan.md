---
status: done
slug: codebase-structure-and-reuse-guardrails
started_at: 2026-08-28
completed_at: 2026-08-28
pr_url: ~
branch: ~
---

# Plan: Codebase Structure Adherence & Anti-Reinvention Guardrails

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- **Hiện trạng**: Trong quá trình phát triển tính năng, Agent thường tự ý sinh mã nguồn mới (helper, hook, mapper, utility) thay vì tìm kiếm và tái sử dụng các abstraction đã tồn tại sẵn trong codebase.
- **Bằng chứng phân tích**:
  - [`assets/skills/only-one-nestjs-development/SKILL.md`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nestjs-development/SKILL.md): Chỉ liệt kê tài liệu tham khảo theo component, thiếu quy tắc cấm tự viết lại helper/service có sẵn.
  - [`assets/skills/only-one-nextjs-development/SKILL.md`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-nextjs-development/SKILL.md): Thiếu quy định quét `src/components`, `src/hooks`, `src/utils` trước khi code.
  - [`assets/workflows/only-one-plan.md`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/only-one-plan.md#L48-L57): Step 1b nghiên cứu code chưa bắt buộc kiểm toán mã nguồn dùng chung (Reuse Audit) và Section 3.1 chưa có cột mapping abstraction tái sử dụng.
  - [`assets/workflows/only-one-apply.md`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/only-one-apply.md#L86-L95): Step 4 hướng dẫn dán code từ Section 4 một cách cơ học, thiếu bước kiểm tra header imports và context file trước khi áp dụng.
- **Danh sách Invariants bắt buộc giữ nguyên**:
  - Không phá vỡ cấu trúc CLI của `only-one-cli`.
  - 100% test suites trong `test/` phải tiếp tục pass.
  - Định dạng chuẩn Machine-Readable Task Matrix của Section 3.1 phải được giữ nguyên cấu trúc chuẩn hóa.

## Section 2. Detailed Design (Thiết kế Kỹ thuật Chi tiết)
- **Kiến trúc phòng thủ 3 tầng (3-Layer Defense-in-Depth)**:
  1. **Tầng 1: Domain Skills (`only-one-nestjs-development`, `only-one-nextjs-development`)**:
     - Bổ sung mục `## 0. Mandatory Reuse-First Invariant (Anti-Reinvention Rules)` ngay đầu file SKILL.md.
     - Quy định rõ ràng: Quét `src/utils/`, `src/helpers/`, `src/hooks/`, `src/common/`, `src/components/` trước khi thêm code; Cấm tạo duplicate helpers; Áp dụng Open/Closed Principle (mở rộng thay vì tạo mới).
  2. **Tầng 2: Planning Phase (`only-one-plan.md`)**:
     - Bổ sung `Step 1b: Mandatory Reuse-First Audit` trong khâu nghiên cứu.
     - Cập nhật Section 3.1 Task Matrix thêm cột `Reused Existing Utilities / Helpers` để xác định rõ seam tái sử dụng.
     - Cập nhật Section 4 yêu cầu khai báo rõ các abstractions tái sử dụng.
  3. **Tầng 3: Execution Phase (`only-one-apply.md`)**:
     - Tách Step 4 thành 3 bước nhỏ:
       - `Step 4a — Pre-apply Context & Existing Imports Inspection`: Đọc file mục tiêu, kiểm tra imports và utils sẵn có.
       - `Step 4b — Apply Code Modification`: Chèn code theo đúng seam.
       - `Step 4c — Run Fast Test Command`: Kiểm thử nhanh sau từng file.
- **Sơ đồ luồng xử lý**:
  ```mermaid
  flowchart TD
    A[only-one-plan] -->|Quét helpers & định danh Reused Seams| B[Task Matrix with Reused Helpers]
    B --> C[only-one-skills: Enforce Reuse-First Invariant]
    C --> D[only-one-apply: Step 4a Pre-apply Context Inspection]
    D --> E[Step 4b Apply Code Seam]
    E --> F[Step 4c Fast Test Verification]
  ```

## Section 3. Implementation Architecture & Machine-Readable Task Matrix

### 3.1 Machine-Readable Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Reused Existing Utilities / Helpers | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nestjs-development/SKILL.md` | `Section 0 Reuse-First Invariant` | `None` | `None` | `npm test test/commands/skill/skill.test.ts` |
| **2** | `[x]` | `[MODIFY]` | `assets/skills/only-one-nextjs-development/SKILL.md` | `Section 0 Reuse-First Invariant` | `None` | `None` | `npm test test/commands/skill/skill.test.ts` |
| **3** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-plan.md` | `Step 1b & Section 3/4` | `None` | `None` | `npm test test/commands/workflow.test.ts` |
| **4** | `[x]` | `[MODIFY]` | `.agents/workflows/only-one-plan.md` | `Step 1b & Section 3/4` | `None` | `Order 3` | `npm test test/commands/workflow.test.ts` |
| **5** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-apply.md` | `Step 4a/4b/4c & Guardrails` | `None` | `None` | `npm test test/commands/workflow.test.ts` |
| **6** | `[x]` | `[MODIFY]` | `.agents/workflows/only-one-apply.md` | `Step 4a/4b/4c & Guardrails` | `None` | `Order 5` | `npm test test/commands/workflow.test.ts` |

## Section 4. Implementation Code Examples (Mẫu Code Triển khai)

### 1. [MODIFY] `assets/skills/only-one-nestjs-development/SKILL.md`
- **Order**: 1 | **Depends on**: None
- **Mục đích**: Bổ sung nguyên tắc bất biến Reuse-First cho NestJS development.
- **Code modification**:
```markdown
// [TARGET SEAM]
# NestJS Development Skill

## 0. Mandatory Reuse-First Invariant (Anti-Reinvention Rules)

⚠️ **BẮT BUỘC TUÂN THỦ TRƯỚC KHI VIẾT CODE MỚI**:
1. **Pre-Implementation Codebase Audit**:
   - Trước khi tạo bất kỳ Helper, Utility, Custom Decorator, DTO, Mapper, Exception Class hay Service Method mới nào, Agent **BẮT BUỘC** phải tìm kiếm (`grep_search` hoặc `list_dir`) trong:
     - `src/common/`, `src/shared/`, `src/utils/`, `src/helpers/`, `src/decorators/`
     - Các module lân cận có nghiệp vụ tương tự.
2. **Strict Anti-Reinvention**:
   - ❌ **CẤM** tự viết lại các hàm xử lý chuỗi, định dạng ngày tháng, hash password, format tiền tệ, mapping object, hoặc parse query nếu trong project đã có utility tương đương.
   - ❌ **CẤM** viết logic inline ad-hoc trong Service/Controller nếu đã có Base Service, Shared Helper hoặc ORM Repository method phục vụ mục đích đó.
3. **Mở rộng thay vì Tạo mới (Open/Closed Principle)**:
   - Nếu hàm/helper có sẵn chỉ thiếu 1 tùy chọn nhỏ, hãy mở rộng hàm đó (thêm optional parameter) thay vì tạo ra một hàm mới trùng lặp.
// [RATIONALE]: Chặn tình trạng Agent tự ý viết hàm tiện ích trùng lặp trong backend NestJS.
```

### 2. [MODIFY] `assets/skills/only-one-nextjs-development/SKILL.md`
- **Order**: 2 | **Depends on**: None
- **Mục đích**: Bổ sung nguyên tắc bất biến Reuse-First cho Next.js / Frontend development.
- **Code modification**:
```markdown
// [TARGET SEAM]
# Master Next.js / Frontend Development Skill (Central Coordinator)

## 0. Mandatory Reuse-First Invariant (Anti-Reinvention Rules)

⚠️ **BẮT BUỘC TUÂN THỦ TRƯỚC KHI VIẾT CODE FRONTEND MỚI**:
1. **Pre-Implementation Codebase Audit**:
   - Trước khi tạo bất kỳ Custom Hook, UI Component, Utility Function, Form Drawer, Modal, Date/Time Formatter, hoặc Type/Interface mới nào, Agent **BẮT BUỘC** phải tìm kiếm (`grep_search` hoặc `list_dir`) trong:
     - `src/components/`, `src/hooks/`, `src/utils/`, `src/helpers/`, `src/common/`, `src/types/`
     - Các feature folder tương tự (ví dụ: các module quản trị khác trong admin portal).
2. **Strict Anti-Reinvention**:
   - ❌ **CẤM** tự viết lại các hàm xử lý date/time (dayjs timezone, format timestamp), number/currency format, parse URL query, lodash helpers nếu trong `src/utils/` đã có.
   - ❌ **CẤM** tự viết các hook CRUD table/form nếu dự án đang dùng chuẩn chung (ví dụ `useCustomTable`, `useCustomDrawerForm`, custom refine hooks).
   - ❌ **CẤM** tạo duplicate component (ví dụ StatusBadge, ConfirmModal, FilterDropdown) khi trong `src/components/` đã có sẵn.
3. **Mở rộng thay vì Tạo mới (Open/Closed Principle)**:
   - Nếu component hoặc hook có sẵn cần thêm thuộc tính (props/options), hãy mở rộng props đó (với giá trị default an toàn) thay vì tạo component mới copy-paste.
// [RATIONALE]: Chặn tình trạng Agent tự viết duplicate component, custom hook, hoặc inline formatters trong frontend Next.js.
```

### 3 & 4. [MODIFY] `assets/workflows/only-one-plan.md` & `.agents/workflows/only-one-plan.md`
- **Order**: 3, 4 | **Depends on**: None / Order 3
- **Mục đích**: Bắt buộc Reuse-First Audit và khai báo Reused Existing Utilities trong Section 3.1 & 4.
- **Code modification**:
```markdown
// [TARGET SEAM]
### 1b. Research Current Code & Reuse-First Audit
1. Start with files, symbols, errors, and requirements from `concept.md` or user input.
2. Read direct callers, dependencies, entities, DTOs, contracts, and tests in the codebase to verify exact current behavior.
3. **Mandatory Reuse-First Audit**:
   - Actively search (`grep_search` / `list_dir`) in `src/utils/`, `src/helpers/`, `src/hooks/`, `src/common/`, `src/components/`, `src/shared/` to identify existing utilities, helper functions, base classes, and custom hooks before designing new logic.
   - ❌ **Strict Anti-Reinvention**: Do not propose new utility functions or duplicate components if existing ones can be reused or extended.
4. Read `only-one/rules.md` to strictly observe mandatory negative rules and past lessons learned.
// [RATIONALE]: Đảm bảo khâu lập plan luôn khảo sát kỹ lưỡng các hàm dùng chung trước khi đưa vào blueprint.
```

### 5 & 6. [MODIFY] `assets/workflows/only-one-apply.md` & `.agents/workflows/only-one-apply.md`
- **Order**: 5, 6 | **Depends on**: None / Order 5
- **Mục đích**: Bổ sung bước Step 4a Pre-apply Context & Existing Imports Inspection.
- **Code modification**:
```markdown
// [TARGET SEAM]
### Step 4 — Apply File Changes Incrementally (`incremental-implementation`)

For each pending row in the Task Matrix:
1. Verify that all prerequisite files (`Depends On`) have been successfully applied and verified (`[x]`).
2. Mark the row's `Status` as `[/]` (in-progress) in `plan.md`.
3. **Step 4a — Pre-apply Context & Existing Imports Inspection**:
   - Read the target file (`view_file`) to inspect its current imports, shared utilities, and surrounding code patterns.
   - Verify that all existing helpers/hooks specified in the `Reused Existing Utilities / Helpers` column are properly imported and utilized.
   - ❌ **Strict Anti-Reinvention Check**: Do NOT write inline helper logic or duplicate functions if a shared project utility already exists.
4. **Step 4b — Apply Code Modification**:
   - Locate the corresponding section in **Section 4. Implementation Code Examples** and apply the code modification at the exact `// [TARGET SEAM]`.
5. **Step 4c — Run Fast Test Command**:
   - Run the row's **`Fast Test Command`** immediately:
     - If test passes: mark row `Status` as `[x]` (done) in `plan.md` and proceed to next row.
     - If test fails: activate `diagnosing-bugs` (Red Feedback Loop $\rightarrow$ Instrument $\rightarrow$ Fix).
// [RATIONALE]: Đảm bảo khâu apply kiểm tra thực tế file đích trước khi chèn code.
```

## Section 5. Test Cases (Kịch bản Kiểm thử & Nghiệm thu)

### Test Case 1: Skill Registry & Workflow Registry Verification
- **Objective**: Xác thực các file skill và workflow cập nhật cú pháp hợp lệ và không làm vỡ registry.
- **Command**: `npm test test/core/skill-registry.test.ts && npm test test/core/workflow-registry.test.ts`
- **Expected**: All tests pass cleanly.

### Test Case 2: Full Integration Test Suite
- **Objective**: Đảm bảo tất cả 50 test files của CLI chạy hoàn tất không có lỗi hồi quy.
- **Command**: `npm test`
- **Expected**: 201 tests passed, 0 failures.

## Section 6. Technical English Key Patterns
### 1. Pre-implementation Audit
- **Meaning (VI)**: Bước kiểm toán / khảo sát mã nguồn trước khi bắt tay vào triển khai.
- **Grammar / Usage**: Compound noun phrase.
- **Engineering Example**: *"Performing a **pre-implementation audit** prevents redundant utilities from being created."*

### 2. Seam-Aware Implementation
- **Meaning (VI)**: Triển khai dựa trên các điểm tiếp giáp chuẩn xác trong mã nguồn.
- **Grammar / Usage**: Adjective phrase (`Noun + Aware`).
- **Engineering Example**: *"The **seam-aware implementation** ensures that modifications cleanly fit into existing call sites."*

### 3. Open/Closed Principle (OCP)
- **Meaning (VI)**: Nguyên lý Mở cho mở rộng, Đóng cho chỉnh sửa (SOLID).
- **Grammar / Usage**: Software engineering principle.
- **Engineering Example**: *"Adhering to the **Open/Closed Principle** encourages engineers to extend existing utilities rather than duplicate them."*
