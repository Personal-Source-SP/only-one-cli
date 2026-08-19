# Walkthrough — Tái cấu trúc Luồng Skills Remote-First, Phụ thuộc 1 Chiều (`Workflows -> Skills`) & Bổ sung Skill Update Inspector

## 1. Tóm tắt Thay đổi

Đã hoàn thành toàn bộ các hạng mục nâng cấp theo kế hoạch:

### 1.1. Kiến trúc Remote-First Skills & Quản lý bằng Lockfile
- [assets/types.ts](file:///Users/kiem/Sources/Personal/only-one-cli/assets/types.ts):
  - Mở rộng `SkillManifest` hỗ trợ `source` (ví dụ `addyosmani/agent-skills`), `sourceType: 'github' | 'local'`, và `skillPath`.
  - Loại bỏ hoàn toàn trường phụ thuộc ngược `associatedWorkflows`.
  - Mở rộng `WorkflowManifest` thêm `requiredSkills?: string[]`.
- [assets/skills/index.ts](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/index.ts):
  - Khai báo danh mục Skills theo chuẩn Remote-First (không lưu static `SKILL.md` cồng kềnh trong repo CLI đối với các skills bên thứ 3).
- [src/core/skill/remote/github-fetcher.ts](file:///Users/kiem/Sources/Personal/only-one-cli/src/core/skill/remote/github-fetcher.ts):
  - Module fetch nội dung file `SKILL.md` động từ GitHub qua REST API / Raw Content và tính mã SHA-256 hash.
- [src/core/skill/remote/lockfile.ts](file:///Users/kiem/Sources/Personal/only-one-cli/src/core/skill/remote/lockfile.ts):
  - Module đọc, ghi và quản lý `skills-lock.json` để kiểm soát phiên bản và tính toàn vẹn của skills.
- [src/core/skill/index.ts](file:///Users/kiem/Sources/Personal/only-one-cli/src/core/skill/index.ts):
  - Nâng cấp hàm `installSkills` tự động fetch từ remote GitHub nếu là remote skill và ghi nhận vào `skills-lock.json`.

---

### 1.2. Thành phần Kiểm định Cập nhật (Skill Update Inspector)
- [src/core/skill/remote/inspector.ts](file:///Users/kiem/Sources/Personal/only-one-cli/src/core/skill/remote/inspector.ts):
  - Cung cấp API `checkSkillFreshness` và `checkAllSkillsFreshness` đối chiếu SHA-256 giữa `skills-lock.json` cục bộ và GitHub upstream để phân loại `up-to-date` vs `update-available`.
- [src/commands/skill/command.ts](file:///Users/kiem/Sources/Personal/only-one-cli/src/commands/skill/command.ts):
  - Bổ sung lệnh `only-one skill outdated` để hiển thị báo cáo độ mới của skills.
  - Bổ sung lệnh `only-one skill update [name]` để cập nhật 1 hoặc tất cả skills lên bản mới nhất từ upstream.
- [src/core/doctor/checks.ts](file:///Users/kiem/Sources/Personal/only-one-cli/src/core/doctor/checks.ts):
  - Tích hợp kiểm tra độ mới của Skills (`checkSkillsFreshness`) vào báo cáo `only-one doctor`.

---

### 1.3. Chuẩn hóa Phụ thuộc 1 Chiều (`Workflows -> Skills`)
- [assets/workflows/index.ts](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/index.ts):
  - Khai báo 8 workflows kèm danh sách `requiredSkills` và `requiredMcps` cụ thể.
- [src/core/agent/service-planners.ts](file:///Users/kiem/Sources/Personal/only-one-cli/src/core/agent/service-planners.ts):
  - Nâng cấp `planWorkflows` tự động mở rộng và giải phóng dependency `requiredSkills` và `requiredMcps`.
- [src/commands/skill/actions/step-5-execute-and-report.ts](file:///Users/kiem/Sources/Personal/only-one-cli/src/commands/skill/actions/step-5-execute-and-report.ts):
  - Xóa bỏ hoàn toàn prompt hỏi cài ngược workflow khi cài đặt skill.
- [src/commands/workflow/actions/step-5-execute-and-report.ts](file:///Users/kiem/Sources/Personal/only-one-cli/src/commands/workflow/actions/step-5-execute-and-report.ts):
  - Hiển thị Dependency Notice thông báo các skills/MCPs khuyến nghị đi kèm workflow.

---

### 1.4. Bộ Workflows SDLC Hoàn chỉnh & Đồng bộ Combo
- [assets/workflows/only-one-idea.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/only-one-idea.md) (`/only-one-idea`): Workflow tiền trạm khám phá ý tưởng (phỏng vấn 1 câu/lần đến khi đạt ~95% confidence).
- [assets/workflows/only-one-debug.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/only-one-debug.md) (`/only-one-debug`): Workflow xử lý sự cố chuẩn 5 bước Root Cause Analysis (RCA).
- [assets/workflows/only-one-review.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/only-one-review.md) (`/only-one-review`): Workflow rà soát mã nguồn 5 trục (Security, Simplicity, WebPerf, Logic, Tests).
- [assets/workflows/only-one-ag-plan.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/only-one-ag-plan.md): Bổ sung trigger các skills mới (`doubt-driven-development`, `source-driven-development`, `api-design`, `security-audit`, `webperf`, `idea-refine`).
- [assets/workflows/only-one-apply.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/only-one-apply.md): Bổ sung 2 Quality Gates (`code-simplify` và `security/devtools verification`).
- [assets/combos/index.ts](file:///Users/kiem/Sources/Personal/only-one-cli/assets/combos/index.ts): Cập nhật `frontend-flow`, `backend-flow`, và bổ sung `full-sdlc-flow`.
- Đồng bộ toàn bộ workflows mới vào `.agents/workflows/`.

---

## 2. Kết quả Xác thực (Verification Results)

Toàn bộ test suite và build pipeline đã PASS 100%:
- `npm run format:check`: Đạt chuẩn Prettier.
- `npm run build`: TypeScript compile thành công, không có lỗi types hay broken imports.
- `npm test`: **45 test files passed, 179 unit/integration tests passed** (0 failed).
