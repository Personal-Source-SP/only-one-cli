# Concept: Cải tiến Workflow /only-one-debug với Tài liệu Lưu trữ debug.md & Điểm dừng Review RCA

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Khi gặp lỗi hệ thống hoặc test fail, kỹ sư chạy `/only-one-debug <log/error>`. Quy trình hiện tại tuân thủ 5 bước chẩn đoán nhưng:
  - Kết quả điều tra và bản vá chỉ in ra màn hình chat (Summary Report), không lưu trữ lại dấu vết điều tra (Audit Trail) trong `only-one/tasks/`.
  - Tự động sửa mã nguồn ngay mà thiếu một **Điểm dừng Review (Review Gate)** giữa pha chẩn đoán (RCA) và pha lập kế hoạch vá lỗi / sửa file, khiến người dùng không kịp xác thực nguyên nhân gốc rễ trước khi can thiệp mã nguồn.
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - Không có file artifact chuẩn hóa `only-one/tasks/<YYYYMMDD-HHmmss>-debug-<slug>/debug.md`.
  - Thiếu tài liệu đặc tả cách vá lỗi dạng **Diff-Centric & Task Matrix** (tương tự như `plan.md`).
  - Thiếu cơ chế kiểm soát chất lượng 2 pha (Diagnosis Approval Gate) trước khi chạm vào các file trong codebase.
- **Nguyên nhân cốt lõi (Root Cause)**: Workflow `only-one-debug.md` ban đầu được thiết kế theo dạng script tương tác dòng lệnh trực tiếp mà chưa tích hợp quy trình Review Gate và hệ sinh thái Task Artifacts (`only-one/tasks/`) của `only-one-cli`.
- **Tác động (Impact / Blast Radius)**: Nguy cơ vá sai hướng (treating symptom instead of root cause) nếu giả thuyết ban đầu chưa được người dùng xác thực, đồng thời thiếu tài liệu hồi cứu kỹ thuật (Post-Mortem).

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Nâng cấp workflow `only-one-debug.md` (và template trong `assets/workflows/`) thành quy trình **2 Pha với Điểm dừng Review bắt buộc (RCA Review Gate)**, đồng thời lưu trữ toàn bộ tiến trình vào `only-one/tasks/<YYYYMMDD-HHmmss>-debug-<slug>/debug.md`.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Tự động tạo thư mục task chuẩn format `only-one/tasks/<YYYYMMDD-HHmmss>-debug-<slug>/` khi bắt đầu quá trình debug.
  - **Pha 1 (Chẩn đoán & Xác định Nguyên nhân - Diagnosis & RCA)**:
    - Thực hiện Step 1 (Red feedback loop) $\rightarrow$ Step 2 (Minimize & Localize) $\rightarrow$ Step 3 (Hypothesize & Evidence).
    - Khởi tạo `debug.md` với `status: diagnosing` và ghi nhận đầy đủ:
      - **Section 1. Symptom & Red Feedback Loop**: Log lỗi, test case tái hiện (Red test) và Fast Test Command.
      - **Section 2. Root Cause Analysis & Hypotheses**: Cơ chế lỗi cốt lõi (Mechanical root cause), bằng chứng thực nghiệm (Evidence), các invariant bị vi phạm và phương hướng khắc phục dự kiến.
    - 🛑 **Dừng lại tại Cổng Review (Mandatory RCA Review Gate)**: Trình bày kết quả chẩn đoán và chờ người dùng xác nhận trước khi phân tích sâu vào danh sách file / sinh diff.
  - **Pha 2 (Kế hoạch Vá lỗi & Thực thi - Surgical Patch & Verification)** *(Sau khi User duyệt)*:
    - Lập danh sách file, AST Seams, **Section 3 (Directory Structure & Task Matrix)**.
    - Xây dựng **Section 4 (Code Changes Unified Diff)** với bản vá tối giản và test case chống hồi quy.
    - Áp dụng patch, chạy test chuyển sang GREEN, chạy full test suite.
    - Hoàn tất **Section 5 (Verification & Regression Guard)**, ghi nhận lessons learned vào `only-one/rules.md` (nếu có), chuyển `status: fixed`.
  - Đồng bộ template cả trong `assets/workflows/only-one-debug.md` và `.agents/workflows/only-one-debug.md`.

## 2. Scope Boundaries (Ranh giới Phạm vi)
- **In-Scope**:
  - Cập nhật workflow specification tại `assets/workflows/only-one-debug.md` và `.agents/workflows/only-one-debug.md`.
  - Thiết lập cơ chế Review Gate bắt buộc sau khi hoàn thành Section 1 & Section 2 trong `debug.md`.
  - Quy định cấu trúc chuẩn của tệp `debug.md` với đầy đủ Frontmatter, Section 1 đến Section 5.
  - Hướng dẫn cơ chế tiếp tục thực thi sau khi User approve RCA.
- **Explicit Out-of-Scope**:
  - Không thay đổi hành vi của các workflow độc lập khác (`only-one-plan`, `only-one-apply`, `only-one-idea`).
  - Không sửa đổi mã nguồn dự án bên ngoài các file workflow.

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### Core Mechanism: Luồng 2 Pha với RCA Review Gate

```text
               /only-one-debug <log/symptom>
                            │
                            ▼
      ┌────────────────────────────────────────────────────────┐
      │ PHA 1: CHẨN ĐOÁN & XÁC ĐỊNH NGUYÊN NHÂN (DIAGNOSIS)    │
      │ 1. Tạo only-one/tasks/<...>/debug.md (status: diagnosing)│
      │ 2. Xây dựng Red Feedback Loop ────► Ghi Section 1      │
      │ 3. Đặt Giả thuyết & Đo Bằng chứng ─► Ghi Section 2     │
      └────────────────────────────────────────────────────────┘
                            │
                            ▼
           🛑 [CỔNG REVIEW NGUYÊN NHÂN (RCA REVIEW GATE)]
              - Trình bày RCA & Phương hướng khắc phục
              - DỪNG LẠI và chờ User phê duyệt ("Duyệt", "OK", "Fix tiếp"...)
                            │
                            ▼ (User Approved)
      ┌────────────────────────────────────────────────────────┐
      │ PHA 2: KẾ HOẠCH VÁ LỖI & THỰC THI (PATCH & VERIFY)      │
      │ 4. Lập Task Matrix & Unified Diff ─► Ghi Section 3 & 4 │
      │ 5. Áp dụng Surgical Minimal Patch                       │
      │ 6. Chạy Verification (Test GREEN, Lint, Full Suite)    │
      │ 7. Ghi Section 5, update rules.md, chuyển status: fixed│
      └────────────────────────────────────────────────────────┘
                            │
                            ▼
                 In thông báo hoàn tất & link debug.md
```

### Chi tiết Cấu trúc `debug.md` Template

```markdown
# Debug: <Tên Lỗi / Triệu chứng Ngắn gọn>

---
status: diagnosing | planning | fixed | failed
slug: <kebab-case-slug>
started_at: <YYYY-MM-DD HH:mm:ss>
completed_at: <YYYY-MM-DD HH:mm:ss>
reproduction_test: <Lệnh test hoặc file test tái hiện>
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Triệu chứng & Stack Trace**: <Chi tiết log lỗi hoặc hành vi sai lệch>.
- **Red Test Case**: <Test case tự động chứng minh lỗi trước khi vá>.
- **Lệnh chạy tái hiện**: `<Fast Test Command>`

## Section 2. Root Cause Analysis & Hypotheses (Phân tích Nguyên nhân)
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**: <Bản chất kỹ thuật bên dưới>.
- **Bằng chứng & Dữ liệu thực nghiệm (Evidence)**: <Kết quả log/instrumentation chứng minh>.
- **Invariants bị vi phạm**: <Ràng buộc hoặc giả định ngầm trong mã nguồn bị phá vỡ>.
- **Chiến lược khắc phục dự kiến (Proposed Fix Strategy)**: <Tóm tắt phương hướng sửa chữa trước khi lập diff>.

---
*(🛑 Điểm dừng Review: Người dùng phê duyệt Section 1 & 2 trước khi chuyển sang Section 3 & 4)*
---

## Section 3. Directory Structure & Task Matrix
### 3.1 Directory Structure Changes
```text
src/path/to/module/
├── [MODIFY] target.service.ts       # Surgical patch fix root cause
└── [NEW]    target.service.spec.ts  # Regression test case
```

### 3.2 Task Matrix
| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[NEW]` | `path/to/test.spec.ts` | `describe('reproduction')...` | `None` | `npm test path/to/test.spec.ts` |
| **2** | `[x]` | `[MODIFY]` | `path/to/target.ts` | `TargetClass.targetMethod` | `Order 1` | `npm test path/to/test.spec.ts` |

## Section 4. Code Changes (Unified Diff)
### 1. `[NEW]` `path/to/test.spec.ts`
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

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)
- **Người dùng bác bỏ RCA ở Review Gate**: Workflow sẽ quay lại Step 2 & 3 để đặt giả thuyết mới (Hypothesis Refinement) và thu thập thêm bằng chứng instrumentation thay vì tiến hành vá mã nguồn sai hướng.
- **Trường hợp lỗi môi trường / không thể tạo automated test**: Ghi nhận rõ manual reproduction steps trong Section 1 và đề xuất phương án kiểm thử thay thế trong Section 2 để người dùng review.
