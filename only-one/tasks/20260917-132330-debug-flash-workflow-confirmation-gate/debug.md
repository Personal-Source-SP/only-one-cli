# Debug: Flash Workflow Thieu Buoc Dung Cho Xac Nhan (Review Gate)

---
status: fixed
slug: debug-flash-workflow-confirmation-gate
started_at: 2026-09-17 13:23:30
completed_at: 2026-09-17 13:25:30
reproduction_test: npm test test/core/workflow-registry.test.ts
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Triệu chứng & Khiếm khuyết (Defect Description)**:
  - Tài liệu quy trình `/only-one-flash` (`assets/workflows/only-one-flash.md` và `.agents/workflows/only-one-flash.md`) hiện tại định nghĩa thực thi theo chế độ single-turn tự động: Step 2 xuất kế hoạch trong chat và ngay lập tức thực hiện Step 3 (Direct Strict Apply) sửa code trong cùng một lượt mà không có điểm dừng (confirmation checkpoint / review gate).
  - Người dùng không có cơ hội xem trước kế hoạch trên khung chat, trao đổi, nhận xét hoặc điều chỉnh phạm vi (scope) trước khi AI can thiệp vào mã nguồn dự án.
- **Red Invariant / Gap**:
  - Vi phạm nguyên tắc an toàn tương tác (Human-in-the-loop Guardrail): Mọi thay đổi mã nguồn cần có sự đồng thuận hoặc xác nhận từ người dùng sau khi xem xét kế hoạch tóm tắt (In-Chat Plan).
- **Lệnh chạy kiểm tra tính toàn vẹn (Integrity Test Command)**:
  - `npm test test/core/workflow-registry.test.ts`

## Section 2. Root Cause Analysis & Proposed Solution (Phân tích & Đề xuất Giải pháp)
### 2.1 Mechanical Root Cause & Invariants
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**:
  - Trong tài liệu `only-one-flash.md`, mô tả ban đầu định nghĩa "Execute small, rapid tasks in a single turn" và luồng `Step 2 — Emit In-Chat Plan` chuyển tiếp trực tiếp sang `Step 3 — Direct Strict Apply` mà không định nghĩa trạng thái dừng (🛑 Mandatory Pause / Confirmation Gate).
  - Thiếu quy ước xử lý vòng lặp phản hồi của người dùng (Feedback & Discussion Loop) trước khi áp dụng code changes.
- **Invariants bị vi phạm**:
  - *Interactive Review Guard*: Kế hoạch trên chat phải đóng vai trò là hợp đồng đề xuất (Proposed Plan). AI phải tạm dừng tại Step 2 để người dùng xem xét, trao đổi và chỉ thực hiện chỉnh sửa code khi nhận được xác nhận từ người dùng.

### 2.2 Proposed Solution & Target Source Structure
- **Cơ chế giải pháp cốt lõi (Core Fix Mechanism)**:
  1. Cập nhật `Step 2 — Emit In-Chat Plan & Review Gate (🛑 Mandatory Pause)`: Sau khi xuất Flash Plan trên chat, Agent **BẮT BUỘC DỪNG** lượt xử lý và yêu cầu người dùng xác nhận hoặc góp ý.
  2. Định nghĩa rõ ràng luồng tương tác: Người dùng có thể trao đổi, yêu cầu chỉnh sửa kế hoạch; khi người dùng xác nhận (`tiến hành`, `confirm`, `ok`, `apply`...), Agent mới chuyển sang `Step 3 — Direct Strict Apply`.
  3. Đồng bộ nội dung sửa đổi cho cả `assets/workflows/only-one-flash.md` và `.agents/workflows/only-one-flash.md`.
  4. Cập nhật nhẹ `description` và bump version của `only-one-flash` trong `assets/workflows/index.ts` nếu cần thiết để đảm bảo tính nhất quán.

- **Cấu trúc tệp thay đổi (Source Structure Changes)**:
```text
only-one-cli/
├── [MODIFY] assets/workflows/only-one-flash.md   # Thêm Confirmation Gate và Feedback Loop vào Step 2
├── [MODIFY] .agents/workflows/only-one-flash.md  # Đồng bộ workflow sang workspace agent workflows
└── [MODIFY] assets/workflows/index.ts            # Cập nhật version và description manifest
```

## Section 3. Task Matrix & Dependency Graph
| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-flash.md` | `description`, `Step 2`, `Step 3` | `None` | `npm test test/core/workflow-registry.test.ts` |
| **2** | `[x]` | `[MODIFY]` | `.agents/workflows/only-one-flash.md` | `description`, `Step 2`, `Step 3` | `Order 1` | `npm test test/core/workflow-registry.test.ts` |
| **3** | `[x]` | `[MODIFY]` | `assets/workflows/index.ts` | `WORKFLOWS[only-one-flash]` | `Order 1` | `npm test test/core/workflow-registry.test.ts` |

## Section 4. Code Changes (Unified Diff & Chi tiết Thay đổi)

### 1. `[MODIFY]` `assets/workflows/only-one-flash.md`
- **Mục đích thay đổi (Action / Rationale)**: Bổ sung bước dừng chờ người dùng duyệt/xác nhận kế hoạch trước khi chỉnh sửa mã nguồn.
- **Điểm can thiệp (AST Seams / Target Symbols)**: Frontmatter `description`, `Role`, `Purpose`, `Step 2`, `Step 3`.
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -1,4 +1,4 @@
 ---
-description: "Execute small, rapid tasks in a single turn with zero disk plan footprint, ultra-clean in-chat plan (Mô tả, Target cấu trúc source, Verification), strict rule/skill compliance, and fast verification."
+description: "Execute small, rapid tasks with zero disk plan footprint, clean in-chat plan, user confirmation review gate, strict rule/skill compliance, and fast verification."
 ---
 
@@ -16,3 +16,3 @@
 - Perform rapid, targeted codebase research without generating task folders or markdown planning files on disk (**Zero Disk Plan Footprint**).
-- Output an ultra-clean, structured plan directly into the chat response before applying code changes (containing only **Mô tả**, **Target** source structure with brief descriptions, and **Verification**).
+- Output an ultra-clean, structured plan directly into the chat response and **pause for user confirmation/feedback** before applying code changes.
 - Ingest and strictly enforce `only-one/rules.md`, relevant `only-one/archives/*.md`, `only-one/CONTEXT.md`, and framework-specific skills (`SKILL.md`) in working memory without cluttering the chat output.
@@ -23,3 +23,3 @@
 ## Purpose
 
-Provide a rapid fast-track lane for micro-tasks and hotfixes, combining the research discipline of `/only-one-plan` with the execution rigor of `/only-one-apply` in a seamless single turn.
+Provide a rapid fast-track lane for micro-tasks and hotfixes, combining the research discipline of `/only-one-plan` with the execution rigor of `/only-one-apply` while maintaining an interactive confirmation review gate before modifying code.
@@ -56,5 +56,5 @@
-### Step 2 — Emit In-Chat Plan
+### Step 2 — Emit In-Chat Plan & Review Gate (🛑 Mandatory Pause)
 
-Emit a clean, focused Markdown plan directly in the chat output before modifying code:
+1. Emit a clean, focused Markdown plan directly in the chat output:
 
 ```markdown
@@ -69,3 +69,8 @@
 *(🛑 Do NOT display loaded skills or governance metadata in chat. Do NOT create `only-one/tasks/`, `concept.md`, or `plan.md` on disk).*
 
+2. 🛑 **MANDATORY REVIEW GATE — Pause for User Confirmation**:
+   - Stop immediately after emitting the Flash Plan. Do NOT apply code changes in this turn.
+   - Guide the user: *"Kế hoạch thực hiện nhanh đã sẵn sàng ở trên. Bạn có thể góp ý/nhận xét hoặc xác nhận để tiến hành chỉnh sửa mã nguồn."*
+   - Wait for the user's explicit confirmation (e.g., *"xác nhận"*, *"tiến hành"*, *"ok"*, *"apply"*) or adjustments before proceeding to Step 3.
+
 ---
 
-### Step 3 — Direct Strict Apply
+### Step 3 — Direct Strict Apply (Upon Confirmation)
 
+1. Once the user confirms the plan:
-1. Apply code changes using `replace_file_content` or `multi_replace_file_content`.
+   - Apply code changes using `replace_file_content` or `multi_replace_file_content`.
```

---

### 2. `[MODIFY]` `.agents/workflows/only-one-flash.md`
- **Mục đích thay đổi (Action / Rationale)**: Đồng bộ hoàn toàn với `assets/workflows/only-one-flash.md`.
- **Điểm can thiệp (AST Seams / Target Symbols)**: Toàn bộ nội dung tương ứng.
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -1,4 +1,4 @@
 ---
-description: "Execute small, rapid tasks in a single turn with zero disk plan footprint, ultra-clean in-chat plan (Mô tả, Target cấu trúc source, Verification), strict rule/skill compliance, and fast verification."
+description: "Execute small, rapid tasks with zero disk plan footprint, clean in-chat plan, user confirmation review gate, strict rule/skill compliance, and fast verification."
 ---
 
@@ -16,3 +16,3 @@
 - Perform rapid, targeted codebase research without generating task folders or markdown planning files on disk (**Zero Disk Plan Footprint**).
-- Output an ultra-clean, structured plan directly into the chat response before applying code changes (containing only **Mô tả**, **Target** source structure with brief descriptions, and **Verification**).
+- Output an ultra-clean, structured plan directly into the chat response and **pause for user confirmation/feedback** before applying code changes.
 - Ingest and strictly enforce `only-one/rules.md`, relevant `only-one/archives/*.md`, `only-one/CONTEXT.md`, and framework-specific skills (`SKILL.md`) in working memory without cluttering the chat output.
@@ -23,3 +23,3 @@
 ## Purpose
 
-Provide a rapid fast-track lane for micro-tasks and hotfixes, combining the research discipline of `/only-one-plan` with the execution rigor of `/only-one-apply` in a seamless single turn.
+Provide a rapid fast-track lane for micro-tasks and hotfixes, combining the research discipline of `/only-one-plan` with the execution rigor of `/only-one-apply` while maintaining an interactive confirmation review gate before modifying code.
@@ -56,5 +56,5 @@
-### Step 2 — Emit In-Chat Plan
+### Step 2 — Emit In-Chat Plan & Review Gate (🛑 Mandatory Pause)
 
-Emit a clean, focused Markdown plan directly in the chat output before modifying code:
+1. Emit a clean, focused Markdown plan directly in the chat output:
 
 ```markdown
@@ -69,3 +69,8 @@
 *(🛑 Do NOT display loaded skills or governance metadata in chat. Do NOT create `only-one/tasks/`, `concept.md`, or `plan.md` on disk).*
 
+2. 🛑 **MANDATORY REVIEW GATE — Pause for User Confirmation**:
+   - Stop immediately after emitting the Flash Plan. Do NOT apply code changes in this turn.
+   - Guide the user: *"Kế hoạch thực hiện nhanh đã sẵn sàng ở trên. Bạn có thể góp ý/nhận xét hoặc xác nhận để tiến hành chỉnh sửa mã nguồn."*
+   - Wait for the user's explicit confirmation (e.g., *"xác nhận"*, *"tiến hành"*, *"ok"*, *"apply"*) or adjustments before proceeding to Step 3.
+
 ---
 
-### Step 3 — Direct Strict Apply
+### Step 3 — Direct Strict Apply (Upon Confirmation)
 
+1. Once the user confirms the plan:
-1. Apply code changes using `replace_file_content` or `multi_replace_file_content`.
+   - Apply code changes using `replace_file_content` or `multi_replace_file_content`.
```

---

### 3. `[MODIFY]` `assets/workflows/index.ts`
- **Mục đích thay đổi (Action / Rationale)**: Cập nhật version và description manifest cho `only-one-flash`.
- **Điểm can thiệp (AST Seams / Target Symbols)**: `WORKFLOWS` array, item `only-one-flash`.
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -115,4 +115,4 @@
     {
         name: 'only-one-flash',
-        version: '0.0.1',
+        version: '0.0.2',
         description:
-            'Execute small, rapid tasks in a single turn with zero disk plan footprint, ultra-clean in-chat plan, strict rule/skill compliance, and fast verification.',
+            'Execute small, rapid tasks with zero disk plan footprint, clean in-chat plan, user confirmation review gate, strict rule/skill compliance, and fast verification.',
         requiredSkills: [
```

## Section 5. Verification & Regression Guard
- **Automated Tests**:
  - `[x]` `npm test test/core/workflow-registry.test.ts`: `PASS (3 tests passed)`
  - `[x]` `npm run build`: `PASS`
  - `[x]` `npm test`: `PASS (55 test files passed, 231 tests passed, 0 failed)`
- **Bài học kinh nghiệm (Lessons Learned)**:
  - Cần luôn duy trì Review Gate rõ ràng ngay cả trong các quy trình fast-track để đảm bảo người dùng có quyền kiểm soát và duyệt kế hoạch trước khi mã nguồn bị thay đổi.

