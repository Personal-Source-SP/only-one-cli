# Concept: Cơ chế Thực thi Song song với Sub-agent trong /only-one-apply

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Người dùng khởi chạy workflow `/only-one-apply` để thực thi kế hoạch triển khai gồm nhiều task blocks từ `plan.md`.
- **Hiện tượng & Khiếm khuyết kỹ thuật**: Quá trình áp dụng code và kiểm thử diễn ra hoàn toàn tuần tự đơn luồng (sequential single-thread); Main Agent phải xử lý từng file một, khiến thời gian chờ đợi (wall-clock latency) kéo dài và làm phình to context window của Main Agent.
- **Nguyên nhân cốt lõi (Root Cause)**: Workflow `/only-one-apply` chưa có logic phân tích đồ thị phụ thuộc (DAG Analysis) trên trường `Depends On` để bóc tách các task độc lập thành các luồng song song (Parallel Slices) giao cho Sub-agent.
- **Tác động (Impact / Blast Radius)**: Trải nghiệm người dùng bị chậm trễ khi thực thi các kế hoạch lớn; rủi ro context saturation khiến Main Agent giảm độ chính xác ở các bước cuối.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Bổ sung quy trình phân tích DAG và ủy quyền Sub-agent song song (Parallel Sub-agent Execution) vào `/only-one-apply` cho các task độc lập, tối ưu hóa thời gian thực thi nhưng vẫn bảo toàn tính toàn vẹn mã nguồn.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Nhận diện chính xác các task blocks độc lập (không có quan hệ phụ thuộc chéo và tác động trên các file tách biệt).
  - Ủy quyền thực thi file change và Fast Test Command tương ứng cho các Sub-agents chạy đồng thời.
  - Duy trì Barrier Synchronization: Các task có `Depends On` bắt buộc phải chờ tất cả task tiền đề hoàn tất và kiểm thử thành công trước khi bắt đầu.
  - Cơ chế cô lập lỗi: Nếu một Sub-agent thất bại (Red Test hoặc compiler error), lập tức dừng các task phụ thuộc và báo cáo về Main Agent để điều phối khắc phục.

## 2. Scope Boundaries (Ranh giới Phạm vi)
- **In-Scope**:
  - Đặc tả quy trình DAG Scheduling và Sub-agent Execution Protocol trong `/only-one-apply`.
  - Quy tắc phân xử xung đột tài nguyên (File Lock & Disjoint File Invariant): Nghiêm cấm 2 Sub-agents chỉnh sửa cùng một file cùng lúc.
  - Định dạng báo cáo tiến độ hợp nhất (Aggregated Progress Reporting) từ các Sub-agents về Main Agent.
- **Explicit Out-of-Scope**:
  - Không tự động tái cấu trúc lại các công cụ nền tảng của IDE hoặc API máy chủ bên ngoài.
  - Không thay đổi cấu trúc dữ liệu cốt lõi của Section 2 `plan.md` (giữ nguyên chuẩn task block hiện hành).
  - Không phân chia song song các task phụ thuộc chặt chẽ nhằm tránh race condition.

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)
- **Core Mechanism**:
  - **Mô hình Orchestrator - Worker DAG**:
    1. *Phân tích Đồ thị (DAG Partitioning)*: Main Agent đọc Section 2 của `plan.md`, phân nhóm các task thành các tầng thực thi (Execution Waves / Levels) dựa trên `Depends On`.
    2. *Phân bổ Luồng Song song (Parallel Dispatch)*: Với mỗi tầng, các task không xung đột file được spawn thành các Sub-agents độc lập.
    3. *Thực thi & Kiểm thử Cục bộ (Isolated Execution)*: Mỗi Sub-agent nhận diff của 1 task, áp dụng thay đổi, chạy `Fast Test Command`, và trả kết quả `SUCCESS` hoặc `FAILED` kèm bằng chứng.
    4. *Đồng bộ Hóa & Cập nhật Trạng thái (Barrier Sync & Status Update)*: Main Agent gom kết quả, cập nhật trạng thái `[x]` vào `plan.md`, và kích hoạt tầng thực thi tiếp theo.
- **Conceptual Flow / Domain Model**:
  - `Plan Ingestion` ➔ `Build Dependency DAG` ➔ `Identify Wave N (Zero-blocking tasks)` ➔ `Spawn Concurrent Sub-agents` ➔ `Barrier Wait & Collect Evidence` ➔ `Evaluate Wave N Pass?` ➔ *(Yes: Advance to Wave N+1 / No: Halt & Trigger Bug Diagnosis)* ➔ `Final Comprehensive Verification`.

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)
- **Xung đột Ghi File (Write Conflict Race Condition)**: Xảy ra khi hai task độc lập vô tình chỉnh sửa cùng một tệp chung (ví dụ `index.ts` re-export). *Biện pháp*: Main Agent bắt buộc kiểm tra tập giao các file can thiệp (Disjoint Set Check). Nếu trùng file, bắt buộc xếp tuần tự thay vì song song.
- **Cạn kiệt Tài nguyên & Rate Limit (Sub-agent Concurrency Spikes)**: Khởi chạy quá nhiều Sub-agents đồng thời có thể gây nghẽn terminal hoặc vượt quá giới hạn token/concurrency. *Biện pháp*: Giới hạn trần số lượng Sub-agents chạy đồng thời (Concurrency Cap, ví dụ tối đa 3-4 workers).
- **Phản ứng dây chuyền khi Task lỗi (Cascading Failure)**: Một task cơ sở bị lỗi làm sai lệch giả định của các task song song. *Biện pháp*: Fast Fail & Graceful Cancellation đối với các nhánh liên quan.
