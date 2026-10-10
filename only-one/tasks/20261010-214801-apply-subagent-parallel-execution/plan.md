---
status: done
slug: apply-subagent-parallel-execution
started_at: 2026-10-10
completed_at: 2026-10-10
pr_url: ~
branch: ~
---

# Plan: Nâng cấp /only-one-apply Hỗ trợ Sub-agent Chạy Song song theo DAG

## Section 1. Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
assets/workflows/
├── [MODIFY] index.ts                    # Tăng version only-one-apply từ 0.0.10 lên 0.0.11
└── [MODIFY] only-one-apply.md           # Nâng cấp Step 3 và Step 4 bổ sung DAG Wave Partitioning & Sub-agent Parallel Dispatch

.agents/workflows/
└── [MODIFY] only-one-apply.md           # Đồng bộ workflow only-one-apply vào môi trường runtime active
```

---

## Section 2. File Changes

### 1. `[MODIFY]` `assets/workflows/index.ts`

- **Status**: `[x]`
- **Context**: `only-one-apply` được cập nhật tính năng mới nên cần tăng version manifest theo Negative Rule 17.
- **Target Symbols / AST Seams**: `WORKFLOWS manifest for only-one-apply`.
- **Invariants**: Phải tuân thủ semver `X.Y.Z` và giữ nguyên các trường manifest bắt buộc.
- **Depends On**: None.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Nâng phiên bản `only-one-apply` từ `0.0.10` lên `0.0.11` trong `assets/workflows/index.ts`.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Tăng patch version cho `only-one-apply` manifest.
- **Rejected alternative**: Giữ nguyên version gây lỗi phiên bản template trong asset version gate.

```diff
--- a/assets/workflows/index.ts
+++ b/assets/workflows/index.ts
@@ -54,3 +54,3 @@
     {
         name: 'only-one-apply',
-        version: '0.0.10',
+        version: '0.0.11',
         description:
```

---

### 2. `[MODIFY]` `assets/workflows/only-one-apply.md`

- **Status**: `[x]`
- **Context**: `only-one-apply.md` hiện tại chỉ thực thi tuần tự đơn luồng từng task block, làm tăng latency khi áp dụng các plan lớn.
- **Target Symbols / AST Seams**: `Step 3 (Parse File Tasks) & Step 4 (Apply Selected File Changes)`.
- **Invariants**: Bảo toàn toàn bộ contracts hiện hữu (`<review-path>`, `multi-select`, `SELECTED`, `Depends On`, `Fast Test Command`, `Beyoncé Rule`).
- **Depends On**: `assets/workflows/index.ts`.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Bổ sung cơ chế DAG Wave Partitioning và Sub-agent Parallel Execution vào Step 3 và Step 4 của `only-one-apply.md`.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Chia tầng thực thi (Execution Waves) dựa trên `Depends On` và Disjoint File Invariant để chạy Sub-agent an toàn.
- **Rejected alternative**: Cho phép Sub-agents chạy tự do không kiểm soát đồ thị phụ thuộc dẫn đến race condition ghi file.

```diff
--- a/assets/workflows/only-one-apply.md
+++ b/assets/workflows/only-one-apply.md
@@ -120,4 +120,11 @@
     - Require each task block to contain `Status`, `Context`, `Target Symbols / AST Seams`, `Invariants`, `Depends On`, and `Fast Test Command` before its checklist and unified diff.
     - Treat heading order as execution order and `Depends On` as blocking edges.
     - Skip tasks marked `[x]`; identify the first `[ ]` or `[/]` task. Cancelled or empty selection performs zero mutations; unselected findings remain `OPEN`.
+3. **Build Execution Waves (DAG Partitioning)**:
+   - Group remaining `[ ]` tasks into sequential **Execution Waves** based on `Depends On`:
+     - **Wave 0**: All tasks with no dependencies (`Depends On: None`) or whose prerequisites are already `[x]`.
+     - **Disjoint File Invariant**: Tasks in the same wave MUST target distinct files. If two independent tasks modify the same file, assign them to sequential sub-waves.
+     - **Concurrency Cap**: Limit concurrent Sub-agents to a maximum of 3-4 workers per wave.
 
 ---
 
-### Step 4 — Apply Selected File Changes Incrementally (`incremental-implementation`)
+### Step 4 — Apply Selected File Changes via Parallel Waves & Sub-agents (`incremental-implementation`)
+
+Execute wave-by-wave until all tasks are marked `[x]`:
+
+1. **Wave Dispatch Strategy**:
+   - **Single-Task Wave**: Main Agent applies the change directly (no Sub-agent overhead).
+   - **Multi-Task Wave (Independent Slices)**: Main Agent acts as Orchestrator and delegates each task in the wave to an isolated Sub-agent:
+     - Spawn concurrent Sub-agents (1 worker per independent task block).
+     - Provide each Sub-agent with its dedicated task context, file diff, and Fast Test Command.
+
+2. **Per-Task Execution Protocol (Main Agent or Worker Sub-agent)**:
+   - Mark task `Status` as `[/]` (in-progress) in `plan.md` or `debug.md`.
+   - **Step 4a — Pre-apply Context, Existing Imports & Language Skill Compliance Gate**:
+     - Read target file (`view_file`), verify imports and enforce Reuse-First Invariant.
+     - Adhere 100% to active language/tech skills and `only-one/rules.md`.
+   - **Step 4b — Ponytail Revalidation Before Edit**: Re-verify checklist for plan drift.
+   - **Step 4c — Apply Code Modification (Diff Application)**: Precisely replace deleted lines (`-`) with added lines (`+`).
+   - **Step 4d — Fast Test Command**:
+     - Run targeted `Fast Test Command` immediately.
+     - If test passes: Report `SUCCESS` and mark task `Status` as `[x]`.
+     - If test fails: Report `FAILED`, halt dependent waves, and activate `diagnosing-bugs`.
+
+3. **Barrier Synchronization Gate**:
+   - Main Agent waits for all workers in the active wave to finish.
+   - Aggregate test outputs and update `plan.md` statuses to `[x]`.
+   - Only advance to the next wave when 100% of tasks in the current wave pass verification.
```

---

### 3. `[MODIFY]` `.agents/workflows/only-one-apply.md`

- **Status**: `[x]`
- **Context**: Đồng bộ `.agents/workflows/only-one-apply.md` với `assets/workflows/only-one-apply.md`.
- **Target Symbols / AST Seams**: `.agents/workflows/only-one-apply.md`.
- **Invariants**: Nội dung phải khớp 100% với file asset mẫu.
- **Depends On**: `assets/workflows/only-one-apply.md`.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Đồng bộ cơ chế DAG Wave Partitioning và Sub-agent Parallel Dispatch vào `.agents/workflows/only-one-apply.md`.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Đồng bộ trực tiếp sang `.agents` để runtime hiện tại được hưởng lợi ngay lập tức.
- **Rejected alternative**: Bỏ qua thư mục runtime khiến phiên làm việc hiện tại không áp dụng được tính năng mới.

```diff
--- a/.agents/workflows/only-one-apply.md
+++ b/.agents/workflows/only-one-apply.md
@@ -120,4 +120,11 @@
     - Require each task block to contain `Status`, `Context`, `Target Symbols / AST Seams`, `Invariants`, `Depends On`, and `Fast Test Command` before its checklist and unified diff.
     - Treat heading order as execution order and `Depends On` as blocking edges.
     - Skip tasks marked `[x]`; identify the first `[ ]` or `[/]` task. Cancelled or empty selection performs zero mutations; unselected findings remain `OPEN`.
+3. **Build Execution Waves (DAG Partitioning)**:
+   - Group remaining `[ ]` tasks into sequential **Execution Waves** based on `Depends On`:
+     - **Wave 0**: All tasks with no dependencies (`Depends On: None`) or whose prerequisites are already `[x]`.
+     - **Disjoint File Invariant**: Tasks in the same wave MUST target distinct files. If two independent tasks modify the same file, assign them to sequential sub-waves.
+     - **Concurrency Cap**: Limit concurrent Sub-agents to a maximum of 3-4 workers per wave.
 
 ---
 
-### Step 4 — Apply Selected File Changes Incrementally (`incremental-implementation`)
+### Step 4 — Apply Selected File Changes via Parallel Waves & Sub-agents (`incremental-implementation`)
+
+Execute wave-by-wave until all tasks are marked `[x]`:
+
+1. **Wave Dispatch Strategy**:
+   - **Single-Task Wave**: Main Agent applies the change directly (no Sub-agent overhead).
+   - **Multi-Task Wave (Independent Slices)**: Main Agent acts as Orchestrator and delegates each task in the wave to an isolated Sub-agent:
+     - Spawn concurrent Sub-agents (1 worker per independent task block).
+     - Provide each Sub-agent with its dedicated task context, file diff, and Fast Test Command.
+
+2. **Per-Task Execution Protocol (Main Agent or Worker Sub-agent)**:
+   - Mark task `Status` as `[/]` (in-progress) in `plan.md` or `debug.md`.
+   - **Step 4a — Pre-apply Context, Existing Imports & Language Skill Compliance Gate**:
+     - Read target file (`view_file`), verify imports and enforce Reuse-First Invariant.
+     - Adhere 100% to active language/tech skills and `only-one/rules.md`.
+   - **Step 4b — Ponytail Revalidation Before Edit**: Re-verify checklist for plan drift.
+   - **Step 4c — Apply Code Modification (Diff Application)**: Precisely replace deleted lines (`-`) with added lines (`+`).
+   - **Step 4d — Fast Test Command**:
+     - Run targeted `Fast Test Command` immediately.
+     - If test passes: Report `SUCCESS` and mark task `Status` as `[x]`.
+     - If test fails: Report `FAILED`, halt dependent waves, and activate `diagnosing-bugs`.
+
+3. **Barrier Synchronization Gate**:
+   - Main Agent waits for all workers in the active wave to finish.
+   - Aggregate test outputs and update `plan.md` statuses to `[x]`.
+   - Only advance to the next wave when 100% of tasks in the current wave pass verification.
```

---

## Section 3. Test Cases & Verification

- **Automated Tests**:
  - [x] `npx vitest run test/core/workflow-registry.test.ts` (PASS: 10/10 tests passed)
  - [x] `npm test` (PASS: 242/242 tests passed across 55 test files, format check clean)
  - [x] `npm run build` (PASS: TypeScript compilation clean, dist package built)
- **Manual Checks**:
  - [x] `assets/workflows/index.ts` có version `0.0.11` cho `only-one-apply`.
  - [x] `.agents/workflows/only-one-apply.md` và `assets/workflows/only-one-apply.md` khớp 100% về cơ chế Execution Waves, Disjoint File Invariant và Barrier Sync.
