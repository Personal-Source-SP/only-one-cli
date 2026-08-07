# Next.js Runtime Dev Loop & Debugging

## Quy trình Kiểm tra Runtime & Debug Frontend

### 1. Preconditions & Fast Loop Setup
- Xác nhận server `next dev` đang chạy và URL mục tiêu.
- Kiểm tra phiên bản Next.js, bundler (Turbopack), công cụ browser và xác thực người dùng.
- Giữ nguyên trạng thái đăng nhập của người dùng. Không bao giờ yêu cầu credentials trong chat.

### 2. Runtime Dev Loop Workflow
- Thực hiện sửa đổi nhỏ có phạm vi cụ thể (smallest scoped edit).
- Kiểm tra compile/runtime diagnostics qua công cụ Next.js / server log.
- Kiểm tra trực tiếp trên trình duyệt: nội dung hiển thị, loading / error / empty states, console errors, failed network requests và kết quả tương tác.
- Đối chiếu kết quả trình duyệt với server log, route diagnostics, RSC / server-action errors.
- Lặp lại sau mỗi thay đổi hành vi có ý nghĩa. Typecheck/build đơn thuần không thay thế được bằng chứng runtime.

### 3. Debug & Inspecting Values
- BẮT BUỘC lưu kết quả xử lý vào biến trung gian trước khi `return` (ví dụ: `const result = ...; return result;`) để hỗ trợ đặt breakpoint và inspect giá trị khi debug.

