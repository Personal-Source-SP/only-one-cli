---
status: fixed
slug: debug-workflow-source-structure
started_at: 2026-10-04 16:13:00
completed_at: 2026-10-04
reproduction_test: npx vitest run test/core/workflow-registry.test.ts
---

# Debug: Bổ sung Mô tả Cấu trúc Source Thay đổi trong Workflow only-one-debug

## Section 1. Diagnosis

### Symptom
- **Actual**: Workflow `only-one-debug` (`assets/workflows/only-one-debug.md` & `.agents/workflows/only-one-debug.md`) chỉ có mô tả các task block riêng lẻ trong Section 2 mà thiếu sơ đồ cây ASCII Directory Structure Changes thể hiện tổng thể cấu trúc tệp được chỉnh sửa trước khi vào từng task block.
- **Expected**: Section 2 của `debug.md` và hướng dẫn trong Step 4 của `only-one-debug.md` phải có phần sơ đồ cây ASCII Directory Structure Changes (tương đồng với `only-one-plan` và `only-one-flash`) để người đọc nắm nhanh toàn bộ phạm vi file thay đổi.
- **Blast Radius**: Quy trình tài liệu debug (`debug.md`), workflow asset template `only-one-debug.md`, và agent active workflow.

### Reproduction
- **Trigger**: Kiểm tra cấu trúc template Section 2 trong `assets/workflows/only-one-debug.md`.
- **Red Test**: So sánh `only-one-plan.md` (có Directory Structure Changes) với `only-one-debug.md` (thiếu Directory Structure Changes).
- **Command**: `grep -n "Directory Structure" assets/workflows/only-one-debug.md`.

### Evidence
- **Observed Facts**: Lệnh grep cho kết quả 0 matches trong `assets/workflows/only-one-debug.md`. Template Section 2 đi thẳng vào `### 1. [MODIFY] ...` mà không có sơ đồ cây tổng quan.
- **Fault Location**: `assets/workflows/only-one-debug.md` (Step 4 và Section 2 template) & `.agents/workflows/only-one-debug.md`.

### Root Cause
- **Mechanical Cause**: Khi thiết kế `only-one-debug.md`, phần Directory Structure Changes chưa được đưa vào đầu Section 2 của template mẫu và quy trình Step 4.
- **Trigger Mechanism**: Người dùng tạo tài liệu `debug.md` bị thiếu cái nhìn tổng quan dạng cây thư mục về các file test và mã nguồn bị can thiệp.
- **Violated Invariant**: Tính đồng bộ về tính trực quan kiến trúc giữa các workflow (`only-one-plan`, `only-one-flash`, `only-one-debug`).

### Hypotheses Rejected
- Không có giả thuyết bị bác bỏ; đây là thiếu sót trực tiếp trong định dạng template Section 2.

### Fix Constraints
- Giữ nguyên kiến trúc 3 section chuẩn của `debug.md` (Section 1 Diagnosis, Section 2 File Changes, Section 3 Verification).
- Bổ sung mục `Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)` dạng cây ASCII trực quan vào đầu Section 2.
- Tuân thủ chuẩn 70% ASD-STE100 (câu ngắn $\le 25$ từ, thuật ngữ kỹ thuật tiếng Anh).
- Tăng version của `only-one-debug` trong `assets/workflows/index.ts` lên `0.0.9`.

---

## Section 2. File Changes

### Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
only-one-cli/
├── assets/
│   └── workflows/
│       ├── [MODIFY] only-one-debug.md           # Bổ sung Directory Structure Changes vào Step 4 và Section 2 template
│       └── [MODIFY] index.ts                    # Tăng version only-one-debug lên 0.0.9
├── .agents/
│   └── workflows/
│       └── [MODIFY] only-one-debug.md           # Đồng bộ active agent workflow
└── test/
    └── core/
        └── [MODIFY] workflow-registry.test.ts   # Thêm assertion kiểm tra Directory Structure trong only-one-debug
```

### 1. `[MODIFY]` `assets/workflows/only-one-debug.md`

- **Status**: `[x]`
- **Context**: Template Section 2 và Step 4 chưa hướng dẫn tạo sơ đồ cây Directory Structure Changes.
- **Target Symbols / AST Seams**: Step 4 instruction và `debug.md` template Section 2.
- **Invariants**: Giữ nguyên tính tương thích của machine-readable task blocks với `only-one-apply`.
- **Depends On**: None.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Bổ sung sơ đồ cây ASCII Directory Structure Changes vào Step 4 và template Section 2.

**Ponytail checklist**
- [x] Required by proven root cause.
- [x] Existing implementation and dependencies searched.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Thêm mục Directory Structure Changes dạng cây ASCII trực quan vào đầu Section 2.
- **Rejected alternative**: Tạo thêm Section riêng (làm gãy cấu trúc 3 section và tương thích ngược với `/only-one-apply`).

```diff
@@ -86,3 +86,4 @@
 1. Update frontmatter to `status: planning`.
-2. Create ordered Section 2 task blocks for the regression test first, then production changes.
+2. Include an ASCII Directory Structure tree diagram at the top of Section 2 showing affected tests and source files with standard action tags (`[NEW]`, `[MODIFY]`, `[DELETE]`).
+3. Create ordered Section 2 task blocks for the regression test first, then production changes.
-3. Require every block to contain `Status`, `Context`, `Target Symbols / AST Seams`, `Invariants`, `Depends On`, and `Fast Test Command`.
-4. Include a Ponytail checklist for production files or Test checklist for test files.
-5. Include a Git-standard Unified Diff in each block.
-6. Keep changes minimal and directly tied to proven root cause.
+4. Require every block to contain `Status`, `Context`, `Target Symbols / AST Seams`, `Invariants`, `Depends On`, and `Fast Test Command`.
+5. Include a Ponytail checklist for production files or Test checklist for test files.
+6. Include a Git-standard Unified Diff in each block.
+7. Keep changes minimal and directly tied to proven root cause.
@@ -148,2 +149,11 @@
 ## Section 2. File Changes
+
+### Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)
+Sơ đồ cây ASCII trực quan thể hiện các tệp kiểm thử hồi quy và mã nguồn cần chỉnh sửa:
+
+```text
+src/path/to/module/
+├── [NEW]    __tests__/defect-reproduction.test.ts # Red test tái hiện lỗi & chốt chặn hồi quy
+└── [MODIFY] target.service.ts                     # Bản vá sửa lỗi tận gốc
+```
 
 ### 1. `[MODIFY]` `path/to/test.spec.ts`
```

---

### 2. `[MODIFY]` `.agents/workflows/only-one-debug.md`

- **Status**: `[x]`
- **Context**: File active agent workflow cần đồng bộ 1:1 với asset template.
- **Target Symbols / AST Seams**: Step 4 instruction và `debug.md` template Section 2.
- **Invariants**: Đồng bộ chính xác với `assets/workflows/only-one-debug.md`.
- **Depends On**: Task 1.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Đồng bộ nội dung bổ sung Directory Structure Changes sang `.agents/workflows/only-one-debug.md`.

**Ponytail checklist**
- [x] Required by proven root cause.
- [x] Existing implementation and dependencies searched.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Đồng bộ 1:1 giữa `.agents/workflows/` và `assets/workflows/`.
- **Rejected alternative**: Chỉ sửa trong assets bỏ qua `.agents`.

```diff
@@ -86,3 +86,4 @@
 1. Update frontmatter to `status: planning`.
-2. Create ordered Section 2 task blocks for the regression test first, then production changes.
+2. Include an ASCII Directory Structure tree diagram at the top of Section 2 showing affected tests and source files with standard action tags (`[NEW]`, `[MODIFY]`, `[DELETE]`).
+3. Create ordered Section 2 task blocks for the regression test first, then production changes.
-3. Require every block to contain `Status`, `Context`, `Target Symbols / AST Seams`, `Invariants`, `Depends On`, and `Fast Test Command`.
-4. Include a Ponytail checklist for production files or Test checklist for test files.
-5. Include a Git-standard Unified Diff in each block.
-6. Keep changes minimal and directly tied to proven root cause.
+4. Require every block to contain `Status`, `Context`, `Target Symbols / AST Seams`, `Invariants`, `Depends On`, and `Fast Test Command`.
+5. Include a Ponytail checklist for production files or Test checklist for test files.
+6. Include a Git-standard Unified Diff in each block.
+7. Keep changes minimal and directly tied to proven root cause.
@@ -148,2 +149,11 @@
 ## Section 2. File Changes
+
+### Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)
+Sơ đồ cây ASCII trực quan thể hiện các tệp kiểm thử hồi quy và mã nguồn cần chỉnh sửa:
+
+```text
+src/path/to/module/
+├── [NEW]    __tests__/defect-reproduction.test.ts # Red test tái hiện lỗi & chốt chặn hồi quy
+└── [MODIFY] target.service.ts                     # Bản vá sửa lỗi tận gốc
+```
 
 ### 1. `[MODIFY]` `path/to/test.spec.ts`
```

---

### 3. `[MODIFY]` `assets/workflows/index.ts`

- **Status**: `[x]`
- **Context**: Version hiện tại của `only-one-debug` là `0.0.8`.
- **Target Symbols / AST Seams**: `WORKFLOWS` manifest array `only-one-debug` item.
- **Invariants**: Bump patch version lên `0.0.9`.
- **Depends On**: Task 1.
- **Fast Test Command**: `npx vitest run test/core/assets/version-gate.test.ts`.

> **Action**: Tăng version của `only-one-debug` manifest từ `0.0.8` lên `0.0.9`.

**Ponytail checklist**
- [x] Required by proven root cause.
- [x] Existing implementation and dependencies searched.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Tăng patch version tuân thủ version gate.
- **Rejected alternative**: Giữ nguyên version cũ gây vi phạm version gate.

```diff
@@ -70,3 +70,3 @@
     {
         name: 'only-one-debug',
-        version: '0.0.8',
+        version: '0.0.9',
         description:
```

---

### 4. `[MODIFY]` `test/core/workflow-registry.test.ts`

- **Status**: `[x]`
- **Context**: Test kiểm tra domain invariants của `only-one-debug` chưa kiểm tra thuật ngữ `Directory Structure`.
- **Target Symbols / AST Seams**: `it('preserves workflow-specific domain invariants over output formatting')`.
- **Invariants**: Test suite pass 100%.
- **Depends On**: Task 1.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Bổ sung `Directory Structure` vào contract invariants của `only-one-debug`.

**Test checklist**
- [x] Fixture / helper reuse: Tận dụng existing test case.
- [x] No duplicate setup: Dùng chung loop assertion.
- [x] Test covers changed behavior only: Kiểm tra term `Directory Structure`.
- [x] Existing test toolchain used: vitest.
- **Decision**: Bổ sung `Directory Structure` vào invariant terms của `only-one-debug`.
- **Rejected alternative**: Không kiểm tra và để lọt hồi quy.

```diff
@@ -104,3 +104,3 @@
             'only-one-flash': ['Review Gate', 'Zero Disk', 'File Changes', '**Target**', '**Preserve**'],
-            'only-one-debug': ['Diagnosis', 'machine-readable file task blocks', 'Hypotheses Rejected'],
+            'only-one-debug': ['Diagnosis', 'Directory Structure', 'machine-readable file task blocks', 'Hypotheses Rejected'],
         };
```

---

## Section 3. Verification

### Red Feedback Loop
- [x] Reproduction fails before patch for expected reason: `assets/workflows/only-one-debug.md` chưa chứa `Directory Structure`.
- [x] Same reproduction passes after patch.

### Regression
- [x] Targeted tests pass: `npx vitest run test/core/workflow-registry.test.ts` (PASS - 10 passed).
- [x] Related module tests pass: `npx vitest run test/core/assets/version-gate.test.ts` (PASS - 2 passed).
- [x] Full test suite passes: `npm test` (PASS - 55 test files passed, 242 tests passed).
- [x] TypeScript compilation passes: `npm run build` (PASS - 0 errors).

### Evidence
- `npx vitest run test/core/workflow-registry.test.ts` — `PASS`.
- **Lessons Learned**: Luôn đảm bảo tính nhất quán của cấu trúc trực quan (ASCII Directory Structure) giữa tất cả các workflow sinh mã hoặc áp dụng thay đổi mã nguồn.
