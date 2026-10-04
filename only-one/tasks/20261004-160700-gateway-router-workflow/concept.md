# Concept: Xây dựng Gateway Router Workflow (/only-one)

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Hệ thống sở hữu 11 workflows chuyên biệt (`idea`, `plan`, `apply`, `debug`, `flash`, `review`, `clean`, `conflict`, `pr-git`, `clockify`, `intranet`). Người dùng khi gặp một bài toán cụ thể thường mất thời gian lựa chọn hoặc gọi sai workflow.
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - Developer mới không nhớ hết danh sách slash-commands và điều kiện kích hoạt của từng workflow.
  - Sử dụng sai quy trình: Dùng quy trình nặng (`idea` $\to$ `plan` $\to$ `apply`) cho task nhỏ, hoặc dùng `flash` cho bài toán lớn cần chẩn đoán RCA sâu.
  - Không tận dụng được ngữ cảnh tự động của workspace (trạng thái task hiện hành, merge conflict dở dang, uncommitted diffs).
- **Nguyên nhân cốt lõi (Root Cause)**: Chưa có một điểm tiếp nhận trung tâm (Single Entry Point / Gateway Workflow) đảm nhiệm việc phân tích intent, trinh sát ngữ cảnh và định tuyến thông minh.
- **Tác động (Impact / Blast Radius)**: Gây lúng túng trong trải nghiệm người dùng, giảm tốc độ tương tác và tăng nguy cơ vi phạm quy trình phát triển chuẩn của repository.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Xây dựng workflow gateway mang tên `/only-one` (hoặc `only-one-router`) đóng vai trò bộ điều hướng thông minh (Smart Triage & Routing Dispatcher).
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - **Single Entry Point**: Tiếp nhận mọi dạng raw input: mô tả tính năng, log lỗi, đường dẫn file/task hoặc yêu cầu rỗng.
  - **Triage 3 Tầng**:
    1. *Tầng Ngữ cảnh Workspace*: Tự động phát hiện git conflict, active tasks trong `only-one/tasks/`, hoặc uncommitted changes.
    2. *Tầng Phân loại Intent*: Nhận diện chính xác 8 nhóm nhu cầu chính (Bug fix, Idea scoping, Flash change, Implementation, Review, Conflict, Clean, Timesheet).
    3. *Tầng Khuyến nghị & Handoff*: Xuất bảng kết quả điều hướng kèm câu lệnh chính xác để người dùng kích hoạt chỉ bằng 1 click.
  - **Tuân thủ Chuẩn 70% ASD-STE100**: Trình bày kết quả điều hướng dạng bảng và bullet points súc tích, câu ngắn $\le 25$ từ, loại bỏ hoàn toàn văn xuôi rườm rà.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Thiết kế đặc tả luồng Triage và ma trận phân loại Intent cho gateway workflow.
  - Khởi tạo workflow asset `assets/workflows/only-one.md` và `.agents/workflows/only-one.md`.
  - Đăng ký workflow manifest `only-one` trong `assets/workflows/index.ts`.
  - Bổ sung `only-one` vào danh sách workflows của toàn bộ các combos trong `assets/combos/index.ts`.
  - Bổ sung test case kiểm tra tính toàn vẹn registry trong `test/core/workflow-registry.test.ts`.
- **Explicit Out-of-Scope**:
  - Không tự ý chạy ngầm các workflow con mang tính phá hủy dữ liệu (destructive actions) mà không có sự xác nhận của người dùng.
  - Không thay đổi hành vi logic bên trong của 11 workflows hiện hữu.

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### 3.1. Ma trận Điều hướng Ngữ cảnh & Ý định (Context & Intent Matrix)

| Tín hiệu Đầu vào / Trạng thái Repo | Phân loại Tác vụ | Workflow Đích Khuyến nghị |
| :--- | :--- | :--- |
| Phát hiện `MERGE_HEAD` hoặc `git status` có conflict marker | Merge Conflict dở dang | `/only-one-conflict` |
| Input chứa Stack Trace, Error Log, Exception, Crash | Chẩn đoán lỗi kỹ thuật | `/only-one-debug` |
| Yêu cầu tính năng mới lớn, kiến trúc mới, yêu cầu còn mơ hồ | Khảo sát & đặc tả bài toán | `/only-one-idea` |
| Task nhỏ, rõ ràng, phạm vi $\le 2$ files, can thiệp nhanh | Thực thi nhanh không lưu đĩa | `/only-one-flash` |
| Input chứa đường dẫn task có `concept.md` chưa có plan | Lập kế hoạch thực thi chi tiết | `/only-one-plan <task-folder>` |
| Input chứa đường dẫn task có `plan.md` / `debug.md` | Thực thi mã nguồn theo kế hoạch | `/only-one-apply <task-folder>` |
| Yêu cầu review code, kiểm tra PR, audit chất lượng | Đánh giá & review chất lượng mã | `/only-one-review` |
| Yêu cầu dọn dẹp task cũ, kiểm tra archives, purge tài liệu | Bảo trì & dọn dẹp kho lưu trữ | `/only-one-clean` |
| Yêu cầu push code, tạo GitHub Pull Request | Tạo PR trên GitHub | `/only-one-pr-git` |
| Yêu cầu log work, chấm công, timesheet | Ghi nhận thời gian làm việc | `/only-one-clockify` \| `/only-one-intranet` |

---

### 3.2. Sơ đồ Luồng Hoạt động (Operating Model Flow)

```text
┌─────────────────────────────────────────────────────────────┐
│                 /only-one <user input>                      │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
   [Trinh sát Ngữ cảnh]                  [Phân tích Intent]
   - Kiểm tra git status                 - Bóc tách từ khóa kỹ thuật
   - Quét only-one/tasks/                - Đánh giá độ phức tạp scope
            └──────────────────┬──────────────────┘
                               │
                               ▼
                    {Độ rõ ràng >= 90%?}
                     ├── Có ──► [Xuất Báo cáo Điều hướng & Lệnh gợi ý]
                     └── Không ► [Hỏi 1 câu trắc nghiệm làm rõ mục tiêu]
                                          │
                                          ▼
                               [Handoff & Dừng Turn]
```

---

### 3.3. Định dạng Báo cáo Đầu ra (Output Format)

```markdown
### 🧭 Only-One Workflow Gateway

- **Phân loại tác vụ**: <Tên phân loại ngắn gọn>
- **Căn cứ đánh giá**: <1 câu giải thích lý do chọn workflow này, <= 25 từ>
- **Workflow khuyến nghị**: `/only-one-<name>`

👉 **Câu lệnh thực thi đề xuất**:
```text
/only-one-<name> <các tham số đã chuẩn hóa>
```
```

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

- **Rủi ro 1: Nhầm lẫn giữa Flash và Idea/Plan**: Task thoạt nhìn có vẻ nhỏ nhưng tiềm ẩn rủi ro kiến trúc lớn.
  - *Chiến lược khắc phục*: Nếu input chứa các từ khóa tác động sâu (ví dụ: `database schema`, `auth guard`, `refactor core`), gateway sẽ ưu tiên đề xuất `/only-one-idea` kèm cảnh báo blast radius.
- **Rủi ro 2: Input rỗng (No input provided)**: User chỉ gõ `/only-one`.
  - *Chiến lược khắc phục*: Tự động quét trạng thái git và task folder gần nhất; nếu workspace sạch sẽ, hiển thị bảng menu tổng quan kèm các ví dụ kích hoạt.
