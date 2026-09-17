---
status: done
slug: fix-debug-workflow-and-doc-spec
started_at: 2026-09-17
completed_at: 2026-09-17
pr_url: ~
branch: ~
---

# Plan: Tái cấu trúc Workflow only-one-debug & Chuẩn hóa Tài liệu debug.md

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- `assets/workflows/only-one-debug.md` và `.agents/workflows/only-one-debug.md` hiện tại quy định Step 4.6 và Step 5 trực tiếp sửa đổi source code và thực thi nghiệm thu ngay trong `/only-one-debug`, làm phá vỡ ranh giới vòng đời (Lifecycle Isolation) và bỏ qua Review Gate của developer.
- `/only-one-apply` đã có sẵn cơ chế nạp `debug.md` (hỗ trợ `status: planning`/`in-progress`), nhưng `/only-one-debug` lại kiêm nhiệm luôn nhiệm vụ của apply.
- Cấu trúc template `debug.md` cần được chuẩn hóa 5 Section chi tiết, đặc biệt là Section 4 phải có mô tả thay đổi, AST seams và Unified Diff rõ ràng cho từng file.
- Invariants bắt buộc tuân thủ: Single Source of Truth giữa `assets/` và `.agents/`, version bump tuân thủ cơ số 10 trong `assets/workflows/index.ts`, và không làm ảnh hưởng đến `/only-one-apply` hay `/only-one-plan`.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
- Kế thừa 100% cơ chế tại [concept.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/only-one/tasks/20260917-112500-fix-debug-workflow-and-doc-spec/concept.md); không phát sinh Type Contract hay DTO mới.
- **Workflow AST & Protocol Seams**:
  - `assets/workflows/only-one-debug.md`: Cập nhật Role, Purpose, Protocol (Step 4 & Step 5), Template 5 Sections, Summary Report, và Guardrails.
  - `.agents/workflows/only-one-debug.md`: Đồng bộ 100% nội dung với `assets/workflows/only-one-debug.md`.
  - `assets/workflows/index.ts`: Cập nhật manifest của `only-one-debug` (`version: '0.0.4'`).
  - `only-one/rules.md`: Bổ sung quy tắc âm `[NEVER]` cô lập vòng đời `/only-one-debug`.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)
```text
only-one-cli/
├── [MODIFY] assets/workflows/only-one-debug.md   # Tái cấu trúc protocol, bổ sung Review Gate, chuẩn hóa 5 section debug.md
├── [MODIFY] .agents/workflows/only-one-debug.md  # Đồng bộ 100% với assets template
├── [MODIFY] assets/workflows/index.ts           # Bump version lên 0.0.4
└── [MODIFY] only-one/rules.md                   # Thêm negative rule về Lifecycle Isolation cho debug workflow
```

### 3.2 Task Matrix & Dependency Graph
| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-debug.md` | Protocol Steps 4-5, Template Section 1-5, Guardrails | `None` | `npm test test/core/assets/version-gate.test.ts` |
| **2** | `[x]` | `[MODIFY]` | `.agents/workflows/only-one-debug.md` | Protocol Steps 4-5, Template Section 1-5, Guardrails | `Order 1` | `npm test test/core/workflow-registry.test.ts` |
| **3** | `[x]` | `[MODIFY]` | `assets/workflows/index.ts` | `WORKFLOWS[name='only-one-debug']` version bump | `Order 1` | `npm test test/core/assets/version-gate.test.ts` |
| **4** | `[x]` | `[MODIFY]` | `only-one/rules.md` | Negative rule for `/only-one-debug` lifecycle | `None` | `npm test` |

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `assets/workflows/only-one-debug.md`
> **Action**: Cập nhật Role, Protocol (Step 4 & Step 5 Terminal Gate), Template 5 Section chi tiết và Guardrails cho workflow debug.

```diff
@@ -2,3 +2,3 @@
-description: Perform systematic Root Cause Analysis (RCA), document findings in debug.md, and deliver an end-to-end minimal verified fix using disciplined red feedback loops.
+description: Perform systematic Root Cause Analysis (RCA), document findings in debug.md, and formulate an executable diff-centric patch blueprint with a red feedback loop.
---
@@ -17,12 +17,12 @@
 You are a **Senior Debugging Specialist**. Your core responsibilities:
 - Follow the disciplined **Continuous Debugging Protocol** using disciplined red feedback loops and minimal surgical patches.
 - Implement the **Dual-Layer Architecture (Bilingual Hybrid Mode)**:
   - **Human Layer (Vietnamese Narrative + English Technical Terms)**:
     - Author Section 1 & 2 of `debug.md` in clear, concise Vietnamese narrative with standard English technical terms (*idempotency, race condition, root cause, reproduction test, AST seam, invariant, regression guard...*).
     - Section 2 must clearly separate **2.1 Mechanical Root Cause & Invariants** from **2.2 Proposed Solution & Target Source Structure** (with an ASCII file tree and brief action notes per file).
   - **Machine Layer (Standardized English & Unified Diffs)**:
     - Section 3 must use the structured **Task Matrix & Dependency Graph** with standardized columns: `Order`, `Status`, `Action`, `File Path`, `Target Symbols / AST Seams`, `Depends On`, `Fast Test Command`.
-    - Section 4 must provide Git-standard **Unified Diff (` ```diff `)** blocks with context lines, deleted lines (`-`), and added lines (`+`).
+    - Section 4 must provide detailed file-by-file change descriptions (Action, Rationale, AST Seams) and Git-standard **Unified Diff (` ```diff `)** blocks.
 - Never guess-and-patch or treat symptoms instead of root causes.
-- Verify the root cause with an exact reproduction test that goes red, apply a surgical minimal fix, and guard against future regressions.
+- Verify the root cause with an exact reproduction test that goes red, formulate the surgical minimal patch blueprint, and hand off to `/only-one-apply`. Do not modify product source code directly during this workflow.
@@ -31,3 +31,3 @@
-Systematically isolate, diagnose, instrument, document in `debug.md`, formulate solution architecture with file-by-file action notes, fix, and permanently guard against bugs using the `diagnosing-bugs` framework.
+Systematically isolate, diagnose, instrument, document in `debug.md`, formulate solution architecture with file-by-file action notes, task matrix, and unified diffs, stopping at the review gate for execution by `/only-one-apply`.
@@ -70,20 +70,18 @@
 ### Step 4 — Formulate Proposed Solution & Target Source Structure
 1. Formulate the core fix mechanism directly targeting the root cause.
 2. Construct the target source structure ASCII tree in **Section 2.2 (Proposed Solution & Target Source Structure)** of `debug.md`, annotating every affected file with `[NEW]`, `[MODIFY]`, or `[DELETE]` and a concise inline action note explaining how it will be modified.
 3. Update `debug.md` frontmatter to `status: planning`.
 4. Assemble affected files and AST Seams into **Section 3 (Task Matrix & Dependency Graph)** of `debug.md`.
-5. Draft Git-standard Unified Diff (` ```diff `) blocks in **Section 4 (Code Changes Unified Diff)** for both the regression test and the minimal code fix.
-6. Apply the surgical patch directly (or execute via `/only-one-apply`) and remove temporary instrumentation logs.
+5. Draft detailed change descriptions and Git-standard Unified Diff (` ```diff `) blocks in **Section 4 (Code Changes)** for both the regression test and the minimal code fix.
+6. Remove any temporary instrumentation logging or assertions.
 
-### Step 5 — Guard Against Regressions & Capture Lessons
-1. Execute the reproduction test from Step 1 and verify it turns **GREEN**.
-2. Run the full repository test suite (`npm test`, linting, typechecking) to verify zero collateral regressions.
-3. Complete **Section 5 (Verification & Regression Guard)** in `debug.md`.
-4. If the bug was caused by a subtle trap or invalid assumption, record a negative rule in `only-one/rules.md`:
-   ```markdown
-   - **[NEVER]** <Action to avoid> — <Reason / Bug context>
-   - **[AVOID]** <Anti-pattern to avoid> — <Reason / Bug context>
-   ```
-5. Update frontmatter to `status: fixed`, record `completed_at`, and save `debug.md`.
+### Step 5 — Review Gate & Next Steps (🛑 Mandatory Terminal Gate)
+1. Save `debug.md` at `only-one/tasks/<YYYYMMDD-HHmmss>-debug-<slug>/debug.md`.
+2. 🛑 **STOP IMMEDIATELY**: Do NOT modify any product source code or execute the fix during `/only-one-debug`.
+3. Present the summary report and guide the developer to run:
+   ```text
+   Tài liệu chẩn đoán & kế hoạch vá lỗi đã hoàn tất tại: only-one/tasks/<YYYYMMDD-HHmmss>-debug-<slug>/debug.md
+   Để áp dụng bản vá và chạy nghiệm thu chống hồi quy, hãy chạy:
+   /only-one-apply only-one/tasks/<YYYYMMDD-HHmmss>-debug-<slug>/debug.md
+   ```
@@ -133,12 +131,34 @@
-## Section 4. Code Changes (Unified Diff)
-### 1. `[MODIFY]` `path/to/test.spec.ts`
-> **Action**: Thêm test case tái hiện lỗi và chống hồi quy (Regression Guard).
-```diff
-...
-```
-
-### 2. `[MODIFY]` `path/to/target.ts`
-> **Action**: Áp dụng bản vá tối giản (Surgical Minimal Patch).
-```diff
-...
-```
+## Section 4. Code Changes (Unified Diff & Chi tiết Thay đổi)
+Mô tả chi tiết từng file cần can thiệp theo đúng thứ tự trong Section 3:
+
+### 1. `[MODIFY]` `path/to/test.spec.ts`
+- **Mục đích thay đổi (Action / Rationale)**: Thêm test case tái hiện lỗi ban đầu (Red Feedback Loop) và làm chốt chặn chống hồi quy (Regression Guard).
+- **Điểm can thiệp (AST Seams / Target Symbols)**: `describe('reproduction error')`
+- **Chi tiết thay đổi mã nguồn**:
+```diff
+@@ -10,4 +10,12 @@
+ existingTest();
++
++it('should handle edge case correctly without throwing', async () => {
++  // reproduction test proving the bug
++  const result = await service.targetMethod(invalidInput);
++  expect(result).toBeDefined();
++});
+```
+
+### 2. `[MODIFY]` `path/to/target.ts`
+- **Mục đích thay đổi (Action / Rationale)**: Áp dụng bản vá tối giản (Surgical Minimal Patch) xử lý điều kiện biên theo phân tích RCA ở Section 2.
+- **Điểm can thiệp (AST Seams / Target Symbols)**: `TargetClass.targetMethod`
+- **Chi tiết thay đổi mã nguồn**:
+```diff
+@@ -45,6 +45,8 @@
+ function targetMethod(input) {
++  if (!input || !input.id) {
++    return fallbackValue;
++  }
+   return input.id;
+ }
+```
+*(Đối với file `[NEW]`: hiển thị trọn vẹn source code khởi tạo)*
+*(Đối với file `[DELETE]`: nêu rõ lý do xoá và các references đã verify)*
@@ -147,7 +167,8 @@
-## Section 5. Verification & Regression Guard
-- **Automated Tests**:
-  - `npm test <reproduction-test-path>`: `PASS (Green)`
-  - Full Test Suite: `PASS`
-  - Lint / Typecheck: `PASS`
-- **Bài học kinh nghiệm (Lessons Learned)**:
-  - <Cập nhật quy tắc âm vào only-one/rules.md nếu phát hiện trap/anti-pattern>.
+## Section 5. Verification & Regression Guard
+*(Phần này được cập nhật khi chạy `/only-one-apply`)*
+- **Automated Tests**:
+  - `[ ]` `npm test <reproduction-test-path>`: `PENDING -> PASS (Green)`
+  - `[ ]` Full Test Suite: `PENDING -> PASS`
+  - `[ ]` Lint / Typecheck: `PENDING -> PASS`
+- **Bài học kinh nghiệm & Quy tắc phòng ngừa (Lessons Learned)**:
+  - <Ghi nhận anti-pattern vào only-one/rules.md nếu có>.
@@ -158,13 +179,13 @@
-## 4. Summary Report (Bilingual Hybrid)
-
-After completing the fix, display a concise markdown summary in Vietnamese narrative with English technical terms:
-
-```markdown
-## Debug & RCA Summary (Tổng kết Phân tích & Vá Lỗi)
-
-- **Tài liệu Task**: `only-one/tasks/<YYYYMMDD-HHmmss>-debug-<slug>/debug.md`
-- **Triệu chứng lỗi (Symptom)**: <Mô tả lỗi đã ghi nhận>
-- **Nguyên nhân gốc rễ (Root Cause)**: <Giải thích bản chất kỹ thuật>
-- **Bản vá tối giản (Fix Applied)**: <Danh sách file đã sửa theo Section 3 & 4>
-- **Chốt chặn chống hồi quy (Regression Guard)**: <Test case tự động đã thêm>
-- **Kết quả nghiệm thu (Verification)**: `PASS (Green)`
-- **Bài học kinh nghiệm (Lessons Learned)**: <Quy tắc âm mới trong rules.md, nếu có>
-```
+## 4. Summary Report (Bilingual Hybrid)
+
+Display a concise markdown summary in Vietnamese narrative with English technical terms before stopping:
+
+```markdown
+## Debug & RCA Blueprint Summary (Tổng kết Phân tích & Kế hoạch Vá Lỗi)
+
+- **Tài liệu Debug**: `only-one/tasks/<YYYYMMDD-HHmmss>-debug-<slug>/debug.md`
+- **Triệu chứng lỗi (Symptom)**: <Mô tả lỗi đã ghi nhận>
+- **Nguyên nhân cơ học (Mechanical Root Cause)**: <Giải thích bản chất kỹ thuật>
+- **Phương án xử lý (Proposed Fix)**: <Tóm tắt giải pháp kỹ thuật>
+- **Danh sách file can thiệp**: <Danh sách file theo Section 3 & 4>
+- **Lệnh test tái hiện (Red Loop)**: `<Fast Test Command>`
+```
@@ -176,7 +197,8 @@
-## Guardrails
-
-- **Single Artifact Authority**: All investigation and debugging notes must be stored in `only-one/tasks/<...>/debug.md`.
-- **Enforce Bilingual Hybrid Documentation**: Author narrative in Vietnamese; preserve English for code, symbols, file paths, and technical terminology.
-- Never apply a fix without first reproducing the failure with a red feedback loop.
-- Never perform unrelated refactoring during a bug fix.
-- Always include an automated regression test.
-- Keep the fix minimal, surgical, and scoped directly to the defect.
+## Guardrails
+
+- **🛑 Strict Lifecycle Isolation (Zero Direct Code Modifications)**: `/only-one-debug` is strictly a diagnostic, RCA, and patch planning workflow. The agent MUST NEVER modify product source code or execute the fix during `/only-one-debug`. Execution strictly belongs to `/only-one-apply`.
+- **Single Artifact Authority**: All investigation, RCA, task matrix, and diffs must be stored in `only-one/tasks/<...>/debug.md`.
+- **Enforce Bilingual Hybrid Documentation**: Author narrative in Vietnamese; preserve English for code, symbols, file paths, and technical terminology.
+- Never formulate a fix without first reproducing the failure with a red feedback loop.
+- Never perform unrelated refactoring during a bug fix.
+- Always include an automated regression test.
+- Keep the fix minimal, surgical, and scoped directly to the defect.
```

### 2. `[MODIFY]` `.agents/workflows/only-one-debug.md`
> **Action**: Đồng bộ 100% nội dung với `assets/workflows/only-one-debug.md`.

```diff
@@ -2,3 +2,3 @@
-description: Perform systematic Root Cause Analysis (RCA), document findings in debug.md, and deliver an end-to-end minimal verified fix using disciplined red feedback loops.
+description: Perform systematic Root Cause Analysis (RCA), document findings in debug.md, and formulate an executable diff-centric patch blueprint with a red feedback loop.
---
(Đồng bộ 100% các dòng tương tự như file assets/workflows/only-one-debug.md)
```

### 3. `[MODIFY]` `assets/workflows/index.ts`
> **Action**: Bump version của workflow `only-one-debug` từ `0.0.3` lên `0.0.4`.

```diff
@@ -49,3 +49,3 @@
         name: 'only-one-debug',
-        version: '0.0.3',
+        version: '0.0.4',
         description:
```

### 4. `[MODIFY]` `only-one/rules.md`
> **Action**: Bổ sung quy tắc âm `[NEVER]` về Lifecycle Isolation cho workflow `/only-one-debug`.

```diff
@@ -30,0 +31,1 @@
+- **[NEVER]** Không tự ý sửa đổi mã nguồn sản phẩm hoặc thực thi bản vá trong lượt chạy của workflow `/only-one-debug`. Workflow này chỉ chẩn đoán lỗi, dựng Red feedback loop, phân tích RCA và lập kế hoạch vá trong `debug.md` trước khi bàn giao cho `/only-one-apply` (Strict Lifecycle Isolation).
```

## Section 5. Test Cases & Verification
- **Automated Tests**:
  - `npm test test/core/assets/version-gate.test.ts`: `PASS`
  - `npm test test/core/workflow-registry.test.ts`: `PASS`
  - `npm test`: `PASS (55 test files, 231 tests passed)`
  - `npm run format:check`: `PASS`
- **Manual Checks**:
  - [x] Đã đối chiếu 100% nội dung giữa `assets/workflows/only-one-debug.md` và `.agents/workflows/only-one-debug.md`.
  - [x] Đã kiểm tra `git status` đảm bảo không có file rác / không có `walkthrough.md`.

