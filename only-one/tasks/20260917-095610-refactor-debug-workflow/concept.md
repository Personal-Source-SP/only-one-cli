# Concept: Tái Cấu Trúc Workflow Only-One-Debug & Mở Rộng Only-One-Apply Cho Debugging

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Trong quy trình phát triển và gỡ lỗi của `only-one-cli`, hiện có sự phân mảnh và thiếu đồng bộ giữa `/only-one-debug` và `/only-one-apply`:
  1. **Mô tả giải pháp trong `debug.md` bị mờ nhạt**: Phần giải pháp (`Proposed Fix Strategy`) chỉ là 1 dòng ngắn gộp chung trong Section 2 (Root Cause Analysis), không thể hiện rõ cấu trúc source code sẽ sửa đổi và cách sửa cụ thể cho từng tệp.
  2. **Review Gate gây ngắt quãng**: Cơ chế `MANDATORY RCA REVIEW GATE` cũ dừng chờ phê duyệt giữa chừng, không đáp ứng nhu cầu tự động hóa luồng từ phân tích đến vá lỗi.
  3. **`only-one-apply` chưa hỗ trợ `debug.md`**: `only-one-apply` hiện chỉ nhận `plan.md`. Khi có tài liệu `debug.md` đã hoàn tất phân tích và sinh Unified Diff, người dùng không thể tận dụng cơ chế thực thi từng bước (step-by-step diff application & per-file fast test) mạnh mẽ của `only-one-apply` cho tác vụ debug.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**:
  1. **Tách bạch & Chi tiết hóa Giải pháp trong `debug.md`**:
     - `2.1 Mechanical Root Cause & Invariants`: Tập trung 100% vào bản chất kỹ thuật, log thực nghiệm, ràng buộc bị phá vỡ.
     - `2.2 Proposed Solution & Target Source Structure`: Mô tả cơ chế giải pháp cốt lõi + Sơ đồ cây ASCII cấu trúc file với nhãn `[NEW]`, `[MODIFY]`, `[DELETE]` và ghi chú ngắn gọn cách sửa (Action note) cho từng file.
  2. **Loại bỏ Review Gate trong `only-one-debug`**: Tự động hóa toàn diện luồng phân tích, lập giải pháp, sinh Task Matrix & Unified Diff.
  3. **Hợp nhất Cơ chế Thực thi vào `only-one-apply`**:
     - Mở rộng `only-one-apply` để hỗ trợ cả `plan.md` lẫn `debug.md` (nhận diện qua đường dẫn hoặc tự động tìm kiếm các task có `status: planned`, `status: diagnosing`, `status: planning`, `status: in-progress`).
     - Tận dụng cùng một cỗ máy áp dụng diff tuần tự (Section 3 Task Matrix & Section 4 Unified Diff) và chạy `Fast Test Command` cho cả feature planning và bug debugging.

- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Tài liệu `only-one-debug.md` được chuẩn hóa với Section 2.1 & 2.2 rõ ràng, bỏ Review Gate.
  - Tài liệu `only-one-apply.md` cập nhật mô tả, input format (`/only-one-apply [<task-folder> | <plan-path> | <debug-path>]`), và quy tắc parse linh hoạt cho cả `plan.md` & `debug.md`.
  - Cả hai file workflow tại `assets/workflows/` và `.agents/workflows/` đều được đồng bộ.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Cập nhật workflow `only-one-debug.md` (`assets/workflows/only-one-debug.md` và `.agents/workflows/only-one-debug.md`).
  - Cập nhật workflow `only-one-apply.md` (`assets/workflows/only-one-apply.md` và `.agents/workflows/only-one-apply.md`).
  - Chuẩn hóa cấu trúc tài liệu `debug.md` (Section 2.1 & 2.2 kèm cây ASCII tệp mã nguồn và ghi chú cách sửa từng file).
- **Explicit Out-of-Scope**:
  - Không thay đổi các workflow khác (`only-one-plan`, `only-one-idea`, `only-one-review`, `only-one-clean`...).
  - Không thay đổi mã nguồn logic CLI TypeScript.

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### 3.1 Cấu trúc Chuẩn hóa của Tài liệu `debug.md`

```markdown
# Debug: <Tên Lỗi / Triệu chứng Ngắn gọn>

---
status: diagnosing | planning | in-progress | fixed | failed
slug: <kebab-case-slug>
started_at: <YYYY-MM-DD HH:mm:ss>
completed_at: ~
reproduction_test: <Lệnh test hoặc file test tái hiện>
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Triệu chứng & Stack Trace**: <Chi tiết log lỗi hoặc hành vi sai lệch>.
- **Red Test Case**: <Test case tự động chứng minh lỗi trước khi vá>.
- **Lệnh chạy tái hiện**: `<Fast Test Command>`

## Section 2. Root Cause Analysis & Proposed Solution (Phân tích & Đề xuất Giải pháp)
### 2.1 Mechanical Root Cause & Invariants
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**: <Bản chất kỹ thuật bên dưới>.
- **Bằng chứng & Dữ liệu thực nghiệm (Evidence)**: <Kết quả log/instrumentation chứng minh>.
- **Invariants bị vi phạm**: <Ràng buộc hoặc giả định ngầm trong mã nguồn bị phá vỡ>.

### 2.2 Proposed Solution & Target Source Structure
- **Cơ chế giải pháp cốt lõi (Core Fix Mechanism)**: <Mô tả phương án kỹ thuật xử lý triệt để nguyên nhân gốc>.
- **Cấu trúc tệp thay đổi (Source Structure Changes)**:
```text
src/path/to/module/
├── [MODIFY] target.service.ts       # Áp dụng surgical patch: xử lý điều kiện biên và fallback an toàn
├── [NEW]    target-helper.ts        # Helper độc lập phục vụ validate/transform logic
└── [MODIFY] target.service.spec.ts  # Test case tái hiện lỗi ban đầu (Red) và chống hồi quy (Green)
```

## Section 3. Task Matrix & Dependency Graph
| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[ ]` | `[MODIFY]` | `path/to/test.spec.ts` | `describe('reproduction')...` | `None` | `npm test path/to/test.spec.ts` |
| **2** | `[ ]` | `[MODIFY]` | `path/to/target.ts` | `TargetClass.targetMethod` | `Order 1` | `npm test path/to/test.spec.ts` |

## Section 4. Code Changes (Unified Diff)
### 1. `[MODIFY]` `path/to/test.spec.ts`
> **Action**: Thêm test case tái hiện lỗi và chống hồi quy (Regression Guard).
```diff
...
```

### 2. `[MODIFY]` `path/to/target.ts`
> **Action**: Áp dụng bản vá tối giản (Surgical Minimal Patch).
```diff
...
```

## Section 5. Verification & Regression Guard
- **Automated Tests**:
  - `npm test <reproduction-test-path>`: `PASS (Green)`
  - Full Test Suite: `PASS`
  - Lint / Typecheck: `PASS`
- **Bài học kinh nghiệm (Lessons Learned)**:
  - <Cập nhật quy tắc âm vào only-one/rules.md nếu phát hiện trap/anti-pattern>.
```

---

### 3.2 Tích Hợp `debug.md` Vào Workflow `only-one-apply`

Mở rộng `only-one-apply` để thực thi cả `plan.md` và `debug.md`:
1. **Input**:
   ```text
   /only-one-apply [<task-folder> | <plan-path> | <debug-path>]
   ```
2. **Auto-Discovery**:
   - Nếu không truyền tham số, tìm kiếm tệp `plan.md` hoặc `debug.md` trong `only-one/tasks/` có `status: in-progress`, `status: planned`, `status: planning`.
3. **Thực thi Thống nhất**:
   - Đọc Section 3 (Task Matrix) và Section 4 (Unified Diff).
   - Duyệt từng file theo thứ tự phụ thuộc, áp dụng diff, chạy `Fast Test Command`.
   - Chạy full verification và cập nhật Section 5 cùng frontmatter (`status: done` cho plan, `status: fixed` cho debug).

---

### 3.3 Luồng Phối Hợp Tổng Thể

```text
┌─────────────────────────────────────────────────────────────┐
│                    /only-one-debug                          │
│                                                             │
│ 1. Red Loop ──> 2. Root Cause (2.1) ──> 3. Solution (2.2)   │
│                 ──> 4. Sinh Matrix (Sec 3) & Diff (Sec 4)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    /only-one-apply                          │
│                                                             │
│ • Nhận plan.md HOẶC debug.md                                │
│ • Áp dụng từng file theo Task Matrix & Unified Diff          │
│ • Chạy Fast Test Command & Xác minh Green khép kín          │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

- **Trường hợp Task chứa cả `plan.md` và `debug.md`**: Khi người dùng chỉ truyền task folder (ví dụ `/only-one-apply only-one/tasks/xyz`), ưu tiên file có `status: in-progress` hoặc `planning`/`planned`, hoặc hiển thị lựa chọn rõ ràng.
- **Tính nhất quán của Section 3 & 4**: Đảm bảo cả `plan.md` và `debug.md` tuân thủ chính xác 100% định dạng bảng Task Matrix và block Diff để parser của `only-one-apply` hoạt động trơn tru.
