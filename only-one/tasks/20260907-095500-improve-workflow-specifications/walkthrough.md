# Walkthrough: Nâng Cấp Quy Trình Workflows (only-one-idea, only-one-plan, only-one-apply)

Đã hoàn thành xuất sắc việc cải tiến 3 quy trình cốt lõi `only-one-idea`, `only-one-plan`, và `only-one-apply`, giải quyết triệt để vấn đề mô tả đơn khối dài dòng, bổ sung sơ đồ cây thư mục tệp trực quan, thiết lập luồng nghiên cứu File-Centric nạp trúng đích rules/skills và loại bỏ hoàn toàn việc tạo artifact kế hoạch trùng lặp của IDE.

---

## 1. Tóm tắt Các Thay đổi Đã Thực hiện

### 1.1. [only-one-idea.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-idea.md) & [.agents/workflows/only-one-idea.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/.agents/workflows/only-one-idea.md)
- **Step 1 Protocol**: Bổ sung chỉ dẫn cứng cho Senior BA — bắt buộc bóc tách Problem và Goal thành các gạch đầu dòng phân cấp. Nghiêm cấm viết thành các đoạn văn đơn khối (*monolithic paragraphs*) dài lê thê.
- **Step 3 Template**: Chuẩn hóa mẫu markdown của Section 1 `concept.md`:
  - **Problem**: Phân rã thành *Bối cảnh & Điểm kích hoạt (Context/Trigger)*, *Hiện tượng & Khiếm khuyết (Defect/Symptom)*, *Nguyên nhân cốt lõi (Root Cause)*, *Tác động (Impact / Blast Radius)*.
  - **Goal**: Phân rã thành *Mục tiêu cốt lõi (Core Outcome)*, *Tiêu chí nghiệm thu chi tiết (Acceptance Criteria)*.

### 1.2. [only-one-plan.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-plan.md) & [.agents/workflows/only-one-plan.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/.agents/workflows/only-one-plan.md)
- **File-Centric Research Flow (Step 1b & 1c)**:
  - *Bước 1 — Xác định tệp mục tiêu*: Lập danh sách các file cần tác động (`[NEW]`, `[MODIFY]`, `[DELETE]`, `[RENAME]`).
  - *Bước 2 — Nạp tri thức trúng đích*: Dựa vào framework của file để nạp đúng rules/skills IDE (`.agents/rules/`, `.agents/skills/`) và đọc `only-one/rules.md` cùng các `archives/*.md` liên quan trực tiếp đến module đó. Tuyệt đối không nạp ồ ạt để tránh *context pollution*.
  - *Bước 3 — Pre-Diff Compliance Gate*: Chốt chặn kiểm tra chéo từng dòng diff ở Section 4 với các quy chuẩn đã nạp, triệt tiêu *agent drift*.
- **Section 3 Phân tầng**:
  - `3.1 Directory Structure Changes`: Cây thư mục ASCII trực quan với các tag `[NEW]`, `[MODIFY]`, `[DELETE]`, `[RENAME]`.
  - `3.2 Task Matrix & Dependency Graph`: Bảng 8 cột chuẩn machine-readable.
- **Triệt tiêu Artifact Kế hoạch của IDE (Step 4 & Guardrails)**:
  - Loại bỏ hoàn toàn dòng lệnh `Create artifact with RequestFeedback: true...`.
  - Quy định cứng nguyên tắc **Single Plan Document Authority**: Duy nhất một file `only-one/tasks/<slug>/plan.md` được tạo ra và quản lý. Cấm sinh thêm file plan nội bộ của IDE (như `implementation_plan.md` trong Antigravity/Cursor).

### 1.3. [only-one-apply.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-apply.md) & [.agents/workflows/only-one-apply.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/.agents/workflows/only-one-apply.md)
- **Step 3 Ingestion**: Cập nhật chỉ dẫn AI duyệt qua Section 3.1 Directory Structure Changes trước để định hình cấu trúc tệp, sau đó phân giải Section 3.2 Task Matrix để thực thi tuần tự.

### 1.4. [assets/workflows/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/index.ts)
- Nâng patch version:
  - `only-one-idea`: `0.0.3` $\rightarrow$ `0.0.4`
  - `only-one-plan`: `0.0.3` $\rightarrow$ `0.0.4`
  - `only-one-apply`: `0.0.2` $\rightarrow$ `0.0.3`

---

## 2. Bằng chứng Nghiệm thu (Verification Evidence)

| Test Suite / Command | Kết quả | Mô tả |
| :--- | :---: | :--- |
| `npm test test/commands/workflow.test.ts` | **PASS (4/4 tests)** | Xác thực lệnh workflow và tính toàn vẹn của nội dung workflow template. |
| `npm test test/core/assets/version-gate.test.ts` | **PASS (2/2 tests)** | Xác thực 100% manifest asset có decimal version hợp lệ (`X.Y.Z`). |
| `diff -u assets/workflows .agents/workflows` | **PASS (0 diffs)** | Xác nhận đồng bộ tuyệt đối 100% giữa file gốc package và file runtime workspace. |
| `npm test` | **PASS (56 test suites, 229 tests)** | Toàn bộ hệ thống test suite của repository hoạt động hoàn hảo không lỗi. |

---

## 3. Trạng thái Hoàn tất

Nhiệm vụ đã hoàn thành 100% mục tiêu đặt ra. Cả 3 workflow đã sẵn sàng phục vụ cho các chu trình phát triển tiếp theo với trải nghiệm rõ ràng, súc tích và chính xác cao nhất.
