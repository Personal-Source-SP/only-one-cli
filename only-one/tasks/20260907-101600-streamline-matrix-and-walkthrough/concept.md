# Concept: Tinh Gọn Task Matrix, Hợp Nhất Walkthrough & Tái Định Nghĩa Section 2 Plan.md

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**:
  - Bảng **Section 3.2 Task Matrix & Dependency Graph** hiện có 8 cột, trong đó cột `Reused Existing Utilities / Helpers` chiếm diện tích chiều ngang rất lớn, khiến bảng markdown bị tràn khung hình (horizontal overflow) và vỡ layout trên màn hình chia đôi (split editor) của IDE.
  - Sau khi kết thúc `/only-one-apply`, một file riêng biệt `only-one/tasks/<slug>/walkthrough.md` được tự động sinh ra trên đĩa.
  - Trong tài liệu `plan.md`, mục **Section 2. Detailed Design** hiện đang yêu cầu mô tả lại cơ chế vận hành, luồng xử lý và state transitions.
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - **Trùng lặp giữa Concept và Plan**: Nội dung của "Section 2. Detailed Design" trong `plan.md` lặp lại 80–90% nội dung đã được viết rất kỹ tại mục "3.2 Cơ chế Hoạt động Chi tiết" của `concept.md`.
  - **Trùng lặp giữa Plan và Walkthrough**: Nội dung của `walkthrough.md` bị trùng lặp tới hơn 80% so với `plan.md` (cả hai đều liệt kê tệp thay đổi, danh sách task hoàn thành `[x]`, các lệnh test và tóm tắt kỹ thuật).
  - Nhà phát triển thường chỉ đọc tin nhắn kết quả trong khung chat rồi chạy tiếp các lệnh khác chứ hiếm khi mở file `walkthrough.md` trên đĩa.
- **Nguyên nhân cốt lõi (Root Cause)**:
  - Hướng dẫn của `only-one-plan.md` chưa phân định rõ ranh giới: `concept.md` là nơi giữ nguồn chân lý về mặt giải pháp & cơ chế tổng quan (WHAT, WHY, HOW AT HIGH LEVEL); còn `plan.md` chỉ cần tập trung vào chi tiết mã nguồn cụ thể (HOW AT CODE LEVEL).
  - Quy ước cũ ép buộc tách riêng một file nghiệm thu độc lập thay vì ghi nhận trực tiếp kết quả kiểm thử vào **Section 5. Test Cases & Verification** của chính `plan.md`.
  - Cột tái sử dụng tiện ích trong Task Matrix là thông tin bổ trợ trong khâu thiết kế (đã nằm trong Section 1b hoặc mô tả Action ở Section 4), không nhất thiết phải thành một cột bảng cố định cho từng file.
- **Tác động (Impact / Blast Radius)**:
  - Gây béo phì tài liệu (*Documentation Bloat*), mỗi task phình to lên 3 file (`concept.md`, `plan.md`, `walkthrough.md`).
  - Gây lãng phí thời gian review những đoạn văn lặp đi lặp lại giữa concept và plan.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**:
  - Tái định nghĩa Section 2 của `plan.md` thành **Technical Contracts & AST Seams**: Tuyệt đối cấm chép lại cơ chế từ `concept.md`, chỉ tập trung khai báo Types, DTOs, Interfaces, và AST seams cụ thể.
  - Tinh gọn bảng Task Matrix về 7 cột chuẩn, tối ưu độ rộng hiển thị trên mọi giao diện IDE.
  - Xóa bỏ sự phụ thuộc vào file `walkthrough.md` độc lập; hợp nhất bằng chứng nghiệm thu (Verification Evidence) trực tiếp vào **Section 5 của `plan.md`**, đồng thời hiển thị bản tóm tắt nghiệm thu trực quan ngay trong tin nhắn phản hồi của lượt chạy `/only-one-apply`.

- **Hành vi & Tiêu chí Nghiệm thu (Acceptance Criteria)**:
  - **Tái định nghĩa Section 2 (Phương án A)**:
    - Đổi tên thành `Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)`.
    - Thiết lập quy tắc **Anti-Concept-Duplication**: Cấm viết lại văn mẫu cơ chế giải pháp đã có ở `concept.md`. Chỉ khai báo TypeScript Interfaces, DTO decorators, exact function signatures, hook state seams.
    - Nếu thay đổi đơn giản không phát sinh Type/DTO mới: Chỉ cần 1 dòng: `Kế thừa 100% cơ chế vận hành tại concept.md; không phát sinh Type Contract mới.`
  - **Task Matrix gọn nhẹ (7 cột)**: Loại bỏ cột `Reused Existing Utilities / Helpers` khỏi bảng Section 3.2 trong `only-one-plan.md` và `only-one-apply.md`. Cột chuẩn còn lại:
    `| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |`
  - **Hợp nhất Walkthrough vào `plan.md`**:
    - Khi `/only-one-apply` hoàn tất, AI sẽ cập nhật trực tiếp bảng kết quả kiểm thử (Test Execution Evidence: PASS/FAIL, logs) vào **Section 5 của `plan.md`**.
    - AI KHÔNG tạo thêm file `walkthrough.md` trên đĩa.
    - AI hiển thị bản báo cáo nghiệm thu trực quan dạng Markdown ngay trong tin nhắn chat để dev theo dõi tức thì.
  - **Cập nhật `only-one-archive.md`**: Cho phép archive hoạt động mượt mà với chỉ 2 file cốt lõi (`concept.md` và `plan.md`), không bắt buộc phải có `walkthrough.md`.
  - **Cập nhật `only-one/rules.md`**: Điều chỉnh quy tắc về tài liệu task (mỗi task chỉ gồm `concept.md` và `plan.md`).

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - `assets/workflows/only-one-plan.md` & `.agents/workflows/only-one-plan.md`: Tái định nghĩa Section 2; xóa cột thừa trong Task Matrix.
  - `assets/workflows/only-one-apply.md` & `.agents/workflows/only-one-apply.md`: Xóa cột thừa trong Task Matrix; chuyển bước authoring `walkthrough.md` thành cập nhật Section 5 của `plan.md` và xuất tóm tắt trực tiếp ra chat.
  - `assets/workflows/only-one-archive.md` & `.agents/workflows/only-one-archive.md`: Loại bỏ điều kiện kiểm tra bắt buộc `walkthrough.md`, chỉ đọc `plan.md` (hỗ trợ đọc fallback `walkthrough.md` cũ nếu có).
  - `assets/workflows/index.ts`: Nâng patch version cho `plan`, `apply`, `archive`.
  - `only-one/rules.md`: Đồng bộ quy tắc 2 tệp cho task lifecycle.

- **Explicit Out-of-Scope**:
  - Không thay đổi các workflows phân tích khác (`only-one-idea`, `only-one-debug`, `only-one-review`).
  - Không sửa đổi mã nguồn CLI của `only-one-cli`.

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### 3.1 Chi tiết Thiết kế Section 2 Mới trong `plan.md` (Phương án A)

```markdown
## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
*(Kế thừa 100% cơ chế vận hành từ concept.md; tuyệt đối không chép lại giải pháp tổng quan)*

- **Type Signatures & Contracts** (nếu có):
  ```typescript
  export interface OrderFilterQuery {
    provinceCode?: string;
    wardCode?: string;
  }
  ```
- **AST Seams & State Hooks**:
  - `StationsPage.tsx`: Controlled state `selectedProvince` neo tại line X.
  - `order.service.ts`: Method `filterOrders` seam tại line Y.
```

### 3.2 Chuẩn hóa Task Matrix 7 Cột (Section 3.2)
Bỏ cột `Reused Existing Utilities / Helpers`. Bảng trở nên cực kỳ tinh gọn:

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[ ]` | `[NEW]` | `src/modules/order/dto/order.dto.ts` | `OrderFilterDto` | `None` | `npm test order.dto.spec.ts` |
| **2** | `[ ]` | `[MODIFY]` | `src/modules/order/order.service.ts` | `OrderService.filter` | `Order 1` | `npm test order.service.spec.ts` |

### 3.3 Cơ chế Hợp nhất Nghiệm thu vào `plan.md` (Section 5)
1. **Cập nhật `plan.md`**:
   - `status: done`, `completed_at: YYYY-MM-DD`.
   - Tất cả các task trong Task Matrix chuyển thành `[x]`.
   - Đánh dấu checklist `[x]` và đính kèm bằng chứng kiểm thử (PASS/FAIL) vào **Section 5**.
2. **Báo cáo Chat Trực quan**:
   - In bản tóm tắt nghiệm thu trực tiếp ra màn hình chat.
   - ❌ **CẤM** tạo file `walkthrough.md` trên đĩa.

### 3.4 Cập nhật Quy trình Archive (`only-one-archive.md`)
- Bỏ yêu cầu bắt buộc tìm `walkthrough.md`. AI đọc `plan.md` và `concept.md` để tạo archive.

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

- **Rủi ro AI vẫn có xu hướng chép lại văn mẫu ở Section 2**:
  - *Biện pháp*: Bổ sung quy tắc **Anti-Concept-Duplication** cứng vào Guardrails của `only-one-plan.md`. Nếu AI chép lại cơ chế giải pháp thay vì khai báo code contracts/seams thì bị coi là vi phạm guardrail.
- **Tương thích ngược với các task cũ có sẵn `walkthrough.md`**:
  - *Biện pháp*: `only-one-archive.md` đọc `plan.md` làm nguồn chính, đọc fallback `walkthrough.md` nếu task cũ còn lưu file này.
