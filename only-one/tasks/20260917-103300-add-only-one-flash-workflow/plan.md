---
status: completed
slug: add-only-one-flash-workflow
started_at: 2026-09-17
completed_at: 2026-09-17
pr_url: ~
branch: ~
---

# Implementation Plan: Thêm Workflow "only-one-flash" Cho Quick Tasks

Tài liệu này chi tiết hóa kế hoạch triển khai workflow `only-one-flash` để hỗ trợ thực hiện nhanh các tác vụ sửa đổi mã nguồn nhỏ gọn trong 1 turn duy nhất (One-Shot Execution), zero disk plan footprint nhưng vẫn bảo toàn 100% các tiêu chuẩn kỹ thuật (`only-one/rules.md`, tech skills, reuse-first, và fast verification).

---

## 1. Current State & Target Seams

### Current State
- `assets/workflows/index.ts` đăng ký 10 workflows: `only-one-idea`, `only-one-plan`, `only-one-apply`, `only-one-debug`, `only-one-review`, `only-one-conflict`, `only-one-clockify`, `only-one-intranet`, `only-one-pr-git`, `only-one-clean`.
- Các workflows hiện tại phục vụ quy trình chuẩn (Heavy / Standard SDLC) qua 3 giai đoạn độc lập: Ideation (`concept.md`) $\rightarrow$ Planning (`plan.md`) $\rightarrow$ Execution (`apply`).
- Chưa có workflow nào tối ưu cho Quick Tasks / Hotfixes (vừa nhanh, vừa không tạo doc trên disk, vừa có bản tóm tắt kế hoạch tinh gọn tập trung vào Mô tả, Target và Verification, vừa tuân thủ coding standards và có test loop).
- `assets/combos/index.ts` phân phối các workflow cho `frontend-flow`, `backend-flow`, `full-sdlc-flow`.

### Target Seams
- **Asset Workflow Definition**: `assets/workflows/only-one-flash.md` [NEW].
- **Agent Workflow Sync**: `.agents/workflows/only-one-flash.md` [NEW].
- **Workflow Manifest Registry**: `assets/workflows/index.ts` [MODIFY] - đăng ký `only-one-flash` với `version: '0.0.1'` và `requiredSkills`.
- **Combos Manifest Registry**: `assets/combos/index.ts` [MODIFY] - bổ sung `only-one-flash` vào `frontend-flow`, `backend-flow`, `full-sdlc-flow`.
- **Integrity Unit Tests**: `test/core/workflow-registry.test.ts` [MODIFY] - bổ sung test case đảm bảo `only-one-flash` được đăng ký và asset tồn tại.

---

## 2. Detailed Technical Design & Code Contracts

### Workflow Specification Contract: `only-one-flash.md`
Workflow `only-one-flash` kế thừa các kỷ luật cốt lõi từ `only-one-plan` (ingestion & reuse audit) và `only-one-apply` (incremental apply & test-driven feedback):

```text
/only-one-flash <mô tả yêu cầu thay đổi / bug fix / hotfix>
```

#### Bảng `## 1. Skills Catalog` (Bắt buộc theo rule repo)
- `context-engineering`: Nạp high-signal context (Negative rules trong `only-one/rules.md`, targeted `archives/`, và tech skills).
- `incremental-implementation`: Sửa file an toàn, giữ vững type contracts và clean diffs.
- `code-simplification`: YAGNI, dọn dẹp dead code, không tạo speculative wrappers.
- `test-driven-development`: Thực thi kiểm thử / typecheck theo Beyoncé Rule.
- `diagnosing-bugs`: Khắc phục lỗi compiler/linter/test theo Red Feedback Loop có kỷ luật.

#### Quy trình 4 bước thực thi liền mạch (Autonomous One-Shot):
1. **Step 1 — Rapid Seam, Governance & Target Rules Ingestion (Internal)**:
   - Định vị file & symbol mục tiêu qua `grep_search` / `list_dir`.
   - **Reuse-First Audit**: Quét `src/utils/`, `src/helpers/`, `src/hooks/`, `src/common/` để tái sử dụng logic sẵn có.
   - **Only-One Governance**: Đọc ngầm `only-one/rules.md` (các điều cấm `[NEVER]`, `[ALWAYS]`, `[AVOID]`), tra cứu `only-one/archives/*.md` theo domain liên quan, và đọc `only-one/CONTEXT.md`.
   - **Target-Driven Skills**: Chỉ nạp ngầm `SKILL.md` và `.agents/rules/` của framework tương ứng.
2. **Step 2 — Emit In-Chat Plan**:
   - Xuất bản kế hoạch cực ngắn gọn, trực quan trong chat output gồm 3 trường cốt lõi: **Mô tả**, **Target (cấu trúc source kèm mô tả ngắn gọn)**, và **Verification**. Zero file footprint trên disk.
3. **Step 3 — Direct Strict Apply**:
   - Áp dụng thay đổi trực tiếp bằng `replace_file_content` hoặc `multi_replace_file_content`.
   - Tuân thủ 100% coding style và các quy chuẩn kỹ thuật đã nạp ở Step 1.
4. **Step 4 — Fast Verification & Walkthrough**:
   - Chạy lệnh test tương ứng (`Fast Test Command`) hoặc build/typecheck.
   - Báo cáo kết quả walkthrough ngắn gọn 1-2 dòng trong chat.

---

## 3. Machine-Readable Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | completed | NEW | `assets/workflows/only-one-flash.md` | `Workflow Definition` | - | `npm test -- test/core/workflow-registry.test.ts` |
| 2 | completed | NEW | `.agents/workflows/only-one-flash.md` | `Agent Local Workflow Asset` | 1 | `npm test -- test/core/workflow-registry.test.ts` |
| 3 | completed | MODIFY | `assets/workflows/index.ts` | `WORKFLOWS` | 1 | `npm test -- test/core/workflow-registry.test.ts` |
| 4 | completed | MODIFY | `assets/combos/index.ts` | `COMBOS` | 3 | `npm test -- test/commands/combo/combo.test.ts` |
| 5 | completed | MODIFY | `test/core/workflow-registry.test.ts` | `workflow registry integrity` | 3 | `npm test -- test/core/workflow-registry.test.ts` |

---

## 4. Code Changes Unified Diff

### Task 1 & 2: `assets/workflows/only-one-flash.md` & `.agents/workflows/only-one-flash.md` [NEW]

```diff
+---
+description: "Execute small, rapid tasks in a single turn with zero disk plan footprint, ultra-clean in-chat plan (Mô tả, Target cấu trúc source, Verification), strict rule/skill compliance, and fast verification."
+---
+
+## Input
+
+```text
+/only-one-flash <change description, bug fix, or quick task>
+```
+
+If input is missing or empty, ask the user to provide a brief description of the task.
+
+## Role
+
+You are a **Senior Software Engineer** executing high-speed, high-precision code modifications. Your core responsibilities:
+- Perform rapid, targeted codebase research without generating task folders or markdown planning files on disk (**Zero Disk Plan Footprint**).
+- Output an ultra-clean, structured plan directly into the chat response before applying code changes (containing only **Mô tả**, **Target** source structure with brief descriptions, and **Verification**).
+- Ingest and strictly enforce `only-one/rules.md`, relevant `only-one/archives/*.md`, `only-one/CONTEXT.md`, and framework-specific skills (`SKILL.md`) in working memory without cluttering the chat output.
+- Apply code modifications in thin, clean slices adhering to project coding conventions, YAGNI, and the Reuse-First Invariant.
+- Run the targeted test/typecheck command immediately and provide a concise summary walkthrough.
+
+## Purpose
+
+Provide a rapid fast-track lane for micro-tasks and hotfixes, combining the research discipline of `/only-one-plan` with the execution rigor of `/only-one-apply` in a seamless single turn.
+
+---
+
+## 1. Skills Catalog (Fast-Track Execution Disciplines)
+
+| Skill | Trigger condition (Use When) | Core Purpose (What It Does) |
+| :--- | :--- | :--- |
+| **`context-engineering`** | Step 1 (Ingesting rules & skills) | Load only the essential negative rules in `only-one/rules.md`, relevant `archives/`, and framework skills into working memory. |
+| **`incremental-implementation`** | Step 3 (Applying file changes) | Apply precise code edits adhering to type contracts, safe defaults, and clean diffs. |
+| **`code-simplification`** | Step 3 (Quality Gate) | Eliminate dead code, unused imports, speculative abstractions, and keep cognitive complexity low (YAGNI). |
+| **`test-driven-development`** | Step 4 (Verification) | Enforce the Beyoncé Rule (*"If you changed behavior, you must verify it with a test"*), running fast targeted test commands. |
+| **`diagnosing-bugs`** | When any test or compiler error occurs | Execute disciplined Red Feedback Loops (Reproduce $\rightarrow$ Localize $\rightarrow$ Hypothesize $\rightarrow$ Fix) without guessing. |
+
+---
+
+## 2. Step-by-Step Execution Protocol
+
+### Step 1 — Rapid Seam, Governance & Target Rules Ingestion (Internal)
+
+1. **Target Files & Reuse-First Audit**:
+   - Identify target files and symbols using `grep_search` or `list_dir`.
+   - Perform **Mandatory Reuse-First Audit**: Check `src/utils/`, `src/helpers/`, `src/hooks/`, `src/common/`, `src/components/` to reuse existing utilities and avoid duplicate logic.
+2. **Only-One Governance Ingestion**:
+   - Read `only-one/rules.md` to strictly enforce mandatory negative rules (`[NEVER]`, `[ALWAYS]`, `[AVOID]`).
+   - Search and read ONLY the relevant `only-one/archives/*.md` matching the domain/module of the target files to understand past architectural invariants.
+   - Check `only-one/CONTEXT.md` for domain terminology.
+3. **Target-Driven Tech Skills & Rules**:
+   - Match target files with their technology stack (e.g., `src/modules/*/*.service.ts` $\rightarrow$ `nestjs-development`, React components $\rightarrow$ UI rules).
+   - Read `.agents/rules/` and `SKILL.md` of ONLY the matched framework skills. ❌ Do NOT bulk-load unrelated skills.
+
+---
+
+### Step 2 — Emit In-Chat Plan
+
+Emit a clean, focused Markdown plan directly in the chat output before modifying code:
+
+```markdown
+⚡ **Flash Plan**:
+- **Mô tả**: <Tóm tắt 1-2 câu về giải pháp và mục tiêu thực thi>
+- **Target**:
+  - `<file_path_1>` (`<symbol_or_seam>`): <Mô tả ngắn gọn vai trò / nội dung thay đổi>
+  - `<file_path_2>` (`<symbol_or_seam>`): <Mô tả ngắn gọn vai trò / nội dung thay đổi>
+- **Verification**: `<Fast Test / Lint / Build Command>`
+```
+
+*(🛑 Do NOT display loaded skills or governance metadata in chat. Do NOT create `only-one/tasks/`, `concept.md`, or `plan.md` on disk).*
+
+---
+
+### Step 3 — Direct Strict Apply
+
+1. Apply code changes using `replace_file_content` or `multi_replace_file_content`.
+2. **Strict Quality Invariants**:
+   - 100% compliance with `only-one/rules.md` and loaded framework skills.
+   - No dead code, orphan imports, temporary console logs, or speculative abstractions.
+   - Preserve exact existing repository formatting and conventions.
+
+---
+
+### Step 4 — Fast Verification & Walkthrough
+
+1. Execute the fast test command (e.g., `npm test -- <test-file>`, `npm run build`, or typecheck) to verify zero regressions.
+2. If errors occur, diagnose and resolve them following `diagnosing-bugs`.
+3. Provide a brief completion summary in chat (1–3 sentences) highlighting what was changed and the test result.
```

---

### Task 3: `assets/workflows/index.ts` [MODIFY]

```diff
--- a/assets/workflows/index.ts
+++ b/assets/workflows/index.ts
@@ -112,4 +112,18 @@ export const WORKFLOWS: WorkflowManifest[] = [
             'code-simplification',
         ],
     },
+    {
+        name: 'only-one-flash',
+        version: '0.0.1',
+        description:
+            'Execute small, rapid tasks in a single turn with zero disk plan footprint, ultra-clean in-chat plan, strict rule/skill compliance, and fast verification.',
+        requiredSkills: [
+            'context-engineering',
+            'incremental-implementation',
+            'code-simplification',
+            'test-driven-development',
+            'diagnosing-bugs',
+        ],
+    },
 ];
```

---

### Task 4: `assets/combos/index.ts` [MODIFY]

```diff
--- a/assets/combos/index.ts
+++ b/assets/combos/index.ts
@@ -32,6 +32,7 @@ export const COMBOS: ComboManifest[] = [
             'only-one-idea',
             'only-one-plan',
             'only-one-apply',
+            'only-one-flash',
             'only-one-debug',
             'only-one-review',
             'only-one-conflict',
@@ -68,6 +69,7 @@ export const COMBOS: ComboManifest[] = [
             'only-one-idea',
             'only-one-plan',
             'only-one-apply',
+            'only-one-flash',
             'only-one-debug',
             'only-one-review',
             'only-one-conflict',
@@ -116,6 +118,7 @@ export const COMBOS: ComboManifest[] = [
             'only-one-idea',
             'only-one-plan',
             'only-one-apply',
+            'only-one-flash',
             'only-one-debug',
             'only-one-review',
             'only-one-conflict',
```

---

### Task 5: `test/core/workflow-registry.test.ts` [MODIFY]

```diff
--- a/test/core/workflow-registry.test.ts
+++ b/test/core/workflow-registry.test.ts
@@ -24,4 +24,8 @@ describe('workflow registry integrity', () => {
     it('registers only-one-plan', () => {
         expect(WORKFLOWS.filter(({ name }) => name === 'only-one-plan')).toHaveLength(1);
     });
+
+    it('registers only-one-flash', () => {
+        expect(WORKFLOWS.filter(({ name }) => name === 'only-one-flash')).toHaveLength(1);
+    });
 });
```

---

## 5. Verification & Safety Guardrails

### Verification Steps
1. **Automated Unit Tests**:
   - `npm test -- test/core/workflow-registry.test.ts test/commands/combo/combo.test.ts test/commands/workflow.test.ts`
   - **Result**: ✅ 3/3 Test files passed (11/11 tests passed).
2. **Full Project Build & Formatting Gate**:
   - `npm run format:check && npm run build`
   - **Result**: ✅ Prettier formatting passed, TypeScript build passed with 0 errors.
3. **Safety Checklist**:
   - [x] Frontmatter description matches markdown asset convention.
   - [x] `## 1. Skills Catalog` is present in `only-one-flash.md` (enforcing repo negative rule).
   - [x] In-chat plan streamlined to 3 core fields: `Mô tả`, `Target` (source tree + file roles), and `Verification`.
   - [x] `assets/workflows/index.ts` and `assets/combos/index.ts` synchronized without dangling skills.
   - [x] Asset version incremented adhering to base 10 (`0.0.1` and `0.0.5`).
