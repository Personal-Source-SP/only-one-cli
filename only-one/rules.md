# Repository Negative Rules & Constraints

> File này được AI tự động đọc ở bước 1b của mọi workflow (`/only-one-plan`, `/only-one-apply`, `/only-one-idea`, `/only-one-debug`).

- **[NEVER]** Không di chuyển nguyên thư mục task thô vào `archives/`. Luôn chắt lọc thành 1 file Markdown duy nhất và xóa thư mục task thô để tránh biến `archives/` thành bãi rác tài liệu.
- **[NEVER]** Không chỉ kiểm tra sự tồn tại của file trong `/only-one-clean`. Bắt buộc phải đối soát chi tiết logic, hàm, contract, schema với codebase thực tế và xóa bỏ dứt điểm các tài liệu đã cũ/không còn đúng.
- **[ALWAYS]** Khai báo bảng `## 1. Skills Catalog` đầy đủ mô tả và trigger condition trong tất cả các file workflow `.md`.
- **[ALWAYS]** Lưu trữ toàn bộ bài học và điều cấm kỵ chắt lọc vào 1 file duy nhất `only-one/rules.md` tại root của `only-one/`.
- **[ALWAYS]** Viết toàn bộ tài liệu kỹ thuật (`concept.md`, `plan.md`, `walkthrough.md`) bằng tiếng Anh chuẩn kỹ thuật.
- **[NEVER]** Không đưa từ vựng thông dụng tầm thường hoặc thiếu giải nghĩa tiếng Việt và ví dụ kỹ thuật thực tế vào `only-one/learn/`. Chỉ chắt lọc các mẫu câu, cấu trúc ngữ pháp và thuật ngữ kỹ thuật có giá trị tái sử dụng cao.
- **[NEVER]** Không đặt `useInput` toàn cục bắt phím `Enter` ở wrapper cha khi component con cũng có `useInput` mà không qua router/focus lock, để tránh lỗi race condition gây thoát view trước khi action kịp thực thi.
