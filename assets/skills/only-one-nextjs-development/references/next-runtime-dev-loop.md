# Next.js Runtime Dev Loop & Debugging

## Quy trình Kiểm tra Runtime & Debug Frontend

### 1. Kiểm tra Runtime trong Browser
- Thực hiện sửa đổi nhỏ (scoped edit).
- Kiểm tra render trên trình duyệt thật: nội dung hiển thị, loading/error states, console errors, failed network requests.
- Kiểm tra liên kết giữa Browser output với Server logs / API response.

### 2. Debug & Inspecting Values
- BẮT BUỘC lưu kết quả xử lý vào biến trung gian trước khi `return` (ví dụ: `const result = ...; return result;`) để hỗ trợ đặt breakpoint và inspect giá trị khi debug.
