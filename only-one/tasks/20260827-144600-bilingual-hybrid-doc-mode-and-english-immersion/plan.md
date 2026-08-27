---
status: done
slug: bilingual-hybrid-doc-mode-and-english-immersion
started_at: 2026-08-27
completed_at: 2026-08-27
pr_url: ~
branch: ~
---

# Plan: Chuẩn hóa Kiến trúc Tài liệu 2 Lớp (Dual-Layer: Song ngữ cho Người + Ma trận Siêu tốc cho Agent)

## Section 1. Current State (Hiện trạng & Phân tích)

### 1.1 Hiện trạng thực tế trong Codebase
- **Quy tắc Ngôn ngữ trong các Workflows ([assets/workflows/](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows))**:
  - Hầu hết các file workflow (`only-one-plan.md`, `only-one-apply.md`, `only-one-review.md`, `only-one-debug.md`) đang quy định viết bằng tiếng Anh 100% mặc định, tạo ra rào cản nhận thức lớn cho lập trình viên.
- **Tốc độ và Độ chính xác khi Agent đọc Plan ([assets/workflows/only-one-apply.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/only-one-apply.md))**:
  - Khi `plan.md` dài và có nhiều văn bản diễn giải, Agent phải đọc lướt qua nhiều đoạn văn tự nhiên để tìm danh sách file cần sửa, dễ gây tốn token và có nguy cơ bỏ sót các hàm/phần cần can thiệp.
  - Cần một **Bảng Ma trận Tác vụ Máy Đọc Siêu Tốc (Machine-Readable Task Matrix)** ở Section 3 để Agent parse ngay trong 1 giây mà không phụ thuộc vào độ dài phần giải thích của con người.

### 1.2 Những hành vi bắt buộc giữ nguyên (Invariants)
- Giữ nguyên 100% tên biến, tên hàm, class, interface, DTO, SQL query, terminal CLI commands, đường dẫn file bằng **Tiếng Anh**.
- Giữ nguyên cấu trúc 6 phần bắt buộc của `plan.md` và các trường YAML frontmatter.
- Giữ nguyên mục **`💬 English Expression Coaching`** ở cuối mỗi phản hồi hội thoại.

---

## Section 2. Detailed Design (Thiết kế chi tiết)

### 2.1 Mô hình Kiến trúc 2 Lớp (Dual-Layer Architecture)

```text
+-----------------------------------------------------------------------------------+
| 👤 LỚP 1: DÀNH CHO BẠN (Human-Friendly - Tiếng Việt + Thuật ngữ Anh)              |
|    - Section 1 & 2: Diễn giải bài toán, kiến trúc, phân tích luồng bằng Tiếng Việt|
|    - Thuật ngữ kỹ thuật giữ nguyên từ gốc Tiếng Anh kèm giải thích trong ngoặc đơn|
|    - Sơ đồ Mermaid / ASCII trực quan giúp nắm bắt 100% bản chất thiết kế.         |
+-----------------------------------------------------------------------------------+
| 🤖 LỚP 2: DÀNH CHO AGENT (Machine-Readable Task Matrix - Tốc độ & Chuẩn xác cao)  |
|    - Section 3: Bảng Ma trận Tác vụ có cấu trúc chuẩn hóa cao:                   |
|      Order | Action | File Path | Target Symbols | Depends On | Fast Test Command  |
|    - Section 4: Code snippets có nhãn [TARGET SEAM] định vị dòng code chính xác.  |
|    - Agent parse ma trận trong 1 giây, thực thi tuần tự và test tức thì từng file.|
+-----------------------------------------------------------------------------------+
```

### 2.2 Quy chuẩn Bảng Ma trận Tác vụ Máy Đọc (Machine-Readable Task Matrix) trong Section 3
Mọi file `plan.md` được sinh ra sẽ bắt buộc có bảng định dạng sau trong Section 3:

```markdown
### 3.1 Machine-Readable Task Matrix & Dependency Graph

| Order | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[NEW]` | `path/to/new-file.ts` | `ServiceName.methodName` | `None` | `npm test test/new-file.test.ts` |
| **2** | `[MODIFY]` | `path/to/existing.ts` | `Controller.handler` | `Order 1` | `npm test test/existing.test.ts` |
```

### 2.3 Cơ chế Tích lũy Sổ tay Tiếng Anh Kỹ thuật (`only-one/learn/`)
Mỗi khi kết thúc task và chạy `/only-one-archive`:
- Tự động trích xuất các mẫu câu từ Section 6 của `plan.md` vào các file chuyên đề trong `only-one/learn/` (`architecture.md`, `testing-and-debugging.md`, `git-and-workflow.md`).

---

## Section 3. Implementation Architecture & Task Graph

### 3.1 Machine-Readable Task Matrix & Dependency Graph

| Order | Action | File Path | Target Symbols / Responsibilities | Depends On | Fast Test Command |
| :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[MODIFY]` | `assets/workflows/only-one-idea.md` | Cập nhật mục Language sang chuẩn Song ngữ Lai (Bilingual Hybrid). | `None` | `npm run build` |
| **2** | `[MODIFY]` | `assets/workflows/only-one-plan.md` | Tích hợp Dual-Layer Architecture & Machine-Readable Task Matrix vào Section 3. | `Order 1` | `npm run build` |
| **3** | `[MODIFY]` | `assets/workflows/only-one-apply.md` | Hướng dẫn Agent ưu tiên parse bảng Task Matrix và chạy Fast Test Command. | `Order 2` | `npm run build` |
| **4** | `[MODIFY]` | `assets/workflows/only-one-debug.md` | Cập nhật báo cáo RCA sang chuẩn Song ngữ Lai. | `None` | `npm run build` |
| **5** | `[MODIFY]` | `assets/workflows/only-one-review.md` | Cập nhật báo cáo 5-Axis Review sang chuẩn Song ngữ Lai. | `None` | `npm run build` |
| **6** | `[MODIFY]` | `assets/workflows/only-one-archive.md` | Tự động phân loại và lưu Technical English vào `only-one/learn/*.md`. | `None` | `npm run build` |
| **7** | `[MODIFY]` | `assets/workflows/only-one-handoff.md` | Cập nhật tài liệu handoff sang chuẩn Song ngữ Lai. | `None` | `npm run build` |
| **8** | `[MODIFY]` | `assets/workflows/only-one-conflict.md` | Cập nhật tài liệu xử lý xung đột git sang chuẩn Song ngữ Lai. | `None` | `npm run build` |

---

## Section 4. Implementation Code Examples

### 4.1 `[MODIFY]` `assets/workflows/only-one-plan.md`
*Bổ sung quy chuẩn Kiến trúc 2 Lớp (Dual-Layer) và bảng Ma trận Tác vụ vào Section 3 của template plan.*

```markdown
// [TARGET SEAM: Section 3 template definition]
#### Section 3. Implementation Architecture & Task Graph
Describe the scaffold at directory and file level with explicit **Machine-Readable Task Matrix**:

### 3.1 Machine-Readable Task Matrix & Dependency Graph

| Order | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[NEW]` | `path/to/file.ts` | `Class.method` | `None` | `npm test path/to/file.test.ts` |
| **2** | `[MODIFY]` | `path/to/other.ts` | `Class.handler` | `Order 1` | `npm test path/to/other.test.ts` |
```

### 4.2 `[MODIFY]` `assets/workflows/only-one-apply.md`
*Hướng dẫn Agent nhảy thẳng vào bảng Ma trận Tác vụ ở Section 3 để nạp tác vụ tức thì.*

```markdown
// [TARGET SEAM: Step 4 parsing task list]
### Step 4 — Parse the Machine-Readable Task Matrix & Dependencies

1. Read **Section 3.1 Machine-Readable Task Matrix** in `plan.md`.
2. Extract the structured list: `Order`, `Action`, `File Path`, `Target Symbols`, `Depends On`, `Fast Test Command`.
3. For each file change in order:
   - Verify prerequisite (`Depends On`) has completed.
   - Apply the code modifications specified in Section 4.
   - Run the dedicated `Fast Test Command` immediately to verify without waiting for full suite.
```

---

## Section 5. Test Cases (Kịch bản kiểm thử)

1. **TC1: Typecheck & Build Validation (`npm run build`)**
   - **Mục tiêu**: Đảm bảo toàn bộ TypeScript của CLI biên dịch thành công 100%.
   - **Lệnh thực thi**: `npm run build`
   - **Kết quả mong đợi**: Exit code 0, không có lỗi linter/typechecker.

2. **TC2: Kiểm tra Tính Nhất quán Ngôn ngữ & Ma trận Tác vụ**
   - **Mục tiêu**: Rà soát 100% các file workflow trong `assets/workflows/` đã có định nghĩa Dual-Layer và bảng Ma trận Tác vụ.
   - **Kết quả mong đợi**: Cú pháp Markdown và bảng Table hợp lệ.

3. **TC3: Đồng bộ Runtime `.agents/workflows/`**
   - **Mục tiêu**: Sao chép toàn bộ các file cập nhật sang `.agents/workflows/`.
   - **Kết quả mong đợi**: Thư mục runtime nhận diện đầy đủ các quy tắc mới.

---

## Section 6. Technical English Key Patterns

### 1. Dual-layer architecture
- **Meaning (VI)**: Kiến trúc 2 lớp; phân tách tài liệu thành một lớp thân thiện với con người và một lớp tối ưu hóa cho máy/AI đọc hiểu.
- **Grammar / Usage**: `Dual-layer [Noun]` $\rightarrow$ Cấu trúc phân tách 2 tầng.
- **Engineering Example**:
  > *"Adopting a dual-layer architecture bridges human cognitive ergonomics and machine parsing efficiency."*

### 2. Machine-parseable blueprint
- **Meaning (VI)**: Bản thiết kế có cấu trúc chuẩn hóa cao giúp máy/AI bóc tách dữ liệu nhanh chóng và chuẩn xác tuyệt đối.
- **Grammar / Usage**: `[Adjective] blueprint` $\rightarrow$ Bản vẽ kỹ thuật máy đọc được.
- **Engineering Example**:
  > *"The Task Matrix serves as a machine-parseable blueprint, allowing the agent to ingest implementation steps in milliseconds."*

### 3. Fast-path indexing
- **Meaning (VI)**: Chỉ mục đường tắt; cơ chế cho phép nhảy thẳng đến dữ liệu cần thiết mà không phải duyệt qua toàn bộ nội dung dài.
- **Grammar / Usage**: `[Noun-adj] indexing` $\rightarrow$ Kỹ thuật lập chỉ mục truy cập nhanh.
- **Engineering Example**:
  > *"Fast-path indexing empowers `/only-one-apply` to execute file modifications in strict dependency order with targeted test verification."*
