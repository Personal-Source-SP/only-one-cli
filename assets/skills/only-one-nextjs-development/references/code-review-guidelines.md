# Code Review & Business Acceptance Guidelines

Tài liệu hướng dẫn quy trình và tiêu chí Review Code dưới góc nhìn Product / BA (Business Analyst) dành cho Agent và Developers, đảm bảo các thay đổi không chỉ đạt chuẩn kỹ thuật mà còn đúng nghiệp vụ vận hành thực tế.

---

## 1. Bối cảnh & Nguyên tắc Review

- **Tư duy Product Engineer / BA**: Sản phẩm là product vận hành thật, không phải bài tập làm theo checklist kỹ thuật đơn thuần. Code triển khai phải đúng luồng nghiệp vụ, không làm sai lệch hành vi sản phẩm, và không tạo rủi ro cho người dùng cuối.
- **Phạm vi đối chiếu**: Reviewer phải đối chiếu thay đổi với yêu cầu nghiệp vụ (Specs, Acceptance Criteria, Tickets), luồng người dùng (User Flow), hợp đồng dữ liệu (API Contracts) và các trường hợp biên (Edge Cases).

---

## 2. 7 Nhóm Nội dung Kiểm tra Bắt buộc (Review Checklist)

### 1. Đối chiếu Yêu cầu Nghiệp vụ (Business Requirements)
- Kiểm tra code đã bao phủ đủ các điều kiện nghiệp vụ bắt buộc hay chưa.
- Kiểm tra các rule nghiệp vụ có được áp dụng đúng nơi, đúng thời điểm hay không.
- Phát hiện các điểm triển khai đúng về cú pháp/kỹ thuật nhưng sai ý nghĩa nghiệp vụ.

### 2. Kiểm tra Luồng Người dùng (User Flow & States)
- Kiểm tra toàn bộ luồng từ khi bắt đầu thao tác đến khi hoàn tất.
- Kiểm tra đầy đủ các trạng thái UI: `Tạo mới`, `Chỉnh sửa`, `Xem chi tiết`, `Lọc/Tìm kiếm`, `Lưu`, `Hủy`, `Lỗi (Error)`, `Tải dữ liệu (Loading)`, `Dữ liệu rỗng (Empty)`.
- Kiểm tra các luồng phụ, thao tác hủy dở chừng hoặc nhánh rẽ trong vận hành.

### 3. Kiểm tra Dữ liệu & Mapping (Data & API Payload)
- Kiểm tra dữ liệu hiển thị trên UI có đúng với API response contract hay không.
- Kiểm tra payload gửi lên API: đủ trường, đúng tên trường, đúng kiểu dữ liệu (`number`, `string`, `boolean`, `array`), đúng định dạng (VD: timestamp/ISO string).
- Kiểm tra khi Edit: dữ liệu cũ phải được map ngược lại form đầy đủ (dùng `initialValuesMapper`), tránh bị rỗng hoặc reset ghi đè dữ liệu cũ.
- Kiểm tra xử lý dữ liệu rỗng, `null`, `undefined` hoặc dữ liệu cũ thiếu trường mới.

### 4. Kiểm tra Validation & Rule Ngoại lệ
- Kiểm tra trường bắt buộc, định dạng dữ liệu, giới hạn số lượng/ký tự, và quan hệ phụ thuộc giữa các fields.
- Thông báo lỗi validation phải rõ ràng, đúng ngôn ngữ, đúng ngữ cảnh.
- Xử lý tốt trường hợp biên: dữ liệu thiếu, trùng lặp, thời gian không hợp lệ, trạng thái bị khóa thao tác.
- Đảm bảo validation ở UI đồng bộ với validation ở Backend.

### 5. Kiểm tra Tác động Nghiệp vụ Hiện có (Side Effects & Regression)
- Xác định các module, màn hình, API hoặc phân quyền có thể bị ảnh hưởng liên đới.
- Kiểm tra thay đổi có làm hỏng hoặc thay đổi hành vi tính năng cũ không được yêu cầu.
- Kiểm tra phân quyền (Permissions), vai trò người dùng (Roles) và điều kiện truy cập.

### 6. Kiểm tra i18n & Ngôn ngữ Sản phẩm
- 100% văn bản hiển thị trên UI phải bọc qua i18n hook (`t(...)`), tuyệt đối không hardcode text tiếng Việt/tiếng Anh trực tiếp trong TSX.
- Kiểm tra nội dung tiếng Việt và tiếng Anh rõ nghĩa, đúng thuật ngữ sản phẩm.
- Kiểm tra đầy đủ label, placeholder, validation message, button text, table column title.

### 7. Kiểm tra Trải nghiệm Vận hành & UI/UX (UX & Edge Cases)
- Đối chiếu với [ui-ux-guidelines.md](ui-ux-guidelines.md) và checklist của skill [ui-ux-pro-max](../ui-ux-pro-max/SKILL.md) về độ tương phản màu, trạng thái Empty/Error, responsive và accessibility.
- Thao tác chính dễ tìm, ít bước thừa, tuân thủ Priority Cascade (`@/components` > `antd` > `TailwindCSS`).
- Layout hợp lý, responsive tốt trên Mobile, Tablet, Desktop.
- Đảm bảo người dùng không bị mất dữ liệu dở chừng (ví dụ: lỡ đóng Drawer/Modal).

---

## 3. Cách Đặt Câu Hỏi Review (BA Questions)

Khi review PR/Code, Agent/Reviewer cần tự đặt các câu hỏi phản biện:
1. *Trường hợp này có xuất hiện trong vận hành thực tế không?*
2. *Nếu dữ liệu cũ không có field mới thì hệ thống hiển thị thế nào?*
3. *Người dùng có hiểu đúng ý nghĩa của field/thông báo này không?*
4. *Rule này áp dụng cho tất cả vai trò hay chỉ một nhóm người dùng?*
5. *Khi API trả lỗi, người dùng có biết họ cần điều chỉnh gì không?*
6. *Nếu người dùng thao tác sai thứ tự hoặc bấm lưu liên tục thì sao?*

---

## 4. Quy chuẩn Ghi nhận Feedback & Mức độ Lỗi

Mỗi ý kiến review (Feedback) BẮT BUỘC có cấu trúc:
- **Vấn đề**: Mô tả ngắn gọn điểm sai hoặc thiếu.
- **Kỳ vọng nghiệp vụ**: Hệ thống đúng ra phải xử lý thế nào.
- **Bằng chứng**: Line code, file, màn hình, bước tái hiện hoặc payload.
- **Mức độ**: `Blocker` | `Major` | `Minor` | `Suggestion`.
- **Đề xuất**: Hướng xử lý hoặc câu hỏi cần BA/PO xác nhận.

### Phân loại Mức độ Lỗi:
- 🚫 **Blocker**: Lỗi làm nghẽn luồng nghiệp vụ chính, sai dữ liệu nghiêm trọng, mất dữ liệu, sai phân quyền bảo mật.
- ⚠️ **Major**: Lỗi ảnh hưởng luồng vận hành, gây nhầm lẫn dữ liệu, thiếu validation quan trọng.
- 💬 **Minor**: Lỗi nhỏ về hiển thị, wording i18n, chưa đồng nhất giao diện.
- 💡 **Suggestion**: Đề xuất cải thiện UX, code cleanliness, hoặc độ rõ ràng.

---

## 5. Kết quả Nghiệm thu (Review Verdicts)

- **Approve**: Đạt chuẩn nghiệp vụ và kỹ thuật, sẵn sàng merge.
- **Approve with comments**: Chấp nhận nghiệm thu nhưng cần sửa các góp ý Minor/Suggestion.
- **Request changes**: Cần sửa lại vì còn lỗi Blocker/Major.
- **Need BA/PO confirmation**: Có điểm nghiệp vụ chưa rõ trong requirement, cần xác nhận trước khi quyết định.
