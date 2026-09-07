---
status: done
slug: streamline-matrix-and-walkthrough
started_at: 2026-09-07
completed_at: 2026-09-07
pr_url: ~
branch: ~
---

# Plan: Tinh Gọn Task Matrix 7 Cột, Hợp Nhất Walkthrough & Tái Định Nghĩa Section 2 Plan.md

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- `only-one-plan.md`:
  - **Trùng lặp giữa Concept và Plan**: Mục "Section 2. Detailed Design" hiện tại yêu cầu mô tả lại cơ chế vận hành, xử lý dữ liệu và state transitions $\rightarrow$ lặp lại 80–90% nội dung đã được viết ở mục "3.2 Cơ chế Hoạt động Chi tiết" của `concept.md`.
  - **Tràn bảng Task Matrix**: Cột `Reused Existing Utilities / Helpers` trong Section 3.2 chiếm quá nhiều diện tích (8 cột), làm bảng bị tràn ngang và vỡ giao diện trên split editor của IDE.
- `only-one-apply.md` & `only-one-archive.md`:
  - Sau khi apply, file riêng biệt `walkthrough.md` được sinh ra trên đĩa, trùng lặp hơn 80% nội dung với `plan.md`, gây phình tài liệu (*Documentation Bloat*).
- `only-one/rules.md`: Dòng 9 vẫn liệt kê `walkthrough.md`, trong khi dòng 11 vốn đã chuẩn hóa danh sách 7 cột của Task Matrix (`Order`, `Status`, `Action`, `File Path`, `Target Symbols`, `Depends On`, `Fast Test Command`).
- **Invariants bắt buộc giữ nguyên**:
  - `concept.md` là nguồn chân lý duy nhất về mặt ý tưởng và cơ chế vận hành tổng quan. `plan.md` không được chép lại văn mẫu cơ chế.
  - Task Matrix giữ nguyên khả năng thực thi tuần tự theo dependency graph.
  - Nguyên tắc Reuse-First được đảm bảo thông qua bước kiểm tra tại Step 1b và Section 4 Action description.
  - Mỗi task chỉ gồm 2 file cốt lõi: `concept.md` và `plan.md`.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
*(Kế thừa 100% cơ chế vận hành từ concept.md; tuyệt đối không chép lại giải pháp tổng quan)*

- **Code Contracts & Manifest Schemas**:
  - `WORKFLOWS` manifest version bumps:
    + `only-one-plan`: `0.0.4` $\rightarrow$ `0.0.5`
    + `only-one-apply`: `0.0.3` $\rightarrow$ `0.0.4`
    + `only-one-archive`: `0.0.2` $\rightarrow$ `0.0.3`
- **AST Seams & Blueprint Seams**:
  - `assets/workflows/only-one-plan.md`:
    + Line 111: Đổi `## Section 2. Detailed Design` $\rightarrow$ `## Section 2. Technical Contracts & AST Seams`.
    + Line 130: Bỏ cột `Reused Existing Utilities / Helpers` trong Section 3.2.
    + Line 157: Thêm guardrail **Anti-Concept-Duplication**.
  - `assets/workflows/only-one-apply.md`:
    + Line 111: Đổi Step 5 thành *Final Comprehensive Verification & In-Chat Reporting*.
    + Line 122: Cập nhật nghiệm thu trực tiếp vào Section 5 của `plan.md`.
    + Line 132: Thêm guardrail **Strict Two-File Task Invariant**.
  - `assets/workflows/only-one-archive.md`:
    + Line 44: Thay đổi điều kiện kiểm tra task hoàn tất từ `walkthrough.md` sang `plan.md status: done`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
assets/workflows/
├── [MODIFY] only-one-plan.md     # Tái định nghĩa Section 2 & chuẩn hóa Task Matrix 7 cột
├── [MODIFY] only-one-apply.md    # Chuẩn hóa 7 cột, hợp nhất walkthrough vào Section 5 và chat
├── [MODIFY] only-one-archive.md  # Bỏ điều kiện bắt buộc walkthrough.md
└── [MODIFY] index.ts             # Nâng patch version (plan, apply, archive)
only-one/
└── [MODIFY] rules.md             # Bỏ walkthrough.md khỏi quy tắc tài liệu kỹ thuật
.agents/workflows/
├── [MODIFY] only-one-plan.md     # Đồng bộ từ assets
├── [MODIFY] only-one-apply.md    # Đồng bộ từ assets
└── [MODIFY] only-one-archive.md  # Đồng bộ từ assets
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-plan.md` | `Section 2 Template, Section 3.2 Table, Guardrails` | `None` | `npm test test/commands/workflow.test.ts` |
| **2** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-apply.md` | `Step 3, Step 4a, Step 5 & Guardrails` | `Order 1` | `npm test test/commands/workflow.test.ts` |
| **3** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-archive.md` | `Step 1 & Step 2 Task Validation` | `Order 2` | `npm test test/commands/workflow.test.ts` |
| **4** | `[x]` | `[MODIFY]` | `only-one/rules.md` | `Rule Line 9` | `None` | `npm test test/core/rule-adapters.test.ts` |
| **5** | `[x]` | `[MODIFY]` | `assets/workflows/index.ts` | `WORKFLOWS manifest versions` | `Order 1, 2, 3` | `npm test test/core/assets/version-gate.test.ts` |
| **6** | `[x]` | `[MODIFY]` | `.agents/workflows/only-one-plan.md`, `.agents/workflows/only-one-apply.md`, `.agents/workflows/only-one-archive.md` | Sync from assets | `Order 1, 2, 3` | `diff -u assets/workflows/only-one-plan.md .agents/workflows/only-one-plan.md` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `assets/workflows/only-one-plan.md`
> **Action**: Tái định nghĩa Section 2 thành Technical Contracts & AST Seams, cấm chép lại cơ chế từ concept, và rút gọn Task Matrix về 7 cột.

```diff
@@ line 111 @@
-## Section 2. Detailed Design (Thiết kế Kỹ thuật Chi tiết)
-- Cơ chế vận hành mới và quyết định kiến trúc, dùng thuật ngữ chuyên môn trực diện (*seams, contracts, DTOs*).
-- Thay đổi về giao tiếp module, xử lý dữ liệu và state transitions.
-- *(Tùy chọn)* Sơ đồ Mermaid sequence hoặc flowchart TD nếu luồng tương tác phức tạp.
+## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
+*(Kế thừa 100% cơ chế vận hành từ concept.md; tuyệt đối không mô tả lại giải pháp tổng quan)*
+
+- **Type Signatures & Code Contracts**: Khai báo các interface, DTO fields/decorators, function signatures mới hoặc sửa đổi. Nếu không phát sinh type mới, ghi rõ: `Kế thừa 100% cơ chế tại concept.md; không phát sinh Type Contract mới.`
+- **AST Seams & Callers**: Vị trí exact hàm, hook state, event handlers, dependency arrays, callers/callees bị ảnh hưởng trong codebase.
@@ line 130 @@
 ### 3.2 Task Matrix & Dependency Graph

-| Order | Status | Action | File Path | Target Symbols / AST Seams | Reused Existing Utilities / Helpers | Depends On | Fast Test Command |
-| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- |
-| **1** | `[ ]` | `[NEW]` | `path/to/file.ts` | `Class.methodName` | `src/utils/date.ts (formatUtc)` | `None` | `npm test path/to/file.test.ts` |
-| **2** | `[ ]` | `[MODIFY]` | `path/to/caller.ts` | `Caller.handler` | `src/hooks/useCustomTable.ts` | `Order 1` | `npm test path/to/caller.test.ts` |
+| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
+| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
+| **1** | `[ ]` | `[NEW]` | `path/to/file.ts` | `Class.methodName` | `None` | `npm test path/to/file.test.ts` |
+| **2** | `[ ]` | `[MODIFY]` | `path/to/caller.ts` | `Caller.handler` | `Order 1` | `npm test path/to/caller.test.ts` |
@@ line 157 @@
 ## Guardrails
 
 - **Enforce Dev-First & Diff-Centric Architecture**: Author narrative in Section 1 and 2 with punchy dev technical terms; present Section 4 in Git-standard Unified Diff (` ```diff `) format.
+- **🛑 Anti-Concept-Duplication**: Never re-explain or summarize the high-level mechanism in Section 2. `concept.md` is the authoritative Single Source of Truth for the solution mechanism; Section 2 strictly defines code-level contracts, type signatures, and AST seams.
 - **🛑 Mandatory File-Centric Research & Compliance Gate**: Always identify target files first, then selectively load matching IDE framework skills and `only-one` rules/archives. Proposed diffs must comply 100% with loaded skills and rules.
```

---

### 2. `[MODIFY]` `assets/workflows/only-one-apply.md`
> **Action**: Bỏ cột Reused Utilities, hợp nhất kết quả vào Section 5 của plan.md, báo cáo qua chat, và cấm tạo file walkthrough.md.

```diff
@@ line 20 @@
 - Apply execution and quality disciplines (`incremental-implementation`, `test-driven-development`, `code-simplification`, `diagnosing-bugs`).
 - Run the targeted `Fast Test Command` immediately after modifying each file to maintain rapid feedback loops.
-- Author a comprehensive `walkthrough.md` summarizing verified results and evidence.
+- Record verification evidence directly into Section 5 of `plan.md` and report a concise walkthrough summary in the chat turn.
@@ line 96 @@
-   - Verify that all existing helpers/hooks specified in the `Reused Existing Utilities / Helpers` column are properly imported and utilized.
+   - Verify that existing project helpers/hooks are properly imported and utilized (Reuse-First Invariant).
@@ line 111 @@
-### Step 5 — Final Comprehensive Verification & Walkthrough Authoring
+### Step 5 — Final Comprehensive Verification & In-Chat Reporting
 
 1. Run the full repository test and lint commands:
    ```bash
    npm test
    npm run lint
    ```
-2. Author `only-one/tasks/<task-folder>/walkthrough.md` in **Bilingual Hybrid Mode**:
-   - Write explanations, summary of changes, and verification narrative in **Vietnamese**.
-   - Preserve all technical terms, variable/function names, file paths, and test commands in **English**.
-   - Detail test execution evidence (Pass/Fail) and manual testing instructions.
-3. Update `plan.md` frontmatter:
+2. **Update `plan.md` Verification Evidence & Completion**:
+   - Update Section 5 of `plan.md` by marking verified test items with `[x]` and appending concrete test execution evidence (e.g., `PASS - X tests passed`).
+   - Update `plan.md` frontmatter:
    ```yaml
    status: done
    completed_at: <YYYY-MM-DD>
    ```
+3. **In-Chat Walkthrough Presentation (Zero walkthrough.md File Creation)**:
+   - Output a clean, structured walkthrough summary directly in the chat response.
+   - ❌ **Strict No-Extra-File Invariant**: Do NOT create a separate `walkthrough.md` file on disk.
@@ line 132 @@
 ## Guardrails
 
-- **Enforce Bilingual Hybrid Walkthrough**: Write narrative in Vietnamese while preserving English technical terms.
+- **🛑 Strict Two-File Task Invariant (Zero walkthrough.md Creation)**: Each task folder must contain ONLY `concept.md` and `plan.md`. Never generate a separate `walkthrough.md` file on disk. Present walkthrough results directly in the conversation response.
 - **🛑 Strict Tech Skill & Rule Adherence**: Applied code must strictly adhere to active language/tech skills and repository rules. Agent MUST NOT write arbitrary code based on personal assumptions.
```

---

### 3. `[MODIFY]` `assets/workflows/only-one-archive.md`
> **Action**: Loại bỏ điều kiện kiểm tra bắt buộc walkthrough.md, chỉ cần plan.md hoàn tất.

```diff
@@ line 43 @@
       > *"⚠️ Task `<slug>` is not marked done. Do you want to force archive?"*
       Proceed only upon explicit user confirmation.
-3. Verify that `walkthrough.md` exists in the task folder.
+3. Verify that `plan.md` is marked `status: done` with completed verification in Section 5 (or legacy `walkthrough.md` if present).
@@ line 49 @@
 ### Step 2 — Extract User Feedback & Distill Negative Rules (`context-engineering`)
-1. Read `walkthrough.md` and `plan.md`.
+1. Read `plan.md` (and `concept.md` / legacy `walkthrough.md` if present).
```

---

### 4. `[MODIFY]` `only-one/rules.md`
> **Action**: Bỏ walkthrough.md khỏi quy tắc ngôn ngữ tài liệu kỹ thuật.

```diff
@@ line 9 @@
-- **[ALWAYS]** Viết toàn bộ tài liệu kỹ thuật (`concept.md`, `plan.md`, `walkthrough.md`) bằng tiếng Anh chuẩn kỹ thuật.
+- **[ALWAYS]** Viết toàn bộ tài liệu kỹ thuật (`concept.md`, `plan.md`) bằng tiếng Anh chuẩn kỹ thuật.
```

---

### 5. `[MODIFY]` `assets/workflows/index.ts`
> **Action**: Tăng patch version cho các manifests liên quan.

```diff
@@ line 20 @@
     {
         name: 'only-one-plan',
-        version: '0.0.4',
+        version: '0.0.5',
         description:
@@ line 36 @@
     {
         name: 'only-one-apply',
-        version: '0.0.3',
+        version: '0.0.4',
         description:
@@ line 111 @@
     {
         name: 'only-one-archive',
-        version: '0.0.2',
+        version: '0.0.3',
         description:
```

---

### 6. `[MODIFY]` `.agents/workflows/only-one-plan.md`, `.agents/workflows/only-one-apply.md`, `.agents/workflows/only-one-archive.md`
> **Action**: Đồng bộ 100% nội dung mới từ `assets/workflows/` sang `.agents/workflows/`.

*(Nội dung đồng bộ hoàn toàn khớp với `assets/workflows/*.md`)*

---

## Section 5. Test Cases & Verification
- **Automated Tests**:
  - `[x]` `npm test test/commands/workflow.test.ts` (PASS - 4 tests passed, verified workflow templates and 7-column matrix).
  - `[x]` `npm test test/core/assets/version-gate.test.ts` (PASS - 2 tests passed, verified decimal rollover versions).
  - `[x]` `npm test test/core/rule-adapters.test.ts` (PASS - 3 tests passed, verified rules.md parsing without walkthrough.md).
  - `[x]` `npm test` (PASS - 56 test files passed, 229 tests passed, 0 failures across the entire test suite).
- **Consistency Audits**:
  - `[x]` `diff -u assets/workflows/only-one-plan.md .agents/workflows/only-one-plan.md` (PASS - 0 diff, perfectly synchronized).
  - `[x]` `diff -u assets/workflows/only-one-apply.md .agents/workflows/only-one-apply.md` (PASS - 0 diff, perfectly synchronized).
  - `[x]` `diff -u assets/workflows/only-one-archive.md .agents/workflows/only-one-archive.md` (PASS - 0 diff, perfectly synchronized).
- **Structure Invariant Check**:
  - `[x]` Directory `only-one/tasks/20260907-101600-streamline-matrix-and-walkthrough/` strictly contains only `concept.md` and `plan.md` (0 walkthrough.md, 0 extra files).
