# Concept: Cải thiện Cấu trúc Hiển thị Target và Mô tả trong Flash Plan (only-one-flash)

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Khi chạy lệnh `/only-one-flash`, agent xuất ra một kế hoạch thực thi nhanh trực tiếp trong chat (In-Chat Flash Plan) trước khi dừng lại để chờ user phê duyệt (Review Gate).
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - Phần mục tiêu thay đổi (`Target`) hiện tại dùng dạng danh sách phẳng gạch đầu dòng (`- <file_path> (<symbol>): <mô tả>`), thiếu tính phân cấp trực quan và không đồng bộ với visual language chuẩn của `plan.md` (Section 3.1).
  - Phần `Mô tả` bị gò bó thành 1 câu dính liền, khi có nhiều ý định kỹ thuật / mục tiêu con thì hiển thị kém rõ ràng, khó quét nhanh nội dung.
- **Nguyên nhân cốt lõi (Root Cause)**: Mẫu template trong `assets/workflows/only-one-flash.md` và `.agents/workflows/only-one-flash.md` đang định nghĩa spec dạng inline text thô sơ thay vì hỗ trợ bullet points có cấu trúc cho `Mô tả` và sơ đồ cây ASCII cho `Target Structure`.
- **Tác động (Impact / Blast Radius)**: Giảm trải nghiệm người dùng (UX) khi review nhanh kế hoạch trước khi apply, gây thiếu nhất quán về mặt thị giác giữa các workflow trong hệ sinh thái `only-one`.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**:
  - Chuẩn hóa phần `Mô tả` thành danh sách các gạch đầu dòng rõ ràng, súc tích khi có nhiều ý kỹ thuật.
  - Chuẩn hóa định dạng hiển thị `Target Structure` thành sơ đồ cây thư mục trực quan chuẩn ASCII (`text block`), tích hợp sẵn Action Tags (`[MODIFY]`, `[NEW]`, `[DELETE]`, `[RENAME]`) và AST Seam comments.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Cập nhật mẫu template trong `assets/workflows/only-one-flash.md` và `.agents/workflows/only-one-flash.md`.
  - Hỗ trợ phần `Mô tả` dạng bullet points phân tách các ý (mục tiêu cốt lõi, cơ chế kỹ thuật, lưu ý invariant).
  - Khối `Target Structure` dùng sơ đồ cây ASCII có Action Tags và cú pháp comment `# Seam: <symbol> - <mô tả>`.
  - Giữ vững tính chất siêu gọn nhẹ, zero-disk-plan của workflow `/only-one-flash`.

## 2. Scope Boundaries (Ranh giới Phạm vi)
- **In-Scope**:
  - Cập nhật định dạng mẫu `Flash Plan` trong Step 2 của `assets/workflows/only-one-flash.md`.
  - Cập nhật đồng bộ tại `.agents/workflows/only-one-flash.md`.
  - Cập nhật mô tả Role & Protocol liên quan đến cấu trúc Mô tả & Target structure.
- **Explicit Out-of-Scope**:
  - Không thay đổi luồng thực thi (Step 1 -> Step 4) hay cơ chế Review Gate bắt buộc của `only-one-flash`.
  - Không tạo thêm file trên ổ đĩa khi chạy `only-one-flash` (duy trì triệt để Zero Disk Plan Footprint).
  - Không thay đổi các workflow khác (`only-one-plan`, `only-one-apply`, etc.).

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### 3.1 Core Mechanism (Cơ chế Trình bày Chuẩn hóa)
Chuyển đổi khối hiển thị tại **Step 2 (Emit In-Chat Plan & Review Gate)** sang định dạng chuẩn hóa:

```markdown
⚡ **Flash Plan**:
- **Mô tả**:
  - <Gạch đầu dòng 1: Tóm tắt giải pháp / mục tiêu chính>
  - <Gạch đầu dòng 2: Cơ chế kỹ thuật hoặc điểm lưu ý nếu có nhiều ý>
- **Target Structure**:
```text
src/path/to/module/
├── [MODIFY] target.service.ts        # Seam: methodName() - Thêm logic xử lý
├── [NEW]    dto/target-filter.dto.ts # Class: TargetFilterDto - Validate input params
└── [DELETE] legacy.helper.ts         # Xóa helper cũ deprecated
```
- **Verification**: `<Fast Test / Lint / Build Command>`
```

*(Lưu ý: Nếu phần `Mô tả` chỉ có đúng 1 ý ngắn gọn duy nhất, có thể viết inline trên cùng dòng `- **Mô tả**: <Nội dung>`, nhưng khi có từ 2 ý trở lên thì bắt buộc tách thành các gạch đầu dòng con để tăng tính trực quan).*

### 3.2 Action Tags Chuẩn hóa
- `[MODIFY]`: Chỉnh sửa file hiện có (kèm Seam cụ thể).
- `[NEW]`: Tạo mới file.
- `[DELETE]`: Xóa bỏ file không còn dùng.
- `[RENAME]`: Đổi tên hoặc di chuyển đường dẫn file.

### 3.3 So sánh & Đánh giá Giải pháp
- **Ưu điểm**:
  - `Mô tả` dạng bullet points giúp tách bạch các ý kỹ thuật, người dùng nắm bắt nhanh mục đích và phạm vi thay đổi.
  - `Target Structure` dạng ASCII Tree hiển thị rõ ranh giới module/thư mục và các file bị tác động.
  - Đồng bộ 100% với phong cách trình bày chuyên nghiệp của hệ sinh thái `only-one`.

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)
- **Kịch bản 1 Ý vs Nhiều Ý**: Template hướng dẫn rõ ràng: tách bullet points con khi có nhiều ý để tránh dồn cục văn bản dài dòng.
- **Tính nhất quán giữa các file workflow**: Cần đảm bảo cập nhật đồng bộ cả 2 nơi: `assets/workflows/only-one-flash.md` (template nguồn) và `.agents/workflows/only-one-flash.md` (workflow đang active).
