---
task_slug: enhance-tui-task-display-and-routing
created_at: 2026-10-21T02:52:00.000Z
archived_at: 2026-10-21T10:05:52+07:00
status: applied
applied_at: 2026-10-26T14:50:55.761Z
target_skills:
  - only-one-plan
---

# Task Improvements: enhance-tui-task-display-and-routing

## 1. Observed Deficiencies
- **only-one-plan**: Blueprint trong plan.md giả định `yaml.v3` unmarshal chuỗi thời gian YAML không nháy thành `string`, dẫn đến assertion `fm["created_at"].(string)` thất bại do Go decode thành `time.Time`. Đồng thời giả định `created_at` nằm trong `plan.md` thay vì fallback sang `concept.md`.

## 2. Context & Root Cause
- Khi chạy `TestScanTasksMetadata`, test mock `concept.md` có `created_at` nhưng `plan.md` không có `created_at`. `scanner.go` dừng vòng lặp ngay khi thấy `plan.md` và kiểu dữ liệu `created_at` nếu không có nháy kép sẽ là `time.Time` trong `gopkg.in/yaml.v3`.

## 3. Desired Skill Guardrail / Checklist
- Bổ sung quy tắc trong `only-one-plan` khi lập kế hoạch Go YAML parsing: luôn bao quát cả kiểu `time.Time` và `string` cho các trường ngày tháng, và kiểm tra cơ chế fallback metadata qua nhiều file tài liệu (`concept.md` -> `plan.md`).
