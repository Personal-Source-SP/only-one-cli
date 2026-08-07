# Utils & Helpers Reference

## Quy chuẩn viết Hàm Tiện ích (Pure Helpers)

- ✅ **Ưu tiên Common Utilities (`@/utilities`)**:
  - BẮT BUỘC ưu tiên khảo sát và tái sử dụng các hàm utility sẵn có tại `@/utilities` (như `currencyNumber`, `toEnumOptions`, `FormRuleType`, formatters, parsers,...) trước khi viết mới.
  - CHỈ viết helper function cục bộ trong thư mục `src/pages/<feature>/utils/` khi logic đó thực sự mang tính chất đặc thù riêng cho trang đó (ví dụ: `convertMinutesToSeconds`, `parseBoolean`).
- ✅ **Pure Functions**:
  - Các helper function phải là pure functions: có đầu vào/đầu ra rõ ràng, không có side-effects.
- ✅ **Sử dụng Lodash & Dayjs**:
  - Ưu tiên sử dụng `lodash` (`isEmpty`, `get`, `set`, `uniq`, `groupBy`,...) thay vì tự viết lại logic lặp code.
  - Xử lý ngày giờ bằng `dayjs`. Khi thao tác với múi giờ (timezone), bắt buộc kiểm tra việc nạp `dayjs.extend(utc)` và `dayjs.extend(timezone)` để tính toán chính xác.
- ✅ **Return bằng biến cụ thể (Debug-friendly Return)**:
  - BẮT BUỘC lưu kết quả tính toán/chuyển đổi vào biến rõ nghĩa trước khi `return`.
