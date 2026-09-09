---
status: done
slug: enhance-debug-workflow-with-debug-md
started_at: 2026-09-09
completed_at: 2026-09-09
pr_url: ~
branch: ~
---

# Plan: Cải tiến Workflow /only-one-debug với Tài liệu Lưu trữ debug.md & RCA Review Gate

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- Workflow `only-one-debug.md` hiện tại (`assets/workflows/only-one-debug.md` và `.agents/workflows/only-one-debug.md`) chỉ thực hiện chẩn đoán và in kết quả ra terminal/chat tóm tắt, không lưu trữ artifact có cấu trúc trong `only-one/tasks/`.
- Thiếu một **Cổng Review Nguyên nhân (RCA Review Gate)** bắt buộc giữa pha chẩn đoán (xác định Root Cause bằng Red test) và pha lập kế hoạch sửa lỗi / can thiệp mã nguồn.
- Thiếu cấu trúc tài liệu vá lỗi chuẩn hóa dạng **Task Matrix & Unified Diff** giống `plan.md` để kiểm soát các điểm neo AST Seams và ngăn chặn regression.
- **Invariants**:
  - Giữ nguyên triết lý chẩn đoán cốt lõi của `diagnosing-bugs` (Red feedback loop $\rightarrow$ Minimize $\rightarrow$ Hypothesize $\rightarrow$ Instrument $\rightarrow$ Surgical fix $\rightarrow$ Regression guard).
  - Đồng bộ 100% giữa file template trong `assets/workflows/only-one-debug.md` và file runtime trong `.agents/workflows/only-one-debug.md`.
  - Tăng version của `only-one-debug` trong `assets/workflows/index.ts` từ `0.0.1` lên `0.0.2`.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
- Kế thừa 100% cơ chế vận hành từ [concept.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/only-one/tasks/20260909-104100-enhance-debug-workflow-with-debug-md/concept.md).
- **Type Signatures & Manifest Contracts**:
  - `assets/workflows/index.ts`: Cập nhật `WORKFLOWS` entry cho `only-one-debug` (`version: '0.0.2'`, mô tả cập nhật).
- **Workflow Seams & Protocol Gates**:
  - Section 1 trong `debug.md`: Symptom & Red Feedback Loop (Error log, failing reproduction test, fast test command).
  - Section 2 trong `debug.md`: Root Cause Analysis & Hypotheses (Mechanical root cause, instrumentation evidence, violated invariants, proposed fix strategy).
  - **RCA Review Gate**: Chốt chặn bắt buộc dừng lại (Stop & Wait) sau Section 2 để người dùng duyệt trước khi lập Task Matrix & Unified Diff.
  - Section 3 trong `debug.md`: Directory Structure & Task Matrix (AST seams, actions, depends on, test commands).
  - Section 4 trong `debug.md`: Code Changes (Unified Diff chuẩn Git cho test và surgical fix).
  - Section 5 trong `debug.md`: Verification & Regression Guard (Full suite verification, lessons learned / rules.md).

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes
```text
assets/
├── workflows/
│   ├── [MODIFY] index.ts               # Bump version only-one-debug lên 0.0.2
│   └── [MODIFY] only-one-deb| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `assets/workflows/index.ts` | `WORKFLOWS` (entry `only-one-debug`) | `None` | `npm run build` |
| **2** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-debug.md` | Toàn bộ cấu trúc workflow và template `debug.md` | `Order 1` | `npm test` |
| **3** | `[x]` | `[MODIFY]` | `.agents/workflows/only-one-debug.md` | Đồng bộ 100% nội dung với `assets/workflows/only-one-debug.md` | `Order 2` | `npm test` |

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `assets/workflows/index.ts`
> **Action**: Bump version `only-one-debug` lên `0.0.2` và cập nhật mô tả bao gồm Review Gate và `debug.md`.

```diff
@@ -48,6 +48,6 @@
     {
         name: 'only-one-debug',
-        version: '0.0.1',
+        version: '0.0.2',
         description:
-            'Perform systematic Root Cause Analysis (RCA) and deliver a minimal verified fix using disciplined red feedback loops.',
+            'Perform systematic Root Cause Analysis (RCA) with a mandatory Review Gate, document debug.md, and deliver a minimal verified fix.',
         requiredSkills: [
```

### 2. `[MODIFY]` `assets/workflows/only-one-debug.md`
> **Action**: Tái cấu trúc workflow sang mô hình 2 Pha với RCA Review Gate và tài liệu artifact `debug.md` chuẩn Task Matrix / Unified Diff.

```diff
(Đã áp dụng trọn vẹn workflow 2 pha với RCA Review Gate và debug.md template)
```

### 3. `[MODIFY]` `.agents/workflows/only-one-debug.md`
> **Action**: Đồng bộ 100% nội dung với `assets/workflows/only-one-debug.md`.

```diff
(Đã đồng bộ trọn vẹn)
```

## Section 5. Test Cases & Verification
- **Automated Tests**:
  - `[x]` `npm run build`: `PASS` (Build thành công, TypeScript type checking sạch sẽ).
  - `[x]` `npm test`: `PASS` (Toàn bộ test suite chạy thành công).
- **Manual Checks**:
  - `[x]` Đối chiếu nội dung giữa `assets/workflows/only-one-debug.md` và `.agents/workflows/only-one-debug.md` để đảm bảo đồng nhất 100%.
  - `[x]` Kiểm tra `assets/workflows/index.ts` có version `0.0.2` cho workflow `only-one-debug`.bắt buộc lưu vào `only-one/tasks/<...>/debug.md`.
+- **Enforce Bilingual Hybrid Summary**: Giải thích RCA và báo cáo bằng tiếng Việt; giữ nguyên file path, code và thuật ngữ kỹ thuật bằng tiếng Anh.
+- Never apply a fix without first reproducing the failure with a red feedback loop.
+- Never perform unrelated refactoring in a bug fix.
+- Always include an automated regression test.
+- Keep the fix minimal, surgical, and scoped directly to the defect.
```

### 3. `[MODIFY]` `.agents/workflows/only-one-debug.md`
> **Action**: Đồng bộ 100% nội dung với `assets/workflows/only-one-debug.md`.

```diff
(Đồng bộ toàn bộ nội dung tương ứng như file assets/workflows/only-one-debug.md ở trên)
```

## Section 5. Test Cases & Verification
- **Automated Tests**:
  - `npm run build`: Kiểm tra compile TypeScript thành công, không phát sinh lỗi type trong `assets/workflows/index.ts`.
  - `npm test`: Kiểm tra toàn bộ test suites hiện tại của CLI vẫn hoạt động bình thường.
- **Manual Checks**:
  - Đối chiếu nội dung giữa `assets/workflows/only-one-debug.md` và `.agents/workflows/only-one-debug.md` để đảm bảo đồng nhất 100%.
  - Kiểm tra `assets/workflows/index.ts` có version `0.0.2` cho workflow `only-one-debug`.
