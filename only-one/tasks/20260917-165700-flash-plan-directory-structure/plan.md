---
status: completed
slug: flash-plan-directory-structure
started_at: 2026-09-17
completed_at: 2026-09-17
pr_url: ~
branch: ~
---

# Plan: Cải thiện Cấu trúc Hiển thị Target và Mô tả trong Flash Plan (only-one-flash)

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- Hiện tại, template `only-one-flash.md` (tại `assets/workflows/` và `.agents/workflows/`) quy định phần `Target` của Flash Plan dạng danh sách phẳng gạch đầu dòng (`- <file_path> (<symbol>): <mô tả>`), gây thiếu phân cấp trực quan và không đồng bộ với visual language chuẩn (ASCII Tree) trong Section 3.1 của `only-one-plan`.
- Phần `Mô tả` trong template hiện đang hiển thị trên 1 dòng duy nhất, gây khó đọc và dồn cục thông tin khi một micro-task có nhiều ý kỹ thuật hoặc lưu ý quan trọng.
- Invariant bắt buộc duy trì: Giữ trọn vẹn đặc tính Zero Disk Plan Footprint, Review Gate bắt buộc ở Step 2, và không làm ảnh hưởng đến luồng thực thi 4 bước của `only-one-flash`.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
*(Kế thừa 100% cơ chế vận hành từ concept.md; không phát sinh Type Contract mới)*

- **Markdown Template Seams**:
  - `assets/workflows/only-one-flash.md`:
    - Role overview (Line 17): Chuẩn hóa thuật ngữ mô tả định dạng plan (`Target Structure` thay vì target thô).
    - Step 2 (Lines 61-70): Thay thế khối mã mẫu Flash Plan sang sơ đồ cây ASCII có Action Tags (`[MODIFY]`, `[NEW]`, `[DELETE]`, `[RENAME]`) và hỗ trợ bullet points cho `Mô tả`.
  - `.agents/workflows/only-one-flash.md`: Đồng bộ 100% các thay đổi tương ứng từ `assets/workflows/only-one-flash.md`.
  - `assets/workflows/index.ts`: Tăng version manifest của `only-one-flash` từ `0.0.2` lên `0.0.3` để bảo vệ CI version gate.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
/
├── assets/workflows/
│   ├── [MODIFY] index.ts            # Bump version only-one-flash (0.0.2 -> 0.0.3)
│   └── [MODIFY] only-one-flash.md   # Cập nhật template Flash Plan (ASCII tree + multi-bullet Mô tả)
└── .agents/workflows/
    └── [MODIFY] only-one-flash.md   # Đồng bộ template Flash Plan đang active
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `assets/workflows/index.ts` | `WORKFLOWS[only-one-flash].version` | `None` | `npm test test/core/workflow-registry.test.ts` |
| **2** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-flash.md` | `Role`, `Step 2 Flash Plan Template` | `Order 1` | `npm test test/core/workflow-registry.test.ts` |
| **3** | `[x]` | `[MODIFY]` | `.agents/workflows/only-one-flash.md` | `Role`, `Step 2 Flash Plan Template` | `Order 2` | `npm test` |

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `assets/workflows/index.ts`
> **Action**: Nâng phiên bản của workflow `only-one-flash` lên `0.0.3`.

```diff
@@ -115,3 +115,3 @@ export const WORKFLOWS: WorkflowManifest[] = [
     {
         name: 'only-one-flash',
-        version: '0.0.2',
+        version: '0.0.3',
         description:
```

### 2. `[MODIFY]` `assets/workflows/only-one-flash.md`
> **Action**: Cập nhật mô tả Role và mẫu Flash Plan trong Step 2 sang ASCII tree & multi-bullet Mô tả.

```diff
@@ -17,2 +17,2 @@
 - - Output an ultra-clean, structured plan directly into the chat response and **pause for user confirmation/feedback** before applying code changes (containing only **Mô tả**, **Target** source structure with brief descriptions, and **Verification**).
 + - Output an ultra-clean, structured plan directly into the chat response and **pause for user confirmation/feedback** before applying code changes (containing only **Mô tả**, **Target Structure** ASCII tree with brief descriptions and AST seams, and **Verification**).
@@ -62,7 +62,15 @@
 ⚡ **Flash Plan**:
-- **Mô tả**: <Tóm tắt 1-2 câu về giải pháp và mục tiêu thực thi>
-- **Target**:
-  - `<file_path_1>` (`<symbol_or_seam>`): <Mô tả ngắn gọn vai trò / nội dung thay đổi>
-  - `<file_path_2>` (`<symbol_or_seam>`): <Mô tả ngắn gọn vai trò / nội dung thay đổi>
+- **Mô tả**:
+  - <Gạch đầu dòng 1: Tóm tắt giải pháp / mục tiêu chính>
+  - <Gạch đầu dòng 2: Cơ chế kỹ thuật hoặc điểm lưu ý nếu có nhiều ý>
+- **Target Structure**:
+```text
+src/path/to/module/
+├── [MODIFY] target.service.ts        # Seam: methodName() - Thêm logic xử lý
+├── [NEW]    dto/target-filter.dto.ts # Class: TargetFilterDto - Validate input params
+└── [DELETE] legacy.helper.ts         # Xóa helper cũ deprecated
+```
 - **Verification**: `<Fast Test / Lint / Build Command>`
 ```
+
+*(Lưu ý: Nếu phần `Mô tả` chỉ có đúng 1 ý ngắn gọn duy nhất, có thể viết inline trên cùng dòng `- **Mô tả**: <Nội dung>`, nhưng khi có từ 2 ý trở lên thì bắt buộc tách thành các gạch đầu dòng con để tăng tính trực quan).*
```

### 3. `[MODIFY]` `.agents/workflows/only-one-flash.md`
> **Action**: Đồng bộ nội dung cập nhật cho workflow `only-one-flash.md` trong `.agents/workflows/`.

```diff
@@ -17,2 +17,2 @@
 - - Output an ultra-clean, structured plan directly into the chat response and **pause for user confirmation/feedback** before applying code changes (containing only **Mô tả**, **Target** source structure with brief descriptions, and **Verification**).
 + - Output an ultra-clean, structured plan directly into the chat response and **pause for user confirmation/feedback** before applying code changes (containing only **Mô tả**, **Target Structure** ASCII tree with brief descriptions and AST seams, and **Verification**).
@@ -62,7 +62,15 @@
 ⚡ **Flash Plan**:
-- **Mô tả**: <Tóm tắt 1-2 câu về giải pháp và mục tiêu thực thi>
-- **Target**:
-  - `<file_path_1>` (`<symbol_or_seam>`): <Mô tả ngắn gọn vai trò / nội dung thay đổi>
-  - `<file_path_2>` (`<symbol_or_seam>`): <Mô tả ngắn gọn vai trò / nội dung thay đổi>
+- **Mô tả**:
+  - <Gạch đầu dòng 1: Tóm tắt giải pháp / mục tiêu chính>
+  - <Gạch đầu dòng 2: Cơ chế kỹ thuật hoặc điểm lưu ý nếu có nhiều ý>
+- **Target Structure**:
+```text
+src/path/to/module/
+├── [MODIFY] target.service.ts        # Seam: methodName() - Thêm logic xử lý
+├── [NEW]    dto/target-filter.dto.ts # Class: TargetFilterDto - Validate input params
+└── [DELETE] legacy.helper.ts         # Xóa helper cũ deprecated
+```
 - **Verification**: `<Fast Test / Lint / Build Command>`
 ```
+
+*(Lưu ý: Nếu phần `Mô tả` chỉ có đúng 1 ý ngắn gọn duy nhất, có thể viết inline trên cùng dòng `- **Mô tả**: <Nội dung>`, nhưng khi có từ 2 ý trở lên thì bắt buộc tách thành các gạch đầu dòng con để tăng tính trực quan).*
```

## Section 5. Test Cases & Verification
- **Automated Tests**:
  - `npm test test/core/workflow-registry.test.ts` (Passed: 3/3 tests passed)
  - `npm test` (Passed: 55/55 test files passed, 231 passed)
- **Manual Checks**:
  - Đã đối soát 100% tính đồng bộ giữa [assets/workflows/only-one-flash.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-flash.md) và [.agents/workflows/only-one-flash.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/.agents/workflows/only-one-flash.md).
