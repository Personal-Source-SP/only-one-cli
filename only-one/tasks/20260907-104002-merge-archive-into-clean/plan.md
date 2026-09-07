---
status: done
slug: merge-archive-into-clean
started_at: 2026-09-07
completed_at: 2026-09-07
pr_url: ~
branch: ~
---

# Plan: Hợp nhất Workflow only-one-archive vào only-one-clean

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- **Cơ chế hiện tại**: Hệ thống duy trì 2 workflow riêng biệt cho vòng đời sau thực thi: `only-one-archive.md` (chưng cất 1 task đơn lẻ thành single archive và trích xuất rules) và `only-one-clean.md` (quét task done ở Step 0, sau đó audit codebase và dọn dẹp).
- **Điểm nghẽn kỹ thuật**: Step 0 của `only-one-clean.md` đang trỏ tham chiếu phụ thuộc gián tiếp tới giao thức của `/only-one-archive` ("Execute the full `/only-one-archive` protocol"). Trên thực tế người dùng chỉ chạy `/only-one-clean`, dẫn đến việc tồn tại song song của `only-one-archive` gây dư thừa code, tài liệu và cấu hình combo.
- **Invariants bắt buộc giữ nguyên**:
  - **Strict Active Work Protection**: Step 0 của `only-one-clean` chỉ quét và xử lý task có `status: done`; tuyệt đối không xóa hoặc archive task `planned` hoặc `in-progress`.
  - **Single Distilled Archive Schema**: Giữ nguyên schema YAML frontmatter (`id`, `title`, `archived_at`, `status: active`, `references`, `affected_modules`) và cấu trúc 4 phần của tài liệu lưu trữ chắt lọc (`only-one/archives/<timestamp>-<slug>.md`).
  - **Negative Rules Distillation**: Duy trì trích xuất negative rules (`[NEVER]`, `[AVOID]`) vào `only-one/rules.md` sử dụng kỹ năng `context-engineering`.
  - **Asset Version Gate**: 100% manifest trong `assets/` phải có version hợp lệ chuẩn decimal semver; tăng patch version (`0.0.3`) cho `only-one-clean` và các combos liên quan.
  - **Skills-Workflow Alignment**: Bảng `Skills Catalog` trong workflow file và `requiredSkills` trong manifest phải khớp 100%.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
*(Kế thừa 100% cơ chế tại concept.md; không phát sinh Type Contract mới.)*

- **Type Signatures & Code Contracts**:
  - Không thay đổi core type definition `WorkflowManifest` hay `ComboManifest` trong `assets/types.ts`.
  - Manifest `only-one-clean` trong `assets/workflows/index.ts`:
    - `version`: `'0.0.2'` $\rightarrow$ `'0.0.3'`
    - `requiredSkills`: bổ sung `'context-engineering'` (tổng cộng 5 skills: `'task-lifecycle-resolution'`, `'context-engineering'`, `'source-driven-development'`, `'doubt-driven-development'`, `'code-simplification'`).
  - Combos trong `assets/combos/index.ts`:
    - `frontend-flow`: bỏ `'only-one-archive'`, version `'0.0.2'` $\rightarrow$ `'0.0.3'`.
    - `backend-flow`: bỏ `'only-one-archive'`, version `'0.0.2'` $\rightarrow$ `'0.0.3'`.
    - `full-sdlc-flow`: bỏ `'only-one-archive'`, version `'0.0.2'` $\rightarrow$ `'0.0.3'`.
- **AST Seams & Callers**:
  - `assets/workflows/only-one-clean.md` & `.agents/workflows/only-one-clean.md`:
    - Cập nhật bảng `## 1. Skills Catalog` bổ sung `context-engineering`.
    - Viết lại `### Step 0 — Pre-Clean Auto-Archive` thành quy trình độc lập, tự chủ hoàn toàn: trích xuất negative rules vào `only-one/rules.md`, giải quyết direct references, tạo file single distilled archive theo template chuẩn, và xóa thư mục task thô.
  - `assets/workflows/only-one-pr-git.md` & `.agents/workflows/only-one-pr-git.md`:
    - Markdown Seam: Section `### Next Steps` (dòng 112) đổi từ `/only-one-archive` sang `/only-one-clean`.
  - `test/commands/workflow.test.ts`:
    - AST Seam: Test case kiểm tra cài đặt workflow đổi từ kiểm tra `only-one-archive,only-one-clean` sang kiểm tra độc lập `only-one-clean`.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
.agents/workflows/
├── [DELETE] only-one-archive.md
├── [MODIFY] only-one-clean.md
└── [MODIFY] only-one-pr-git.md

assets/
├── combos/
│   └── [MODIFY] index.ts
└── workflows/
    ├── [DELETE] only-one-archive.md
    ├── [MODIFY] index.ts
    ├── [MODIFY] only-one-clean.md
    └── [MODIFY] only-one-pr-git.md

test/commands/
└── [MODIFY] workflow.test.ts

./
├── [MODIFY] README.md
├── [MODIFY] BACKLOG.md
└── [MODIFY] CHANGELOG.md
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[DELETE]` | `assets/workflows/only-one-archive.md` | Whole file | `None` | `npm test test/core/workflow-registry.test.ts` |
| **2** | `[x]` | `[DELETE]` | `.agents/workflows/only-one-archive.md` | Whole file | `None` | `npm test test/core/workflow-registry.test.ts` |
| **3** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-clean.md` | `Skills Catalog`, `Step 0 Pre-Clean Auto-Archive` | `Order 1` | `npm test test/core/workflow-registry.test.ts` |
| **4** | `[x]` | `[MODIFY]` | `.agents/workflows/only-one-clean.md` | `Skills Catalog`, `Step 0 Pre-Clean Auto-Archive` | `Order 3` | `npm test test/core/workflow-registry.test.ts` |
| **5** | `[x]` | `[MODIFY]` | `assets/workflows/index.ts` | `WORKFLOWS` registry entry for `only-one-clean` and removal of `only-one-archive` | `Order 1, 3` | `npm test test/core/workflow-registry.test.ts` |
| **6** | `[x]` | `[MODIFY]` | `assets/combos/index.ts` | `COMBOS` manifests (remove `only-one-archive`, bump versions) | `Order 5` | `npm test test/core/combo.test.ts` |
| **7** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-pr-git.md` | `Next Steps` reference | `Order 3` | `npm test test/core/workflow-registry.test.ts` |
| **8** | `[x]` | `[MODIFY]` | `.agents/workflows/only-one-pr-git.md` | `Next Steps` reference | `Order 7` | `npm test test/core/workflow-registry.test.ts` |
| **9** | `[x]` | `[MODIFY]` | `test/commands/workflow.test.ts` | `installs only-one-clean workflow properly` | `Order 5` | `npm test test/commands/workflow.test.ts` |
| **10** | `[x]` | `[MODIFY]` | `README.md` | Workflow list & Task Lifecycle section | `Order 5` | `npm test test/core/assets/version-gate.test.ts` |
| **11** | `[x]` | `[MODIFY]` | `BACKLOG.md` | SDLC workflow descriptions | `Order 10` | `npm test` |
| **12** | `[x]` | `[MODIFY]` | `CHANGELOG.md` | Unreleased changelog entry | `Order 11` | `npm test` |

## Section 4. Code Changes (Unified Diff)

### 1. `[DELETE]` `assets/workflows/only-one-archive.md`
> **Action**: Xóa bỏ file asset template workflow `only-one-archive.md` do đã được hợp nhất hoàn toàn vào `only-one-clean.md`.

### 2. `[DELETE]` `.agents/workflows/only-one-archive.md`
> **Action**: Xóa bỏ file active workflow `only-one-archive.md` trong workspace agents directory.

### 3. `[MODIFY]` `assets/workflows/only-one-clean.md`
> **Action**: Nhúng đầy đủ quy chuẩn chưng cất task archive, rules extraction, và authoring template vào Step 0.

```diff
@@ line 28 @@
 | **`task-lifecycle-resolution`** | Step 0 (Pre-clean task auto-archive) | Scans `only-one/tasks/` for completed tasks with `status: done` and triggers `/only-one-archive` protocol before clean. |
+| **`context-engineering`** | Step 0 (Distilling negative rules) | Formats negative constraints and lessons learned into high-signal `[NEVER]` / `[AVOID]` rules inside `only-one/rules.md`. |
 | **`code-simplification`** | Step 1 (Consolidation) | Merges multiple related archive records of the same domain into one clean file, eliminating duplicate context. |
@@ line 38 @@
 ### Step 0 — Pre-Clean Auto-Archive (`task-lifecycle-resolution`)
 
 1. Scan `only-one/tasks/` for task folders where `plan.md` has `status: done`.
 2. For each completed task folder found:
    - If `--dry-run` is active:
-     - Log: `[DRY-RUN] Found completed task: <slug> (would execute /only-one-archive)`.
+     - Log: `[DRY-RUN] Found completed task: <slug> (would distill rules, author archive, and purge raw directory)`.
    - Otherwise:
-     - Execute the full `/only-one-archive` protocol on that task:
-       1. Append negative rules to `only-one/rules.md`.
-       2. Author single distilled record `only-one/archives/<timestamp>-<slug>.md`.
-       3. Remove raw task directory `rm -rf only-one/tasks/<slug>`.
+     - Execute the full task archiving protocol:
+       1. **Extract User Feedback & Distill Negative Rules (`context-engineering`)**:
+          - Read `plan.md` (and `concept.md` if present).
+          - Extract any negative constraints, rules, anti-patterns, or user warnings communicated during the task.
+          - Append new negative rules to `only-one/rules.md` (prevent duplicate entries):
+            ```markdown
+            - **[NEVER]** <Action to avoid> — <Reason / Context>
+            - **[AVOID]** <Anti-pattern to avoid> — <Reason / Context>
+            ```
+       2. **Direct Reference Resolution**:
+          - Scan existing archive files in `only-one/archives/*.md`.
+          - Identify any historical archives related to the same modules touched by this task for the `references` field.
+       3. **Author Single Distilled Archive (`code-simplification`)**:
+          - Create directory `only-one/archives/` if it does not exist.
+          - Generate `only-one/archives/<timestamp>-<slug>.md` using the task's timestamp prefix (**Song ngữ Lai: Diễn giải bằng Tiếng Việt + thuật ngữ Tiếng Anh**):
+            ```markdown
+            ---
+            id: <timestamp>-<slug>
+            title: <Tên Task / Tính năng>
+            archived_at: <YYYY-MM-DD>
+            status: active
+            references:
+              - only-one/archives/<previous-related-archive>.md
+            affected_modules:
+              - <module-1>
+              - <module-2>
+            ---
+
+            # Archive: <Tên Task / Tính năng>
+
+            ## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
+            - **Vấn đề (Problem)**: <Tóm tắt ngắn gọn vấn đề đã được giải quyết>
+            - **Giá trị (Value)**: <Lợi ích cốt lõi mang lại cho hệ thống/người dùng>
+
+            ## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
+            - **Hướng tiếp cận (Approach)**: <Giải pháp kỹ thuật tổng quan>
+            - **Sơ đồ (Diagram)**: <Sơ đồ Mermaid nếu có>
+
+            ## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
+            - Danh sách các module và file đã sửa đổi (kèm liên kết clickable).
+
+            ## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
+            - **Trạng thái Test**: 100% Passed.
+            - **PR URL / Branch**: <Liên kết PR hoặc tên branch>
+            ```
+       4. **Purge Raw Task Directory**:
+          - Confirm that `only-one/archives/<timestamp>-<slug>.md` has been successfully created.
+          - Remove the raw task directory:
+            ```bash
+            rm -rf only-one/tasks/<timestamp>-<slug>
+            ```
 3. Check for tasks with `status: in-progress` or `status: planned`:
```

### 4. `[MODIFY]` `.agents/workflows/only-one-clean.md`
> **Action**: Đồng bộ nội dung sửa đổi từ `assets/workflows/only-one-clean.md` sang workspace workflow file `.agents/workflows/only-one-clean.md`.

### 5. `[MODIFY]` `assets/workflows/index.ts`
> **Action**: Xóa bỏ `only-one-archive` khỏi danh mục workflows, cập nhật `requiredSkills` và tăng version của `only-one-clean`.

```diff
@@ line 108 @@
-    {
-        name: 'only-one-archive',
-        version: '0.0.3',
-        description:
-            'Distill completed tasks into concise single-file archives, sync rules, and clean task folders.',
-        requiredSkills: ['handoff', 'code-simplification', 'context-engineering'],
-    },
     {
         name: 'only-one-clean',
-        version: '0.0.2',
+        version: '0.0.3',
         description:
             'Consolidate related archives, verify deep logic against codebase, and purge stale documents.',
         requiredSkills: [
             'task-lifecycle-resolution',
+            'context-engineering',
             'source-driven-development',
             'doubt-driven-development',
             'code-simplification',
         ],
     },
```

### 6. `[MODIFY]` `assets/combos/index.ts`
> **Action**: Xóa bỏ `only-one-archive` khỏi các combo manifests và tăng patch version cho các combos tương ứng.

```diff
@@ line 6 @@
         id: 'frontend-flow',
-        version: '0.0.2',
+        version: '0.0.3',
@@ line 39 @@
             'only-one-conflict',
-            'only-one-archive',
             'only-one-clean',
         ],
     },
     {
         id: 'backend-flow',
-        version: '0.0.2',
+        version: '0.0.3',
@@ line 78 @@
             'only-one-conflict',
-            'only-one-archive',
             'only-one-clean',
         ],
     },
     {
         id: 'full-sdlc-flow',
-        version: '0.0.2',
+        version: '0.0.3',
@@ line 129 @@
             'only-one-conflict',
-            'only-one-archive',
             'only-one-clean',
```

### 7. `[MODIFY]` `assets/workflows/only-one-pr-git.md`
> **Action**: Cập nhật chỉ dẫn sau khi merge PR trỏ sang `/only-one-clean`.

```diff
@@ line 112 @@
 ### Next Steps:
-- After merging this Pull Request, run `/only-one-archive` to distill the completed task into `only-one/archives/` and clean up the working task directory.
+- After merging this Pull Request, run `/only-one-clean` to archive the completed task, update rules, and audit the repository.
```

### 8. `[MODIFY]` `.agents/workflows/only-one-pr-git.md`
> **Action**: Đồng bộ nội dung dòng 112 sang workspace workflow file `.agents/workflows/only-one-pr-git.md`.

```diff
@@ line 112 @@
 ### Next Steps:
-- After merging this Pull Request, run `/only-one-archive` to distill the completed task into `only-one/archives/` and clean up the working task directory.
+- After merging this Pull Request, run `/only-one-clean` to archive the completed task, update rules, and audit the repository.
```

### 9. `[MODIFY]` `test/commands/workflow.test.ts`
> **Action**: Cập nhật test case cài đặt workflow kiểm tra độc lập `only-one-clean`.

```diff
@@ line 68 @@
-    it('installs only-one-archive and only-one-clean workflows properly', async () => {
+    it('installs only-one-clean workflow properly', async () => {
         const deps: Partial<ProgramDeps> = {
             stdout: () => {},
             prompts: {
                 checkbox: async (opts) => {
                     if (opts.message.includes('target IDEs/Tools')) return ['antigravity'];
                     return [];
                 },
             },
         };
 
         await rmP(testProjectDir, { recursive: true, force: true });
         await mkdirP(testProjectDir, { recursive: true });
 
         const cmd = createWorkflowCommand(deps as ProgramDeps);
-        await cmd.parseAsync(['node', 'test', testProjectDir, 'only-one-archive,only-one-clean']);
+        await cmd.parseAsync(['node', 'test', testProjectDir, 'only-one-clean']);
 
-        const archiveDest = join(testProjectDir, '.agents/workflows/only-one-archive.md');
         const cleanDest = join(testProjectDir, '.agents/workflows/only-one-clean.md');
 
-        expect(existsSync(archiveDest)).toBe(true);
         expect(existsSync(cleanDest)).toBe(true);
 
         await rmP(testProjectDir, { recursive: true, force: true });
     });
```

### 10. `[MODIFY]` `README.md`
> **Action**: Xóa bỏ `only-one-archive` khỏi bảng mô tả workflows và cập nhật mục Task Lifecycle.

```diff
@@ line 101 @@
 - `only-one-review`: 5-axis code health, security, simplicity, and performance review.
-- `only-one-archive`: Distill completed tasks into concise single-file archives (`only-one/archives/`).
 - `only-one-clean`: Consolidate related archives and purge stale task files.
@@ line 223 @@
-### Task Lifecycle (Archive & Clean)
+### Task Lifecycle (Clean)
 
-`only-one-archive` and `only-one-clean` manage historical task documentation in `only-one/archives/` using frontmatter metadata.
+`only-one-clean` automatically archives completed tasks (`status: done`), extracts negative rules into `only-one/rules.md`, consolidates domain archives, and audits documentation against active code.
```

### 11. `[MODIFY]` `BACKLOG.md`
> **Action**: Cập nhật danh mục SDLC workflows sang 9 workflows chuẩn và mô tả gộp của `only-one-clean`.

```diff
@@ line 25 @@
 - [x] **Task lifecycle management**:
-  - `only-one-archive`: chưng cất task đã hoàn thành thành single-file archive markdown (`only-one/archives/YYYYMMDD-HHMMSS-<name>.md`) kèm YAML frontmatter, cập nhật rules và dọn dẹp task folders.
-  - `only-one-clean`: tổng hợp archive liên quan, đối chiếu logic sâu với codebase thực tế, và dọn dẹp tài liệu cũ/stale.
+  - `only-one-clean`: tự động lưu trữ task đã hoàn thành (`status: done`), chưng cất rules, tổng hợp archive cùng miền, và đối chiếu logic sâu với codebase thực tế.
- - [x] **Standardized SDLC workflows (10 workflows)**:
+ - [x] **Standardized SDLC workflows (9 workflows)**:
@@ line 36 @@
   - `only-one-pr-git`: tạo/cập nhật GitHub Pull Request với pre-review quality gates.
-  - `only-one-archive` & `only-one-clean`: quản lý vòng đời task và lưu trữ tri thức.
+  - `only-one-clean`: quản lý toàn diện vòng đời task, lưu trữ và thanh lọc tri thức hệ thống.
```

### 12. `[MODIFY]` `CHANGELOG.md`
> **Action**: Bổ sung mục ghi chú thay đổi về việc hợp nhất `only-one-archive` vào `only-one-clean`.

```diff
@@ line 7 @@
 ## [Unreleased]
 
+### Changed
+- **Task Lifecycle Workflow Consolidation**: Merged `only-one-archive` into `only-one-clean`. Task auto-archiving, rule distillation, and raw directory purging now execute seamlessly inside Step 0 of `/only-one-clean`.
```

## Section 5. Test Cases & Verification
- **Automated Tests**:
  - [x] `npx vitest run test/core/workflow-registry.test.ts` (PASS - 2 tests passed).
  - [x] `npx vitest run test/core/assets/version-gate.test.ts` (PASS - 2 tests passed, 100% manifest decimal semver valid).
  - [x] `npx vitest run test/core/combo.test.ts` (PASS - 12 tests passed).
  - [x] `npx vitest run test/commands/workflow.test.ts` (PASS - 4 tests passed).
  - [x] `npm test` (PASS - 56 test files, 229 tests passed, 0 failures).
  - [x] `npm run build` (PASS - Prettier format check, tsc compiler type-check, and postbuild-paths.cjs succeeded).
- **Manual Checks**:
  - [x] Kiểm tra `git status` xác nhận `assets/workflows/only-one-archive.md` và `.agents/workflows/only-one-archive.md` đã bị xóa.
  - [x] Chạy `grep -ri "only-one-archive" .` xác nhận không còn bất kỳ dangling references nào trong code hoặc cấu hình hoạt động.
