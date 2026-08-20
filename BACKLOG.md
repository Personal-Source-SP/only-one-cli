# Feature Backlog

Danh mục đầy đủ tính năng hiện có và hạng mục kế tiếp của `only-one`.

## Đã có — CLI foundation (v1.0.0)

- [x] **Project initialization** — `init` chạy luồng cài đặt workspace theo bước, hỗ trợ chọn agent target, bỏ qua bước, và xác nhận trước khi thực thi.
- [x] **Package installer** — `package` và `init package` cài package từ typed registry: `ui-ux-pro-max-cli`, `wondelai/skills/system-design`, `ux-flow-designer`.
- [x] **Combo setup** — `combo` và `init combo` cài bộ bundle cấu hình định sẵn: `frontend-flow`, `backend-flow`, `full-sdlc-flow`, `git-timesheet-flow`, `mcp-flow`.
- [x] **Agent target selection** — Hỗ trợ 4 agent targets chính: Antigravity, Claude, Cursor, Codex; tự động kiểm tra và reject target không hợp lệ trước khi áp dụng side effect.
- [x] **Machine-readable output** — Hỗ trợ `--json` cho command output.
- [x] **Environment diagnostics** — `doctor` kiểm tra trạng thái môi trường (Node.js, Git, CLI paths).
- [x] **Asset refresh** — `update` làm mới skill và workflow templates đã cài trong project.

## Đã có — Agent workspace & SDLC workflows

- [x] **Remote skill synchronization** — Tự động fetch và inspect remote skills từ GitHub (`addyosmani/agent-skills`, `mattpocock/skills`, `bdfinst/agentic-dev-team`) và lưu trữ lockfile tại `only-one/skills-lock.json`.
- [x] **Lockfile multi-path resolution** — Tự động phát hiện và migrate lockfile linh hoạt giữa thư mục gốc và thư mục `only-one/`.
- [x] **Curated SDLC skills (22 skills)**:
  - *Define*: `interview-me`, `idea-refine`, `spec-driven-development`, `grill-me`.
  - *Architecture & Design*: `c4-diagrams`, `api-and-interface-design`, `frontend-ui-engineering`, `source-driven-development`, `doubt-driven-development`, `gherkin-authoring`.
  - *Build & Implementation*: `context-engineering`, `incremental-implementation`, `test-driven-development`, `debugging-and-error-recovery`.
  - *Review & Quality*: `code-review-and-quality`, `code-simplification`, `security-and-hardening`, `performance-optimization`.
  - *Local Custom*: `only-one-nestjs-development`, `only-one-nextjs-development`, `only-one-clockify-skill`, `only-one-intranet-skill`, `only-one-pr-git-skill`.
- [x] **Task lifecycle management**:
  - `only-one-archive`: chưng cất task đã hoàn thành thành single-file archive markdown (`only-one/archives/YYYYMMDD-HHMMSS-<name>.md`) kèm YAML frontmatter, cập nhật rules và dọn dẹp task folders.
  - `only-one-clean`: tổng hợp archive liên quan, đối chiếu logic sâu với codebase thực tế, và dọn dẹp tài liệu cũ/stale.
- [x] **Standardized SDLC workflows (10 workflows)**:
  - `only-one-idea`: làm rõ và thẩm định ý tưởng ban đầu trước khi lập kế hoạch.
  - `only-one-plan`: nghiên cứu codebase và tạo kế hoạch 5 phần (User Review, Open Questions, Proposed Changes, Verification Plan, Automated Tests).
  - `only-one-apply`: triển khai từng file theo plan đã duyệt, TDD, tự động tạo walkthrough documentation.
  - `only-one-debug`: phân tích RCA 5 bước và sửa lỗi tối giản kèm kiểm chứng.
  - `only-one-review`: review toàn diện 5 trục (health, security, simplicity, performance, PR readiness).
  - `only-one-clockify`: xác thực task time entry GMT+7 và log vào Clockify qua MCP.
  - `only-one-intranet`: xác thực và log timesheet Intranet, xuất báo cáo tháng qua `zodinet-timesheet` MCP.
  - `only-one-pr-git`: tạo/cập nhật GitHub Pull Request với pre-review quality gates.
  - `only-one-archive` & `only-one-clean`: quản lý vòng đời task và lưu trữ tri thức.
- [x] **Full TUI command parity** — `only-one tui` giao diện terminal tương tác 1-1 với toàn bộ 13 subcommands thông qua Ink components (`ComboView`, `WorkflowView`, `RuleView`, `StructureView`, `UpdateView`, `DoctorView`, `McpView`, `SkillView`, `InitView`, `GitView`, `SettingsView`).
- [x] **Rule management** — Cài persistent agent rules: `next-architecture-stack`, `nest-architecture-stack`, `context-and-tools`.

## Đã có — MCP management

- [x] **MCP sync** — `mcp` và `init mcp` chọn MCP server và merge config vào Antigravity, Claude, Cursor, Codex.
- [x] **Multi-format config** — Đọc/ghi JSON (Antigravity, Claude, Cursor) và TOML (Codex).
- [x] **Pre-write validation** — Dừng trước khi ghi nếu file cấu hình hiện tại bị malformed/syntax error.
- [x] **MCP registry** — Cung cấp sẵn manifests: `clockify`, `fetch`, `github`, `memory`, `postgres`, `tavily`, `zodinet-timesheet`.

## Đã có — Editor synchronization

- [x] **VS settings sync** — `setting-vs` merge source settings vào Antigravity hoặc Cursor trên macOS/Windows; source thắng conflict, target-only keys giữ lại.
- [x] **Interactive settings selection** — Chọn setting keys và xác nhận overwrite trước khi ghi; hỗ trợ `--force`.
- [x] **VS extensions sync** — `extensions-vs` phát hiện và cài extension còn thiếu trên Antigravity hoặc Cursor CLI.
- [x] **Extension manifest** — Cung cấp `claude-code`, `gruvbox`, `vscode-icons` và extension IDs tùy biến.
- [x] **Transactional safety** — Journal `.only-one/vs-sync-journal.json`, rollback khi lỗi, recovery cho run bị gián đoạn.
- [x] **Progress reporting** — Báo tiến độ monotonic từ 0 đến 100 khi cài extensions.

## Đã có — Project tooling

- [x] **Structure generation** — `structure-generate` tạo structural blueprint markdown cho agent discovery.
- [x] **Ignore template sync** — Merge Git, Docker, npm ignore templates; rule đã tồn tại không bị ghi đè.
- [x] **Cross-platform paths** — Abstraction path/runtime an toàn cho macOS và Windows.

## P0 — Release reliability

- [ ] **Publish preflight** — Thêm lệnh hoặc CI kiểm tra version đồng bộ, changelog, `npm test`, và `npm run build` trước `npm publish`.
- [ ] **Dry-run thống nhất** — Cung cấp `--dry-run` cho mọi command có side effect; hiển thị thay đổi dự kiến nhưng không ghi file, cài package, hoặc gọi tool ngoài.

## P1 — Cross-platform and agent parity

- [ ] **VS sync trên Linux** — Hỗ trợ phát hiện paths settings và extension CLI của Antigravity/Cursor trên Linux, giữ transaction journal và rollback.
- [ ] **MCP config validation** — Bổ sung `only-one doctor` checks cho credentials, binary availability, malformed config trước khi sync.

## P2 — Ecosystem expansion

- [ ] **Ignore templates mở rộng** — Bổ sung template Python, Java, Go, Rust, Next.js; multi-select, preview.
- [ ] **Workflow catalog** — Liệt kê metadata, requirements, compatibility workflow tương tác trong TUI.
- [ ] **Asset update channels** — Đồng bộ có chọn lọc skills, workflows, rules theo version manifest, kèm changelog và rollback.
