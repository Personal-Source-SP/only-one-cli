---
task_slug: only-one-reflect-workflow
created_at: 2026-10-20T13:47:00+07:00
archived_at: 2026-10-20T16:08:35+07:00
status: applied
applied_at: 2026-10-26T14:50:55.761Z
target_skills:
  - only-one-apply
  - only-one-evolve
---

# Task Improvements: only-one-reflect-workflow

## 1. Observed Deficiencies
- **only-one-apply**: Khi sửa đổi các file markdown trên môi trường Windows, cần chú ý chuẩn hóa line-ending LF trước khi so khớp chuỗi thay thế.
- **only-one-evolve**: Script `lint-skill.ts` cần thông báo rõ số lượng từ thực tế và ngưỡng vi phạm để người dùng/test case dễ đối chiếu.

## 2. Context & Root Cause
- Trong quá trình triển khai task `only-one-reflect-workflow`, một số file `SKILL.md` cũ có line ending CRLF làm sai lệch khớp chuỗi khi dùng `replace_file_content`. Sau khi chuẩn hóa LF bằng script đơn định, thao tác sửa file diễn ra hoàn hảo.

## 3. Desired Skill Guardrail / Checklist
- Thêm bước tiền kiểm tra hoặc khuyến nghị chuẩn hóa line endings sang LF trước khi thực hiện replace file content.
