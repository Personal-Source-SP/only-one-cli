# Walkthrough: Chuẩn hóa Kiến trúc Tài liệu 2 Lớp (Dual-Layer: Song ngữ Lai cho Người + Ma trận Tác vụ cho Agent)

Đã triển khai thành công toàn bộ các cập nhật theo đúng kế hoạch tại [plan.md](file:///Users/kiem/Sources/Personal/only-one-cli/only-one/tasks/20260827-144600-bilingual-hybrid-doc-mode-and-english-immersion/plan.md).

---

## 1. Tóm tắt các thay đổi đã thực hiện

### A. Chuẩn hóa Chế độ Song ngữ Lai (Bilingual Hybrid Mode) cho Toàn bộ Workflows
- Cập nhật 100% các file workflow ([assets/workflows/](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows)):
  - **`/only-one-idea`**: Phỏng vấn và sinh `concept.md` bằng Tiếng Việt kết hợp thuật ngữ Tiếng Anh trong ngoặc đơn.
  - **`/only-one-plan`**: Tạo `plan.md` có Section 1 & 2 bằng Tiếng Việt mạch lạc giúp người dùng nắm bắt 100% bản chất thiết kế.
  - **`/only-one-apply`**: Sinh `walkthrough.md` bằng Tiếng Việt giải thích các thay đổi và kết quả test.
  - **`/only-one-debug`**: Báo cáo nguyên nhân gốc rễ (RCA) và giải pháp bằng Tiếng Việt.
  - **`/only-one-review`**: Báo cáo 5-Axis Review bằng bảng song ngữ trực quan.
  - **`/only-one-handoff`** & **`/only-one-conflict`**: Bàn giao session và giải quyết xung đột Git bằng Tiếng Việt.

### B. Kiến trúc 2 Lớp & Bảng Ma trận Tác vụ Máy Đọc (Machine-Readable Task Matrix)
- Bổ sung bảng chuẩn hóa **Section 3.1 Task Matrix** trong `/only-one-plan`:
  - Bao gồm: `Order`, `Action`, `File Path`, `Target Symbols / AST Seams`, `Depends On`, `Fast Test Command`.
- Nâng cấp `/only-one-apply` với cơ chế **Fast-Path Parsing**:
  - Agent parse bảng ma trận trong dưới 1 giây.
  - Chạy `Fast Test Command` đích danh cho từng file ngay sau khi sửa để rút ngắn chu kỳ phản hồi.

### C. Tích hợp Sổ tay Học tập Tiếng Anh Tự động (`only-one/learn/`)
- Cập nhật `/only-one-archive` để tự động bóc tách mẫu câu từ Section 6 và phân loại vào các chuyên đề `only-one/learn/*.md`.

### D. Đồng bộ hóa & Kiểm thử
- Đã đồng bộ toàn bộ file sang `.agents/workflows/`.
- Chạy `npm run build` thành công 100% với exit code 0.

---

## 2. Kết quả nghiệm thu

- **Build Check**: `PASS` (TypeScript compilation & Prettier formatting).
- **Format Check**: 100% workflows tuân thủ mô hình Dual-Layer.
