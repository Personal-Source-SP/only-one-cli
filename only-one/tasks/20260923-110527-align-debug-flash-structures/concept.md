# Concept: Chuẩn hóa cấu trúc `/only-one-debug` và `/only-one-flash`

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: `/only-one-plan` đã chuyển sang cấu trúc file-centric gồm Directory Structure, machine-readable File Changes và Verification, trong khi `/only-one-debug` và `/only-one-flash` vẫn dùng output contract cũ.
- **Hiện tượng & Khiếm khuyết kỹ thuật**: Debug còn phân tán RCA, evidence và patch blueprint qua nhiều section; Flash chưa có File Changes đủ rõ để review từng file; Skills Catalog chưa đồng nhất thành một table.
- **Nguyên nhân cốt lõi (Root Cause)**: Ba workflow phát triển độc lập, dùng schema khác nhau cho cùng khái niệm file-level change và execution handoff.
- **Tác động (Impact / Blast Radius)**: Người dùng phải đổi mental model giữa các workflow; `/only-one-apply` cần nhiều ingestion contract; output dài hoặc thiếu metadata tùy workflow.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Chuẩn hóa presentation và file-centric change model nhưng giữ nguyên lifecycle chuyên biệt của Debug và Flash.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - `/only-one-debug` tạo `debug.md` với 3 section chính: `Diagnosis`, `File Changes`, `Verification`.
  - `Diagnosis` giữ các subheading bắt buộc: `Symptom`, `Reproduction`, `Evidence`, `Root Cause`, `Fix Constraints`; `Hypotheses Rejected` chỉ xuất hiện khi có evidence.
  - Debug File Changes dùng full machine-readable task blocks tương thích với `plan.md`.
  - `/only-one-apply` đọc cùng task-block contract từ `plan.md` và `debug.md`, không cần legacy Task Matrix path.
  - `/only-one-flash` giữ Zero Disk Footprint và Review Gate, đồng thời thêm compact `File Changes` trong chat.
  - Flash File Changes chỉ giữ `Target`, `Change`, `Preserve`, `Fast Test`; không có `Status`, `Context`, `Depends On`, Ponytail checklist hay Unified Diff đầy đủ.
  - Thứ tự heading của Flash quyết định execution order.
  - Skills Catalog của Debug và Flash là một table duy nhất giống `/only-one-idea` và `/only-one-plan`.

## 2. Scope Boundaries (Ranh giới Phạm vi)
- **In-Scope**:
  - Chuẩn hóa source và installed copies của `/only-one-debug` và `/only-one-flash`.
  - Điều chỉnh `/only-one-apply` để ingest Debug task blocks cùng schema với Plan.
  - Cập nhật workflow manifests, versions, repository rules và contract tests liên quan.
  - Giữ nguyên các domain disciplines: RCA, Red feedback loop, three-attempt escalation, Flash Review Gate, Ponytail và Zero Disk Footprint.
- **Explicit Out-of-Scope**:
  - Không đổi cấu trúc `/only-one-plan` hoặc `/only-one-idea`.
  - Không biến Flash thành disk artifact workflow.
  - Không thêm parser library, schema file hoặc artifact mới.
  - Không bắt Flash dùng full task metadata hoặc dependency graph.

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)
- **Các option đã cân nhắc**:
  - **Đồng nhất tuyệt đối**: ép Debug và Flash dùng đúng 3 section cùng full task blocks như Plan. Dễ parse nhưng phá lifecycle nhẹ của Flash và tạo output dư thừa.
  - **Chuẩn hóa có chọn lọc — đã chọn**: giữ lifecycle riêng, dùng full task blocks cho Debug và compact file blocks cho Flash. Cân bằng consistency với speed.
  - **Chỉ đổi formatting**: sửa Skills Catalog nhưng giữ output schema cũ. Blast radius thấp nhưng không giải quyết duplication và ingestion drift.
- **Core Mechanism**:
  - Debug gom toàn bộ điều tra vào `Diagnosis`, đặt executable patch blueprint trong `File Changes`, và evidence cuối trong `Verification`.
  - Debug task blocks dùng fixed metadata: `Status`, `Context`, `Target Symbols / AST Seams`, `Invariants`, `Depends On`, `Fast Test Command`.
  - Flash hiển thị compact blocks theo heading order, mỗi block gồm `Target`, `Change`, `Preserve`, `Fast Test`.
  - `/only-one-apply` dùng một full task-block parser contract cho Plan và Debug; Flash tự thực thi sau Review Gate bằng compact chat plan.
- **Conceptual Flow / Domain Model**:
  1. Debug tái hiện failure và thu evidence trong Diagnosis.
  2. Debug tạo ordered full file task blocks và bàn giao cho Apply.
  3. Apply kiểm tra blocking edges, áp dụng diff và chạy Fast Test theo từng block.
  4. Flash nghiên cứu phạm vi nhỏ, trình compact file blocks trong chat, chờ approval rồi thực thi tuần tự.

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)
- **Mất RCA depth**: Gộp Diagnosis có thể thành đoạn văn dài; bắt buộc subheadings để giữ evidence chain rõ ràng.
- **Apply incompatibility**: Debug và Apply phải đổi atomically; bỏ Task Matrix trước khi Apply hiểu task blocks sẽ làm hỏng handoff.
- **Flash scope creep**: Compact File Changes không được mở rộng thành full plan; task lớn hoặc dependency phức tạp phải chuyển sang `/only-one-idea` và `/only-one-plan`.
- **Hidden dependencies trong Flash**: Vì không có `Depends On`, chỉ cho phép execution order tuyến tính theo heading; dependency graph phức tạp nằm ngoài phạm vi Flash.
- **Evidence quality**: `Hypotheses Rejected` chỉ ghi khi đã có phép thử/evidence, tránh tạo reasoning giả.
