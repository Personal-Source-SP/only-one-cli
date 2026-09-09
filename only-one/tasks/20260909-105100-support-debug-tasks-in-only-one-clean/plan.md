---
status: done
slug: support-debug-tasks-in-only-one-clean
started_at: 2026-09-09
completed_at: 2026-09-09
pr_url: ~
branch: ~
---

# Plan: Bổ sung Quét debug.md vào Workflow /only-one-clean & Kỹ năng task-lifecycle-resolution

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- Trong `assets/workflows/only-one-clean.md` và `.agents/skills/task-lifecycle-resolution/SKILL.md`, Step 0 (Pre-Clean Auto-Archive) chỉ quét tìm kiếm tệp `plan.md` (`status: done`, `in-progress`, `planned`).
- Toàn bộ task debug tạo ra bởi `/only-one-debug` (chứa `debug.md`) đang bị bỏ sót hoàn toàn:
  - Task debug đã hoàn thành (`status: fixed`) không được tự động chắt lọc archive và xóa thư mục task thô.
  - Task debug đang thực hiện (`status: diagnosing`, `status: planning`) không được bảo vệ khỏi nguy cơ bị dọn dẹp.
- **Invariants**:
  - Giữ nguyên 100% cấu trúc tệp archive tiêu chuẩn `only-one/archives/<timestamp>-<slug>.md`.
  - Giữ nguyên logic gom nhóm domain (Step 1) và đối soát codebase (Step 2) của `only-one-clean`.
  - Toàn bộ hướng dẫn workflow / skill được viết bằng **English chuẩn**, template tài liệu giữ format **Bilingual Hybrid**.
  - Tăng version của `only-one-clean` trong `assets/workflows/index.ts` (`0.0.3` $\rightarrow$ `0.0.4`) và `task-lifecycle-resolution` trong `assets/skills/index.ts` (`0.0.1` $\rightarrow$ `0.0.2`).

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
- Kế thừa 100% cơ chế vận hành từ [concept.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/only-one/tasks/20260909-105100-support-debug-tasks-in-only-one-clean/concept.md).
- **Manifest Contracts**:
  - `assets/workflows/index.ts`: `only-one-clean` entry bump version lên `0.0.4`.
  - `assets/skills/index.ts`: `task-lifecycle-resolution` entry bump version lên `0.0.2`.
- **Workflow & Skill Seams**:
  - `task-lifecycle-resolution`: Bổ sung nhận diện `debug.md` (`status: fixed` $\rightarrow$ archive; `status: diagnosing | planning` $\rightarrow$ preserve).
  - `only-one-clean.md`: Cập nhật Step 0 quét đồng thời `plan.md` và `debug.md`, trích xuất negative rules từ Section 5 của `debug.md` vào `only-one/rules.md`.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes
```text
assets/
├── skills/
│   ├── [MODIFY] index.ts                               # Bump task-lifecycle-resolution lên 0.0.2
│   └── task-lifecycle-resolution/
│       └── [MODIFY] SKILL.md                           # Cập nhật quét debug.md
└── workflows/
    ├── [MODIFY] index.ts                               # Bump only-one-clean lên 0.0.4
    └── [MODIFY] only-one-clean.md                      # Cập nhật Step 0 hỗ trợ debug.md
.agents/
├── skills/
│   └── task-lifecycle-resolution/
│       └── [MODIFY] SKILL.md                           # Đồng bộ 100% với assets/skills
└── workflows/
    └── [MODIFY] only-one-clean.md                      # Đồng bộ 100% với assets/workflows
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `assets/skills/index.ts` | `SKILLS` entry `task-lifecycle-resolution` | `None` | `npm run build` |
| **2** | `[x]` | `[MODIFY]` | `assets/workflows/index.ts` | `WORKFLOWS` entry `only-one-clean` | `None` | `npm run build` |
| **3** | `[x]` | `[MODIFY]` | `assets/skills/task-lifecycle-resolution/SKILL.md` | Hướng dẫn quét `debug.md` và `plan.md` | `Order 1` | `npm test` |
| **4** | `[x]` | `[MODIFY]` | `.agents/skills/task-lifecycle-resolution/SKILL.md` | Đồng bộ 100% với `assets/skills/task-lifecycle-resolution/SKILL.md` | `Order 3` | `npm test` |
| **5** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-clean.md` | Cập nhật Step 0 quét `debug.md` và `plan.md` | `Order 2` | `npm test` |
| **6** | `[x]` | `[MODIFY]` | `.agents/workflows/only-one-clean.md` | Đồng bộ 100% với `assets/workflows/only-one-clean.md` | `Order 5` | `npm test` |

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `assets/skills/index.ts`
> **Action**: Bump version `task-lifecycle-resolution` lên `0.0.2`.

```diff
@@ -242,3 +242,3 @@
         name: 'task-lifecycle-resolution',
-        version: '0.0.1',
+        version: '0.0.2',
         description: 'Resolve and auto-archive completed tasks before running clean and maintenance workflows.',
```

### 2. `[MODIFY]` `assets/workflows/index.ts`
> **Action**: Bump version `only-one-clean` lên `0.0.4`.

```diff
@@ -103,3 +103,3 @@
         name: 'only-one-clean',
-        version: '0.0.3',
+        version: '0.0.4',
         description:
```

### 3. `[MODIFY]` `assets/skills/task-lifecycle-resolution/SKILL.md`
> **Action**: Cập nhật skill nhận diện cả `plan.md` và `debug.md`.

```diff
(Đã cập nhật quét debug.md và plan.md)
```

### 4. `[MODIFY]` `.agents/skills/task-lifecycle-resolution/SKILL.md`
> **Action**: Đồng bộ 100% với `assets/skills/task-lifecycle-resolution/SKILL.md`.

```diff
(Đã đồng bộ)
```

### 5. `[MODIFY]` `assets/workflows/only-one-clean.md`
> **Action**: Cập nhật Step 0 hỗ trợ quét cả `plan.md` và `debug.md`, chắt lọc negative rules từ `debug.md` và bảo vệ active debug tasks.

```diff
(Đã cập nhật Step 0 hỗ trợ debug.md)
```

### 6. `[MODIFY]` `.agents/workflows/only-one-clean.md`
> **Action**: Đồng bộ 100% với `assets/workflows/only-one-clean.md`.

```diff
(Đã đồng bộ)
```

## Section 5. Test Cases & Verification
- **Automated Tests**:
  - `[x]` `npm run build`: `PASS` (Compile TypeScript thành công).
  - `[x]` `npm test`: `PASS` (Toàn bộ 230 test cases của CLI chạy thành công).
- **Manual Checks**:
  - `[x]` Đối chiếu nội dung giữa `assets/` và `.agents/` cho cả `only-one-clean.md` và `task-lifecycle-resolution/SKILL.md`.
  - `[x]` Xác nhận Step 0 nhận diện đúng `plan.md` (`done`) và `debug.md` (`fixed`).
