# Concept: Bổ sung Quét debug.md vào Workflow /only-one-clean & Kỹ năng task-lifecycle-resolution

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Khi chạy `/only-one-clean`, Step 0 (Pre-clean Auto-Archive) thực hiện quét `only-one/tasks/` để tự động lưu trữ các task hoàn thành trước khi dọn dẹp và hợp nhất archive.
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - `only-one-clean.md` và `task-lifecycle-resolution` hiện tại chỉ quét tìm tệp `plan.md` với `status: done` (hoàn thành) và `status: in-progress | planned` (đang xử lý).
  - Toàn bộ các task debug tạo bởi `/only-one-debug` (chứa tệp `debug.md`) bị bỏ sót:
    - Task debug đã fix (`status: fixed`) không được quét để tự động chắt lọc archive và xóa thư mục task thô.
    - Task debug đang chẩn đoán (`status: diagnosing | planning`) không được bảo vệ khỏi nguy cơ dọn dẹp.
- **Nguyên nhân cốt lõi (Root Cause)**: Step 0 chỉ truy vấn tên tệp `plan.md` mà chưa nhận diện `debug.md`.
- **Tác động (Impact / Blast Radius)**: Thư mục `only-one/tasks/` bị tồn đọng các folder debug cũ sau khi sửa lỗi xong.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Bổ sung cơ chế quét nhận diện tệp `debug.md` song song với `plan.md` trong Step 0 của `only-one-clean.md` và `task-lifecycle-resolution`, giữ nguyên vẹn luồng chắt lọc và cấu trúc archive tiêu chuẩn hiện tại.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Quét nhận diện cả 2 loại tệp task artifact trong `only-one/tasks/`:
    - Với `plan.md`: Hoàn thành khi `status: done`; Đang chạy khi `status: in-progress | planned`.
    - Với `debug.md`: Hoàn thành khi `status: fixed`; Đang chạy khi `status: diagnosing | planning`.
  - Giữ nguyên quy trình chắt lọc archive chuẩn mực:
    - Trích xuất negative rules vào `only-one/rules.md`.
    - Tạo tệp archive tiêu chuẩn `only-one/archives/<timestamp>-<slug>.md` (tinh gọn từ nội dung task `plan.md` hoặc `debug.md`).
    - Xóa thư mục task thô sau khi archive thành công.
  - Bảo vệ các task đang chạy (`status: in-progress`, `planned`, `diagnosing`, `planning`).
  - Toàn bộ hướng dẫn workflow được viết bằng **English chuẩn**, các template tài liệu giữ format **Bilingual Hybrid**.
  - Đồng bộ template trong `assets/workflows/`, `.agents/workflows/`, `assets/skills/` (nếu có), và `.agents/skills/`.

## 2. Scope Boundaries (Ranh giới Phạm vi)
- **In-Scope**:
  - Cập nhật Step 0 trong `assets/workflows/only-one-clean.md` và `.agents/workflows/only-one-clean.md`.
  - Cập nhật `.agents/skills/task-lifecycle-resolution/SKILL.md` (và `assets/skills/task-lifecycle-resolution/SKILL.md` nếu có).
  - Cập nhật version `only-one-clean` trong `assets/workflows/index.ts`.
- **Explicit Out-of-Scope**:
  - Không thay đổi cấu trúc tệp `only-one/archives/*.md` (giữ nguyên mẫu archive chuẩn duy nhất hiện hành).
  - Không thay đổi logic Step 1 (Domain Grouping), Step 2 (Deep Logic Verification), Step 3 (De-fragmentation & Purge).

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### Core Mechanism: Unified Task Scanning Protocol in Step 0

```text
/only-one-clean
     │
     ▼
[Step 0: Pre-Clean Auto-Archive]
     │
     ├── 1. Quét all task folders trong only-one/tasks/
     │      ├─ Nếu chứa plan.md:
     │      │    ├─ status: done ───────────────────► [EXECUTE ARCHIVE PROTOCOL]
     │      │    └─ status: in-progress | planned ──► Log: Preserved active task
     │      │
     │      └─ Nếu chứa debug.md:
     │           ├─ status: fixed ──────────────────► [EXECUTE ARCHIVE PROTOCOL]
     │           └─ status: diagnosing | planning ──► Log: Preserved active debug task
     │
     └── 2. [EXECUTE ARCHIVE PROTOCOL] (Thực hiện chung cho cả plan.md & debug.md):
            ├─ Trích xuất bài học/quy tắc âm ────────► Ghi vào only-one/rules.md
            ├─ Sinh tệp archive chuẩn ───────────────► only-one/archives/<timestamp>-<slug>.md
            └─ Xóa thư mục task thô ─────────────────► rm -rf only-one/tasks/<timestamp>-<slug>
```

### Cấu trúc Archive Tiêu chuẩn (Kế thừa 100% Hiện tại)

```markdown
---
id: <timestamp>-<slug>
title: <Tên Task / Tính năng / Lỗi đã xử lý>
archived_at: <YYYY-MM-DD>
status: active
references:
  - only-one/archives/<previous-related-archive>.md
affected_modules:
  - <module-1>
  - <module-2>
---

# Archive: <Tên Task / Tính năng / Lỗi đã xử lý>

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: <Tóm tắt ngắn gọn vấn đề/lỗi đã được giải quyết>
- **Giá trị (Value)**: <Lợi ích cốt lõi mang lại cho hệ thống/người dùng>

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Hướng tiếp cận (Approach)**: <Giải pháp kỹ thuật tổng quan / RCA tóm tắt>
- **Sơ đồ (Diagram)**: <Sơ đồ Mermaid nếu có>

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- Danh sách các module và file đã sửa đổi (kèm liên kết clickable).

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: 100% Passed.
- **PR URL / Branch**: <Liên kết PR hoặc tên branch>
```

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)
- **Thư mục task có cả 2 file `plan.md` và `debug.md`**: Đọc tổng hợp cả 2 file để tạo 1 file archive duy nhất và xóa thư mục task.
- **Task không có trạng thái hợp lệ**: Giữ nguyên thư mục task và thông báo warning.
