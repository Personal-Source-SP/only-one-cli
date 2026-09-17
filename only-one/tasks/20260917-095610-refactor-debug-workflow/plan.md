---
status: done
slug: refactor-debug-workflow
started_at: 2026-09-17
completed_at: 2026-09-17
pr_url: ~
branch: ~
---

# Plan: Tái Cấu Trúc Workflow only-one-debug và Mở Rộng only-one-apply Cho Debugging

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Điểm nghẽn Section 2 của `debug.md`**: `Proposed Fix Strategy` hiện chỉ là một gạch đầu dòng ngắn bị gộp chung trong mục phân tích nguyên nhân tại `only-one-debug.md`, thiếu trực quan về cấu trúc tệp mã nguồn sẽ sửa đổi và cách sửa cụ thể của từng file.
- **Ngắt quãng luồng với Review Gate**: `MANDATORY RCA REVIEW GATE` trong `only-one-debug.md` buộc agent phải dừng lại chờ duyệt, ngăn cản khả năng thực thi liên tục khép kín từ chẩn đoán lỗi tới vá lỗi và kiểm thử.
- **Phân mảnh thực thi ở `only-one-apply.md`**: `only-one-apply` hiện chỉ hỗ trợ `plan.md`, chưa hỗ trợ nhận `debug.md` để thực thi áp dụng diff và chạy test từng bước qua Task Matrix.
- **Invariants bắt buộc duy trì**:
  - Tuân thủ Beyoncé Rule: Mọi lỗi phải có test tái hiện (Red) trước khi vá và pass (Green) sau khi vá.
  - Toàn bộ 5 Section chuẩn trong tài liệu task phải giữ đúng định dạng và cú pháp bảng Task Matrix Machine-Readable.
  - Khai báo phiên bản hợp lệ chuẩn cơ số 10 (`X.Y.Z`) trong `assets/workflows/index.ts` để pass Asset Version Gate.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

*(Kế thừa 100% cơ chế vận hành từ concept.md; không phát sinh Type Contract mới)*

- **Workflow Manifests (`assets/workflows/index.ts`)**:
  - `only-one-debug`: Nâng version từ `0.0.2` $\rightarrow$ `0.0.3`, cập nhật `description` bỏ Review Gate.
  - `only-one-apply`: Nâng version từ `0.0.4` $\rightarrow$ `0.0.5`, cập nhật `description` hỗ trợ `debug.md`.
- **Workflow Markdown Contracts (`assets/workflows/` & `.agents/workflows/`)**:
  - `only-one-debug.md`:
    - Tái cấu trúc Section 2 thành: `2.1 Mechanical Root Cause & Invariants` và `2.2 Proposed Solution & Target Source Structure`.
    - Thêm chuẩn hiển thị cây thư mục ASCII có action tags `[NEW]`, `[MODIFY]`, `[DELETE]` kèm inline comment giải thích cách sửa.
    - Xóa bỏ toàn bộ trạm dừng `MANDATORY RCA REVIEW GATE` và cập nhật protocol thành continuous execution.
  - `only-one-apply.md`:
    - Mở rộng cú pháp đầu vào: `/only-one-apply [<task-folder> | <plan-path> | <debug-path>]`.
    - Mở rộng logic phát hiện và xử lý tài liệu: hỗ trợ cả `plan.md` (`status: planned` $\rightarrow$ `done`) và `debug.md` (`status: planning`/`diagnosing` $\rightarrow$ `fixed`).

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes

```text
assets/workflows/
├── [MODIFY] index.ts               # Bump versions (only-one-debug 0.0.3, only-one-apply 0.0.5) & update descriptions
├── [MODIFY] only-one-debug.md      # Tái cấu trúc Section 2.1 & 2.2, bỏ Review Gate, chuyển sang continuous flow
└── [MODIFY] only-one-apply.md      # Mở rộng hỗ trợ thực thi cả debug.md và plan.md qua Task Matrix

.agents/workflows/
├── [MODIFY] only-one-debug.md      # Đồng bộ nội dung workflow only-one-debug vào workspace customization
└── [MODIFY] only-one-apply.md      # Đồng bộ nội dung workflow only-one-apply vào workspace customization
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `assets/workflows/index.ts` | `WORKFLOWS[2]`, `WORKFLOWS[3]` | `None` | `npm test test/core/assets/version-gate.test.ts` |
| **2** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-debug.md` | Entire workflow documentation | `Order 1` | `npm test test/core/workflow-registry.test.ts` |
| **3** | `[x]` | `[MODIFY]` | `.agents/workflows/only-one-debug.md` | Entire workflow documentation | `Order 2` | `npm test test/core/agent-workflows.test.ts` |
| **4** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-apply.md` | Entire workflow documentation | `Order 1` | `npm test test/core/workflow-registry.test.ts` |
| **5** | `[x]` | `[MODIFY]` | `.agents/workflows/only-one-apply.md` | Entire workflow documentation | `Order 4` | `npm test test/core/agent-workflows.test.ts` |

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `assets/workflows/index.ts`
> **Action**: Nâng version và cập nhật description cho `only-one-apply` và `only-one-debug`.

```diff
@@ -35,5 +35,5 @@
     {
         name: 'only-one-apply',
-        version: '0.0.4',
+        version: '0.0.5',
         description:
-            'Implement tasks from an approved plan.md by parsing the Machine-Readable Task Matrix and applying changes in dependency order.',
+            'Implement tasks from an approved plan.md or debug.md by parsing the Machine-Readable Task Matrix and applying changes in dependency order.',
         requiredSkills: [
@@ -48,5 +48,5 @@
     {
         name: 'only-one-debug',
-        version: '0.0.2',
+        version: '0.0.3',
         description:
-            'Perform systematic Root Cause Analysis (RCA) with a mandatory Review Gate, document debug.md, and deliver a minimal verified fix.',
+            'Perform systematic Root Cause Analysis (RCA), document findings in debug.md, and deliver an end-to-end minimal verified fix using disciplined red feedback loops.',
         requiredSkills: [
```

### 2. `[MODIFY]` `assets/workflows/only-one-debug.md`
> **Action**: Tách bạch Section 2.1 & 2.2, thêm cấu trúc cây thư mục với action note từng file, loại bỏ Review Gate.

```diff
@@ -1,3 +1,3 @@
 ---
-description: Perform systematic Root Cause Analysis (RCA) with a mandatory Review Gate, document findings in debug.md, and deliver a minimal verified fix using disciplined red feedback loops.
+description: Perform systematic Root Cause Analysis (RCA), document findings in debug.md, and deliver an end-to-end minimal verified fix using disciplined red feedback loops.
 ---
@@ -17,3 +17,3 @@
 You are a **Senior Debugging Specialist**. Your core responsibilities:
-- Follow the disciplined **2-Phase Debugging Protocol** with a **Mandatory RCA Review Gate** before modifying source code.
+- Follow the disciplined **Continuous Debugging Protocol** using disciplined red feedback loops and minimal surgical patches.
 - Implement the **Dual-Layer Architecture (Bilingual Hybrid Mode)**:
@@ -21,3 +21,3 @@
   - **Human Layer (Vietnamese Narrative + English Technical Terms)**:
-    - Author Section 1 & 2 of `debug.md` in clear, concise Vietnamese narrative with standard English technical terms (*idempotency, race condition, root cause, reproduction test, AST seam, invariant, regression guard...*).
+    - Author Section 1 & 2 of `debug.md` in clear, concise Vietnamese narrative with standard English technical terms (*idempotency, race condition, root cause, reproduction test, AST seam, invariant, regression guard...*). Section 2 must clearly separate 2.1 Mechanical Root Cause from 2.2 Proposed Solution & Target Source Structure (with ASCII file tree and brief action notes per file).
   - **Machine Layer (Standardized English & Unified Diffs)**:
@@ -47,5 +47,5 @@
-## 2. Two-Phase Debugging Protocol with Mandatory Review Gate
+## 2. Step-by-Step Continuous Debugging Protocol
 
-### Phase 1 — Diagnosis & Root Cause Analysis (`diagnosing-bugs`)
+### Step 0 — Task Directory & `debug.md` Initialization
 1. Create `only-one/tasks/<YYYYMMDD-HHmmss>-debug-<kebab-case-slug>/` (if not already existing).
 2. Initialize `debug.md` with frontmatter `status: diagnosing`.
@@ -66,31 +66,13 @@
-#### Step 3 — Hypothesize & Instrument (`doubt-driven-development`)
+### Step 3 — Hypothesize & Instrument (`doubt-driven-development`)
 1. Formulate a specific, testable mechanical hypothesis distinguishing the symptom from the true root cause.
 2. Instrument with temporary logging or assertions to prove or disprove the hypothesis with runtime evidence.
-3. Record the root cause analysis, evidence, and violated invariants in **Section 2 (Root Cause Analysis & Hypotheses)** of `debug.md`.
+3. Record the root cause analysis, evidence, and violated invariants in **Section 2.1 (Mechanical Root Cause & Invariants)** of `debug.md`.
 
----
-
-### 🛑 MANDATORY RCA REVIEW GATE (Checkpoint)
-
-After completing Section 1 and Section 2 of `debug.md`:
-1. Save `debug.md` to disk.
-2. **STOP IMMEDIATELY (HARD STOP)** and present the diagnosis report in chat:
-   - **Symptom & Red Feedback Loop**: Error details and reproduction test command.
-   - **Root Cause & Instrumentation Evidence**: Detailed mechanical explanation.
-   - **Proposed Fix Strategy**: High-level approach for the surgical patch.
-3. **Wait for explicit user approval**:
-   - If user approves $\rightarrow$ Proceed to **Phase 2**.
-   - If user requests re-investigation $\rightarrow$ Return to Step 2 & 3 to refine hypothesis.
-
----
-
-### Phase 2 — Surgical Patch & Verification
-
-*(Execute only after explicit user approval at the RCA Review Gate)*
-
-#### Step 4 — Plan & Deliver Minimal Fix (`code-simplification`)
-1. Update `debug.md` frontmatter to `status: planning`.
-2. Assemble affected files and AST Seams into **Section 3 (Directory Structure & Task Matrix)** of `debug.md`.
-3. Draft Git-standard Unified Diff (` ```diff `) blocks in **Section 4 (Code Changes Unified Diff)** for both the regression test and the minimal code fix.
-4. Apply the surgical patch directly and remove temporary instrumentation logs.
+### Step 4 — Formulate Proposed Solution & Target Source Structure
+1. Formulate the core fix mechanism directly targeting the root cause.
+2. Construct the target source structure ASCII tree in **Section 2.2 (Proposed Solution & Target Source Structure)** of `debug.md`, annotating every affected file with `[NEW]`, `[MODIFY]`, or `[DELETE]` and a concise inline action note explaining how it will be modified.
+3. Update `debug.md` frontmatter to `status: planning`.
+4. Assemble affected files and AST Seams into **Section 3 (Task Matrix & Dependency Graph)** of `debug.md`.
+5. Draft Git-standard Unified Diff (` ```diff `) blocks in **Section 4 (Code Changes Unified Diff)** for both the regression test and the minimal code fix.
+6. Apply the surgical patch directly (or execute via `/only-one-apply`) and remove temporary instrumentation logs.
 
-#### Step 5 — Guard Against Regressions & Capture Lessons
+### Step 5 — Guard Against Regressions & Capture Lessons
 1. Execute the reproduction test from Step 1 and verify it turns **GREEN**.
@@ -129,7 +11,14 @@
-## Section 2. Root Cause Analysis & Hypotheses (Phân tích Nguyên nhân)
+## Section 2. Root Cause Analysis & Proposed Solution (Phân tích & Đề xuất Giải pháp)
+### 2.1 Mechanical Root Cause & Invariants
 - **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**: <Bản chất kỹ thuật bên dưới>.
 - **Bằng chứng & Dữ liệu thực nghiệm (Evidence)**: <Kết quả log/instrumentation chứng minh>.
 - **Invariants bị vi phạm**: <Ràng buộc hoặc giả định ngầm trong mã nguồn bị phá vỡ>.
-- **Chiến lược khắc phục dự kiến (Proposed Fix Strategy)**: <Tóm tắt phương hướng sửa chữa>.
 
----
-*(🛑 Điểm dừng Review: Người dùng phê duyệt Section 1 & 2 trước khi chuyển sang Section 3 & 4)*
----
+### 2.2 Proposed Solution & Target Source Structure
+- **Cơ chế giải pháp cốt lõi (Core Fix Mechanism)**: <Mô tả phương án kỹ thuật xử lý triệt để nguyên nhân gốc>.
+- **Cấu trúc tệp thay đổi (Source Structure Changes)**:
+```text
+src/path/to/module/
+├── [MODIFY] target.service.ts       # Áp dụng surgical patch: xử lý điều kiện biên và fallback an toàn
+├── [NEW]    target-helper.ts        # Helper độc lập phục vụ validate/transform logic
+└── [MODIFY] target.service.spec.ts  # Test case tái hiện lỗi ban đầu (Red) và chống hồi quy (Green)
+```
 
-## Section 3. Directory Structure & Task Matrix
-### 3.1 Directory Structure Changes
-```text
-src/path/to/module/
-├── [MODIFY] target.service.ts       # Surgical patch fix root cause
-└── [NEW]    target.service.spec.ts  # Regression test case
-```
-
-### 3.2 Task Matrix
+## Section 3. Task Matrix & Dependency Graph
 | Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
 | :---: | :---: | :---: | :--- | :--- | :--- | :--- |
-| **1** | `[x]` | `[NEW]` | `path/to/test.spec.ts` | `describe('reproduction')...` | `None` | `npm test path/to/test.spec.ts` |
-| **2** | `[x]` | `[MODIFY]` | `path/to/target.ts` | `TargetClass.targetMethod` | `Order 1` | `npm test path/to/test.spec.ts` |
+| **1** | `[ ]` | `[MODIFY]` | `path/to/test.spec.ts` | `describe('reproduction')...` | `None` | `npm test path/to/test.spec.ts` |
+| **2** | `[ ]` | `[MODIFY]` | `path/to/target.ts` | `TargetClass.targetMethod` | `Order 1` | `npm test path/to/test.spec.ts` |
@@ -197,3 +192,2 @@
 ## Guardrails
 
-- **🛑 Strict RCA Review Gate**: Never touch source code or draft Section 3 & 4 before the user explicitly approves Section 1 & 2.
 - **Single Artifact Authority**: All investigation and debugging notes must be stored in `only-one/tasks/<...>/debug.md`.
```

### 3. `[MODIFY]` `.agents/workflows/only-one-debug.md`
> **Action**: Đồng bộ nội dung sửa đổi của `only-one-debug.md` sang workspace customization.

```diff
@@ -1,3 +1,3 @@
 ---
-description: Perform systematic Root Cause Analysis (RCA) with a mandatory Review Gate, document findings in debug.md, and deliver a minimal verified fix using disciplined red feedback loops.
+description: Perform systematic Root Cause Analysis (RCA), document findings in debug.md, and deliver an end-to-end minimal verified fix using disciplined red feedback loops.
 ---
@@ -17,3 +17,3 @@
 You are a **Senior Debugging Specialist**. Your core responsibilities:
-- Follow the disciplined **2-Phase Debugging Protocol** with a **Mandatory RCA Review Gate** before modifying source code.
+- Follow the disciplined **Continuous Debugging Protocol** using disciplined red feedback loops and minimal surgical patches.
 - Implement the **Dual-Layer Architecture (Bilingual Hybrid Mode)**:
@@ -21,3 +21,3 @@
   - **Human Layer (Vietnamese Narrative + English Technical Terms)**:
-    - Author Section 1 & 2 of `debug.md` in clear, concise Vietnamese narrative with standard English technical terms (*idempotency, race condition, root cause, reproduction test, AST seam, invariant, regression guard...*).
+    - Author Section 1 & 2 of `debug.md` in clear, concise Vietnamese narrative with standard English technical terms (*idempotency, race condition, root cause, reproduction test, AST seam, invariant, regression guard...*). Section 2 must clearly separate 2.1 Mechanical Root Cause from 2.2 Proposed Solution & Target Source Structure (with ASCII file tree and brief action notes per file).
   - **Machine Layer (Standardized English & Unified Diffs)**:
@@ -47,5 +47,5 @@
-## 2. Two-Phase Debugging Protocol with Mandatory Review Gate
+## 2. Step-by-Step Continuous Debugging Protocol
 
-### Phase 1 — Diagnosis & Root Cause Analysis (`diagnosing-bugs`)
+### Step 0 — Task Directory & `debug.md` Initialization
 1. Create `only-one/tasks/<YYYYMMDD-HHmmss>-debug-<kebab-case-slug>/` (if not already existing).
 2. Initialize `debug.md` with frontmatter `status: diagnosing`.
@@ -66,31 +66,13 @@
-#### Step 3 — Hypothesize & Instrument (`doubt-driven-development`)
+### Step 3 — Hypothesize & Instrument (`doubt-driven-development`)
 1. Formulate a specific, testable mechanical hypothesis distinguishing the symptom from the true root cause.
 2. Instrument with temporary logging or assertions to prove or disprove the hypothesis with runtime evidence.
-3. Record the root cause analysis, evidence, and violated invariants in **Section 2 (Root Cause Analysis & Hypotheses)** of `debug.md`.
+3. Record the root cause analysis, evidence, and violated invariants in **Section 2.1 (Mechanical Root Cause & Invariants)** of `debug.md`.
 
----
-
-### 🛑 MANDATORY RCA REVIEW GATE (Checkpoint)
-
-After completing Section 1 and Section 2 of `debug.md`:
-1. Save `debug.md` to disk.
-2. **STOP IMMEDIATELY (HARD STOP)** and present the diagnosis report in chat:
-   - **Symptom & Red Feedback Loop**: Error details and reproduction test command.
-   - **Root Cause & Instrumentation Evidence**: Detailed mechanical explanation.
-   - **Proposed Fix Strategy**: High-level approach for the surgical patch.
-3. **Wait for explicit user approval**:
-   - If user approves $\rightarrow$ Proceed to **Phase 2**.
-   - If user requests re-investigation $\rightarrow$ Return to Step 2 & 3 to refine hypothesis.
-
----
-
-### Phase 2 — Surgical Patch & Verification
-
-*(Execute only after explicit user approval at the RCA Review Gate)*
-
-#### Step 4 — Plan & Deliver Minimal Fix (`code-simplification`)
-1. Update `debug.md` frontmatter to `status: planning`.
-2. Assemble affected files and AST Seams into **Section 3 (Directory Structure & Task Matrix)** of `debug.md`.
-3. Draft Git-standard Unified Diff (` ```diff `) blocks in **Section 4 (Code Changes Unified Diff)** for both the regression test and the minimal code fix.
-4. Apply the surgical patch directly and remove temporary instrumentation logs.
+### Step 4 — Formulate Proposed Solution & Target Source Structure
+1. Formulate the core fix mechanism directly targeting the root cause.
+2. Construct the target source structure ASCII tree in **Section 2.2 (Proposed Solution & Target Source Structure)** of `debug.md`, annotating every affected file with `[NEW]`, `[MODIFY]`, or `[DELETE]` and a concise inline action note explaining how it will be modified.
+3. Update `debug.md` frontmatter to `status: planning`.
+4. Assemble affected files and AST Seams into **Section 3 (Task Matrix & Dependency Graph)** of `debug.md`.
+5. Draft Git-standard Unified Diff (` ```diff `) blocks in **Section 4 (Code Changes Unified Diff)** for both the regression test and the minimal code fix.
+6. Apply the surgical patch directly (or execute via `/only-one-apply`) and remove temporary instrumentation logs.
 
-#### Step 5 — Guard Against Regressions & Capture Lessons
+### Step 5 — Guard Against Regressions & Capture Lessons
 1. Execute the reproduction test from Step 1 and verify it turns **GREEN**.
@@ -129,7 +11,14 @@
-## Section 2. Root Cause Analysis & Hypotheses (Phân tích Nguyên nhân)
+## Section 2. Root Cause Analysis & Proposed Solution (Phân tích & Đề xuất Giải pháp)
+### 2.1 Mechanical Root Cause & Invariants
 - **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**: <Bản chất kỹ thuật bên dưới>.
 - **Bằng chứng & Dữ liệu thực nghiệm (Evidence)**: <Kết quả log/instrumentation chứng minh>.
 - **Invariants bị vi phạm**: <Ràng buộc hoặc giả định ngầm trong mã nguồn bị phá vỡ>.
-- **Chiến lược khắc phục dự kiến (Proposed Fix Strategy)**: <Tóm tắt phương hướng sửa chữa>.
 
----
-*(🛑 Điểm dừng Review: Người dùng phê duyệt Section 1 & 2 trước khi chuyển sang Section 3 & 4)*
----
+### 2.2 Proposed Solution & Target Source Structure
+- **Cơ chế giải pháp cốt lõi (Core Fix Mechanism)**: <Mô tả phương án kỹ thuật xử lý triệt để nguyên nhân gốc>.
+- **Cấu trúc tệp thay đổi (Source Structure Changes)**:
+```text
+src/path/to/module/
+├── [MODIFY] target.service.ts       # Áp dụng surgical patch: xử lý điều kiện biên và fallback an toàn
+├── [NEW]    target-helper.ts        # Helper độc lập phục vụ validate/transform logic
+└── [MODIFY] target.service.spec.ts  # Test case tái hiện lỗi ban đầu (Red) và chống hồi quy (Green)
+```
 
-## Section 3. Directory Structure & Task Matrix
-### 3.1 Directory Structure Changes
-```text
-src/path/to/module/
-├── [MODIFY] target.service.ts       # Surgical patch fix root cause
-└── [NEW]    target.service.spec.ts  # Regression test case
-```
-
-### 3.2 Task Matrix
+## Section 3. Task Matrix & Dependency Graph
 | Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
 | :---: | :---: | :---: | :--- | :--- | :--- | :--- |
-| **1** | `[x]` | `[NEW]` | `path/to/test.spec.ts` | `describe('reproduction')...` | `None` | `npm test path/to/test.spec.ts` |
-| **2** | `[x]` | `[MODIFY]` | `path/to/target.ts` | `TargetClass.targetMethod` | `Order 1` | `npm test path/to/test.spec.ts` |
+| **1** | `[ ]` | `[MODIFY]` | `path/to/test.spec.ts` | `describe('reproduction')...` | `None` | `npm test path/to/test.spec.ts` |
+| **2** | `[ ]` | `[MODIFY]` | `path/to/target.ts` | `TargetClass.targetMethod` | `Order 1` | `npm test path/to/test.spec.ts` |
@@ -197,3 +192,2 @@
 ## Guardrails
 
-- **🛑 Strict RCA Review Gate**: Never touch source code or draft Section 3 & 4 before the user explicitly approves Section 1 & 2.
 - **Single Artifact Authority**: All investigation and debugging notes must be stored in `only-one/tasks/<...>/debug.md`.
```

### 4. `[MODIFY]` `assets/workflows/only-one-apply.md`
> **Action**: Mở rộng workflow `only-one-apply` để hỗ trợ thực thi cả `debug.md` lẫn `plan.md`.

```diff
@@ -2,3 +2,3 @@
 ---
-description: "Implement tasks from a plan.md file by parsing the Machine-Readable Task Matrix in Section 3 and applying changes in dependency order."
+description: "Implement tasks from an approved plan.md or debug.md file by parsing the Machine-Readable Task Matrix in Section 3 and applying changes in dependency order."
 ---
@@ -8,7 +8,8 @@
 ```text
-/only-one-apply [<task-folder> | <plan-path>]
+/only-one-apply [<task-folder> | <plan-path> | <debug-path>]
 ```
 
-- **With `<task-folder>` or `<plan-path>`**: use the given task folder (e.g., `only-one/tasks/20260819-142500-soft-delete-machine/plan.md`) directly.
-- **Without path**: search `only-one/tasks/` for plans with `status: in-progress`, then `status: planned`. If multiple found, list them and ask the user to select one.
+- **With `<task-folder>`, `<plan-path>`, or `<debug-path>`**: use the given plan/debug file (e.g., `only-one/tasks/20260819-142500-soft-delete/plan.md` or `only-one/tasks/20260917-100000-debug-bug/debug.md`) directly. If a task folder is given, locate `plan.md` or `debug.md` within it (prefer `in-progress` > `planned`/`planning`).
+- **Without path**: search `only-one/tasks/` for active tasks:
+  ```bash
+  grep -rlE "status: (in-progress|planned|planning)" only-one/tasks/ --include="plan.md" --include="debug.md" 2>/dev/null
+  ```
@@ -17,4 +18,4 @@
 You are a **Senior Software Engineer**. Your core responsibilities:
-- Fast-path ingest the **Section 3.1 Machine-Readable Task Matrix** from `plan.md` in sub-second time.
-- Implement the changes described in `plan.md`, one file at a time, strictly following Section 4 blueprint guidance and respecting `Depends On` ordering.
+- Fast-path ingest the **Section 3 Machine-Readable Task Matrix** from `plan.md` or `debug.md` in sub-second time.
+- Implement the changes described in `plan.md` or `debug.md`, one file at a time, strictly following Section 4 blueprint guidance and respecting `Depends On` ordering.
 - Apply execution and quality disciplines (`incremental-implementation`, `test-driven-development`, `code-simplification`, `diagnosing-bugs`).
@@ -25,3 +26,3 @@
 ## Purpose
 
-Execute an approved plan with maximum machine efficiency and human clarity, verifying every file change against targeted test cases.
+Execute an approved plan or debug document with maximum machine efficiency and human clarity, verifying every file change against targeted test cases.
@@ -43,15 +44,15 @@
-### Step 1 — Locate and read the plan
+### Step 1 — Locate and read the plan or debug document
 
 **If a path or task folder is provided:**
-1. Read the `plan.md` file at the given path/folder.
-2. If the file does not exist, report error and stop.
+1. If target is a file path (`plan.md` or `debug.md`), read it directly.
+2. If target is a task folder, check for `plan.md` or `debug.md`. If both exist, prioritize `in-progress` $\rightarrow$ `planned`/`planning`.
+3. If neither exists, report error and stop.
 
 **If no path is provided:**
 ```bash
-grep -rl "status: in-progress" only-one/tasks/ --include="plan.md" 2>/dev/null
-grep -rl "status: planned" only-one/tasks/ --include="plan.md" 2>/dev/null
+grep -rlE "status: in-progress" only-one/tasks/ --include="plan.md" --include="debug.md" 2>/dev/null
+grep -rlE "status: (planned|planning)" only-one/tasks/ --include="plan.md" --include="debug.md" 2>/dev/null
 ```
 - Prefer `in-progress` over `planned`/`planning`.
 - If multiple found, display the list and ask the user to select.
-- If none found, report: "No active plan found in only-one/tasks/." and stop.
+- If none found, report: "No active plan or debug task found in only-one/tasks/." and stop.
@@ -70,7 +71,8 @@
-### Step 2 — Validate plan is approved & Set status to in-progress
+### Step 2 — Validate document & Set status to in-progress
 
 Check the frontmatter `status` field:
-- `planned` $\rightarrow$ update `plan.md` frontmatter to `status: in-progress`.
+- `planned` / `planning` $\rightarrow$ update frontmatter to `status: in-progress`.
 - `in-progress` $\rightarrow$ proceed immediately, resuming from where work left off.
-- `done` $\rightarrow$ report: "This plan is already marked done." and stop.
+- `done` / `fixed` $\rightarrow$ report: "This task is already marked done/fixed." and stop.
@@ -79,6 +81,6 @@
-### Step 3 — Ingest Directory Structure & Parse Task Matrix
+### Step 3 — Ingest Source Structure & Parse Task Matrix
 
-1. **Review Section 3.1 Directory Structure Changes**: Ingest the ASCII directory tree to establish an immediate mental model of all touched files (`[NEW]`, `[MODIFY]`, `[DELETE]`, `[RENAME]`).
-2. **Parse Section 3.2 Task Matrix & Dependency Graph**:
-   - Jump to **Section 3.2 Task Matrix & Dependency Graph** in `plan.md`.
+1. **Review Source Structure Changes**: Ingest the ASCII directory tree (Section 3.1 in `plan.md` or Section 2.2 in `debug.md`) to establish an immediate mental model of all touched files (`[NEW]`, `[MODIFY]`, `[DELETE]`, `[RENAME]`).
+2. **Parse Section 3 Task Matrix & Dependency Graph**:
+   - Jump to **Section 3 Task Matrix & Dependency Graph** in `plan.md` or `debug.md`.
    - Extract the ordered sequence: `Order`, `Status`, `Action`, `File Path`, `Target Symbols`, `Depends On`, `Fast Test Command`.
@@ -118,5 +120,5 @@
-2. **Update `plan.md` Verification Evidence & Completion**:
-   - Update Section 5 of `plan.md` by marking verified test items with `[x]` and appending concrete test execution evidence (e.g., `PASS - X tests passed`).
-   - Update `plan.md` frontmatter:
+2. **Update Document Verification Evidence & Completion**:
+   - Update Section 5 of `plan.md` or `debug.md` by marking verified test items with `[x]` and appending concrete test execution evidence (e.g., `PASS - X tests passed`).
+   - Update frontmatter:
    ```yaml
-   status: done
+   status: done   # (hoặc status: fixed cho debug.md)
    completed_at: <YYYY-MM-DD>
```

### 5. `[MODIFY]` `.agents/workflows/only-one-apply.md`
> **Action**: Đồng bộ nội dung sửa đổi của `only-one-apply.md` sang workspace customization.

```diff
@@ -2,3 +2,3 @@
 ---
-description: "Implement tasks from a plan.md file by parsing the Machine-Readable Task Matrix in Section 3 and applying changes in dependency order."
+description: "Implement tasks from an approved plan.md or debug.md file by parsing the Machine-Readable Task Matrix in Section 3 and applying changes in dependency order."
 ---
@@ -8,7 +8,8 @@
 ```text
-/only-one-apply [<task-folder> | <plan-path>]
+/only-one-apply [<task-folder> | <plan-path> | <debug-path>]
 ```
 
-- **With `<task-folder>` or `<plan-path>`**: use the given task folder (e.g., `only-one/tasks/20260819-142500-soft-delete-machine/plan.md`) directly.
-- **Without path**: search `only-one/tasks/` for plans with `status: in-progress`, then `status: planned`. If multiple found, list them and ask the user to select one.
+- **With `<task-folder>`, `<plan-path>`, or `<debug-path>`**: use the given plan/debug file (e.g., `only-one/tasks/20260819-142500-soft-delete/plan.md` or `only-one/tasks/20260917-100000-debug-bug/debug.md`) directly. If a task folder is given, locate `plan.md` or `debug.md` within it (prefer `in-progress` > `planned`/`planning`).
+- **Without path**: search `only-one/tasks/` for active tasks:
+  ```bash
+  grep -rlE "status: (in-progress|planned|planning)" only-one/tasks/ --include="plan.md" --include="debug.md" 2>/dev/null
+  ```
@@ -17,4 +18,4 @@
 You are a **Senior Software Engineer**. Your core responsibilities:
-- Fast-path ingest the **Section 3.1 Machine-Readable Task Matrix** from `plan.md` in sub-second time.
-- Implement the changes described in `plan.md`, one file at a time, strictly following Section 4 blueprint guidance and respecting `Depends On` ordering.
+- Fast-path ingest the **Section 3 Machine-Readable Task Matrix** from `plan.md` or `debug.md` in sub-second time.
+- Implement the changes described in `plan.md` or `debug.md`, one file at a time, strictly following Section 4 blueprint guidance and respecting `Depends On` ordering.
 - Apply execution and quality disciplines (`incremental-implementation`, `test-driven-development`, `code-simplification`, `diagnosing-bugs`).
@@ -25,3 +26,3 @@
 ## Purpose
 
-Execute an approved plan with maximum machine efficiency and human clarity, verifying every file change against targeted test cases.
+Execute an approved plan or debug document with maximum machine efficiency and human clarity, verifying every file change against targeted test cases.
@@ -43,15 +44,15 @@
-### Step 1 — Locate and read the plan
+### Step 1 — Locate and read the plan or debug document
 
 **If a path or task folder is provided:**
-1. Read the `plan.md` file at the given path/folder.
-2. If the file does not exist, report error and stop.
+1. If target is a file path (`plan.md` or `debug.md`), read it directly.
+2. If target is a task folder, check for `plan.md` or `debug.md`. If both exist, prioritize `in-progress` $\rightarrow$ `planned`/`planning`.
+3. If neither exists, report error and stop.
 
 **If no path is provided:**
 ```bash
-grep -rl "status: in-progress" only-one/tasks/ --include="plan.md" 2>/dev/null
-grep -rl "status: planned" only-one/tasks/ --include="plan.md" 2>/dev/null
+grep -rlE "status: in-progress" only-one/tasks/ --include="plan.md" --include="debug.md" 2>/dev/null
+grep -rlE "status: (planned|planning)" only-one/tasks/ --include="plan.md" --include="debug.md" 2>/dev/null
 ```
 - Prefer `in-progress` over `planned`/`planning`.
 - If multiple found, display the list and ask the user to select.
-- If none found, report: "No active plan found in only-one/tasks/." and stop.
+- If none found, report: "No active plan or debug task found in only-one/tasks/." and stop.
@@ -70,7 +71,8 @@
-### Step 2 — Validate plan is approved & Set status to in-progress
+### Step 2 — Validate document & Set status to in-progress
 
 Check the frontmatter `status` field:
-- `planned` $\rightarrow$ update `plan.md` frontmatter to `status: in-progress`.
+- `planned` / `planning` $\rightarrow$ update frontmatter to `status: in-progress`.
 - `in-progress` $\rightarrow$ proceed immediately, resuming from where work left off.
-- `done` $\rightarrow$ report: "This plan is already marked done." and stop.
+- `done` / `fixed` $\rightarrow$ report: "This task is already marked done/fixed." and stop.
@@ -79,6 +81,6 @@
-### Step 3 — Ingest Directory Structure & Parse Task Matrix
+### Step 3 — Ingest Source Structure & Parse Task Matrix
 
-1. **Review Section 3.1 Directory Structure Changes**: Ingest the ASCII directory tree to establish an immediate mental model of all touched files (`[NEW]`, `[MODIFY]`, `[DELETE]`, `[RENAME]`).
-2. **Parse Section 3.2 Task Matrix & Dependency Graph**:
-   - Jump to **Section 3.2 Task Matrix & Dependency Graph** in `plan.md`.
+1. **Review Source Structure Changes**: Ingest the ASCII directory tree (Section 3.1 in `plan.md` or Section 2.2 in `debug.md`) to establish an immediate mental model of all touched files (`[NEW]`, `[MODIFY]`, `[DELETE]`, `[RENAME]`).
+2. **Parse Section 3 Task Matrix & Dependency Graph**:
+   - Jump to **Section 3 Task Matrix & Dependency Graph** in `plan.md` or `debug.md`.
    - Extract the ordered sequence: `Order`, `Status`, `Action`, `File Path`, `Target Symbols`, `Depends On`, `Fast Test Command`.
@@ -118,5 +120,5 @@
-2. **Update `plan.md` Verification Evidence & Completion**:
-   - Update Section 5 of `plan.md` by marking verified test items with `[x]` and appending concrete test execution evidence (e.g., `PASS - X tests passed`).
-   - Update `plan.md` frontmatter:
+2. **Update Document Verification Evidence & Completion**:
-   - Update Section 5 of `plan.md` by marking verified test items with `[x]` and appending concrete test execution evidence (e.g., `PASS - X tests passed`).
+   - Update Section 5 of `plan.md` or `debug.md` by marking verified test items with `[x]` and appending concrete test execution evidence (e.g., `PASS - X tests passed`).
    - Update frontmatter:
    ```yaml
-   status: done
+   status: done   # (hoặc status: fixed cho debug.md)
    completed_at: <YYYY-MM-DD>
```

## Section 5. Test Cases & Verification

- **Automated Tests**:
  - `[x]` `npm test test/core/assets/version-gate.test.ts`: Xác minh version hợp lệ và mapping asset chính xác (`PASS - 2 tests passed`).
  - `[x]` `npm test test/core/workflow-registry.test.ts`: Xác minh đăng ký workflow trong package (`PASS - 2 tests passed`).
  - `[x]` `npm test test/core/agent-workflows.test.ts`: Xác minh tính tương thích của workflow với agent (`PASS - 7 tests passed`).
  - `[x]` Full Test Suite (`npm test`): Toàn bộ test suite pass (`PASS - 230 tests passed in 55 files`).
- **Manual Checks**:
  - `[x]` Kiểm tra tính đồng bộ nội dung giữa `assets/workflows/` và `.agents/workflows/`.
