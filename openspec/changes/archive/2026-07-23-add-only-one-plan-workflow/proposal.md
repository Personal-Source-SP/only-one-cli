## Why


## What Changes

- Thêm workflow `only-one-plan` và skill đi kèm cho các target agent được hỗ trợ.
- Chỉ cho phép workflow khảo sát và lập kế hoạch; không sửa application code, Git state, cấu hình, index hoặc hệ thống ngoài.
- Hỏi người dùng khi thiếu dữ kiện hoặc khi quyết định ảnh hưởng phạm vi, hành vi, kiến trúc, API, dependency, dữ liệu, hiệu suất, bảo mật hoặc khả năng đảo ngược; trình bày 2–4 lựa chọn kèm khuyến nghị khi có nhiều phương án hợp lệ.
- Ưu tiên phương án tái sử dụng logic hiện có và phạm vi sửa tối thiểu; plan phải nêu file dự kiến, phần giữ nguyên và lý do chọn phương án.
- Tạo hoặc tiếp tục OpenSpec change khi repo có OpenSpec; nếu không có, ghi plan tại `docs/plans/<slug>.md`.
- Bắt buộc plan có mục tiêu/phạm vi, bằng chứng codebase, quyết định đã xác nhận, bước thực hiện, kiểm thử, hiệu suất, bảo mật, rủi ro/fallback và các điểm không thay đổi.
- Bổ sung kiểm thử và tài liệu cho cài đặt đa target, hợp đồng chỉ-đọc, dependency và định dạng đầu ra.

## Capabilities

### New Capabilities
- `agent-plan-workflow`: Hành vi lập kế hoạch chỉ-đọc của `only-one-plan`, gồm khảo sát có bằng chứng, quyền quyết định của người dùng, giảm blast radius, OpenSpec/docs output, hiệu suất và bảo mật.

### Modified Capabilities

## Impact

- Asset mới trong `assets/workflows/` và `assets/skills/`.
- Registry workflow/skill và agent command template được mở rộng cho `only-one-plan`.
- Init/installer dùng metadata dependency thay vì coi `requiredMcps` là dữ liệu không được thực thi.
- Test core workflow, skill/command generation, init dependency và target path được mở rộng.
