---
status: done
slug: remove-only-one-handoff-workflow
started_at: 2026-09-09
completed_at: 2026-09-09
pr_url: ~
branch: ~
---

# Plan: Xoá Bỏ Hoàn Toàn Workflow `only-one-handoff` và Skill `handoff`

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- Asset workflow `only-one-handoff.md` hiện được khai báo trong cả `assets/workflows/` lẫn `.agents/workflows/`, phụ thuộc vào skill `handoff` và được đóng gói trong 3 combo presets (`frontend-flow`, `backend-flow`, `full-sdlc-flow`).
- Khi bãi bỏ quy trình xuất file `handoff.md` thủ công, việc giữ lại các khai báo này tạo ra dangling references và làm sai lệch số lượng `mattpocock/skills` trong test suite.
- **Invariants**:
  - Không phá vỡ tính toàn vẹn của `COMBOS` manifest và CI version gate (tăng patch version cho các combo bị sửa đổi).
  - Không làm ảnh hưởng đến 10 workflow chuẩn còn lại (`only-one-idea`, `only-one-plan`, `only-one-apply`, `only-one-debug`, `only-one-review`, `only-one-conflict`, `only-one-clean`, `only-one-clockify`, `only-one-intranet`, `only-one-pr-git`).

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
*Kế thừa 100% cơ chế tại concept.md; không phát sinh Type Contract mới.*

- **AST Seams & Callers**:
  - `assets/workflows/index.ts`: Mảng `WORKFLOWS` $\rightarrow$ xoá entry object `name: 'only-one-handoff'`.
  - `assets/skills/index.ts`: Mảng `SKILLS` $\rightarrow$ xoá entry object `name: 'handoff'`.
  - `assets/combos/index.ts`: Mảng `COMBOS` $\rightarrow$ xoá `'handoff'` trong `skills`, xoá `'only-one-handoff'` trong `workflows` của các combo `frontend-flow`, `backend-flow`, `full-sdlc-flow`; bump version tương ứng.
  - `test/core/skill-registry.test.ts`: Khối test `registers the 11 curated mattpocock/skills with valid paths` $\rightarrow$ giảm length xuống `10`, xoá `'handoff'` khỏi mảng `expectedNames`.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes
```text
only-one-cli/
├── assets/
│   ├── combos/
│   │   └── [MODIFY] index.ts                    # Gỡ bỏ handoff và only-one-handoff khỏi combos
│   ├── skills/
│   │   └── [MODIFY] index.ts                    # Gỡ bỏ skill handoff khỏi SKILLS registry
│   └── workflows/
│       ├── [DELETE] only-one-handoff.md         # Xoá asset workflow markdown
│       └── [MODIFY] index.ts                    # Gỡ bỏ only-one-handoff khỏi WORKFLOWS registry
├── .agents/
│   └── workflows/
│       └── [DELETE] only-one-handoff.md         # Xoá workflow markdown cục bộ của workspace
└── test/
    └── core/
        └── [MODIFY] skill-registry.test.ts      # Cập nhật expected count và names (11 -> 10)
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[DELETE]` | `assets/workflows/only-one-handoff.md` | File deletion | None | `npx vitest run test/core/workflow-registry.test.ts` |
| **2** | `[x]` | `[DELETE]` | `.agents/workflows/only-one-handoff.md` | File deletion | None | `npx vitest run test/core/workflow-registry.test.ts` |
| **3** | `[x]` | `[MODIFY]` | `assets/workflows/index.ts` | `WORKFLOWS` | Order 1 | `npx vitest run test/core/workflow-registry.test.ts` |
| **4** | `[x]` | `[MODIFY]` | `assets/skills/index.ts` | `SKILLS` | None | `npx vitest run test/core/skill-registry.test.ts` |
| **5** | `[x]` | `[MODIFY]` | `assets/combos/index.ts` | `COMBOS` | Order 3, Order 4 | `npx vitest run test/core/combo.test.ts` |
| **6** | `[x]` | `[MODIFY]` | `test/core/skill-registry.test.ts` | `expectedNames` | Order 4 | `npx vitest run test/core/skill-registry.test.ts` |

## Section 4. Code Changes (Unified Diff)

### 1. `[DELETE]` `assets/workflows/only-one-handoff.md`
> **Action**: Xoá file asset markdown do workflow `only-one-handoff` đã bị bãi bỏ.

### 2. `[DELETE]` `.agents/workflows/only-one-handoff.md`
> **Action**: Xoá file workflow markdown đồng bộ trong thư mục workspace `.agents/workflows/`.

### 3. `[MODIFY]` `assets/workflows/index.ts`
> **Action**: Gỡ bỏ định nghĩa workflow `only-one-handoff` khỏi mảng `WORKFLOWS`.

```diff
@@ -70,8 +70,0 @@
-    {
-        name: 'only-one-handoff',
-        version: '0.0.1',
-        description:
-            'Compact current conversation and task state into a seamless handoff document for agent switching or context refreshment.',
-        requiredSkills: ['handoff'],
-    },
```

### 4. `[MODIFY]` `assets/skills/index.ts`
> **Action**: Gỡ bỏ định nghĩa skill `handoff` khỏi mảng `SKILLS`.

```diff
@@ -175,8 +175,0 @@
-    {
-        name: 'handoff',
-        version: '0.0.1',
-        description: 'Compact current conversation state into a seamless handoff document.',
-        source: 'mattpocock/skills',
-        sourceType: 'github',
-        skillPath: 'skills/productivity/handoff/SKILL.md',
-    },
```

### 5. `[MODIFY]` `assets/combos/index.ts`
> **Action**: Loại bỏ `handoff` và `only-one-handoff` khỏi 3 combo presets, bump version cho `frontend-flow` (0.0.3), `backend-flow` (0.0.4), `full-sdlc-flow` (0.0.4).

```diff
@@ -2,3 +2,3 @@
     {
         id: 'frontend-flow',
-        version: '0.0.2',
+        version: '0.0.3',
         name: 'Frontend Flow Setup',
@@ -27,4 +27,3 @@
             'doubt-driven-development',
             'source-driven-development',
-            'handoff',
             'resolving-merge-conflicts',
         ],
@@ -37,3 +36,2 @@
             'only-one-review',
-            'only-one-handoff',
             'only-one-conflict',
@@ -44,3 +42,3 @@
     {
         id: 'backend-flow',
-        version: '0.0.3',
+        version: '0.0.4',
         name: 'Backend Flow Setup',
@@ -65,4 +63,3 @@
             'doubt-driven-development',
             'source-driven-development',
-            'handoff',
             'resolving-merge-conflicts',
         ],
@@ -75,3 +72,2 @@
             'only-one-review',
-            'only-one-handoff',
             'only-one-conflict',
@@ -82,3 +78,3 @@
     {
         id: 'full-sdlc-flow',
-        version: '0.0.3',
+        version: '0.0.4',
         name: 'Full SDLC Enterprise Flow Setup',
@@ -111,4 +107,3 @@
             'doubt-driven-development',
             'source-driven-development',
-            'handoff',
             'resolving-merge-conflicts',
         ],
@@ -125,3 +120,2 @@
             'only-one-review',
-            'only-one-handoff',
             'only-one-conflict',
```

### 6. `[MODIFY]` `test/core/skill-registry.test.ts`
> **Action**: Cập nhật số lượng skill `mattpocock/skills` từ 11 thành 10 và loại bỏ `'handoff'` khỏi `expectedNames`.

```diff
@@ -51,4 +51,4 @@
-    it('registers the 11 curated mattpocock/skills with valid paths', () => {
+    it('registers the 10 curated mattpocock/skills with valid paths', () => {
         const mattSkills = SKILLS.filter((s) => s.source === 'mattpocock/skills');
-        expect(mattSkills).toHaveLength(11);
+        expect(mattSkills).toHaveLength(10);
@@ -62,3 +62,2 @@
             'diagnosing-bugs',
-            'handoff',
             'prototype',
```

## Section 5. Test Cases & Verification
- **Automated Tests**:
  - `[x]` `npx vitest run test/core/skill-registry.test.ts` (PASS - 5/5 tests passed)
  - `[x]` `npx vitest run test/core/workflow-registry.test.ts` (PASS - 2/2 tests passed)
  - `[x]` `npx vitest run test/core/combo.test.ts` (PASS - 12/12 tests passed)
  - `[x]` `npm test` (PASS - 55 test files passed, 230 tests passed)
  - `[x]` `npm run format:check` (PASS - All files formatted with Prettier)
  - `[x]` `npm run build` (PASS - TypeScript compile & postbuild completed cleanly)
- **Manual Checks**:
  - `[x]` Đã đối soát toàn bộ codebase không còn dangling references tới `handoff` hay `only-one-handoff`.

