# Feature Backlog

Danh mục đầy đủ tính năng hiện có và hạng mục kế tiếp của `only-one`.

## Đã có — CLI foundation

- [x] **Project initialization** — `init` chạy luồng cài đặt workspace theo bước, hỗ trợ chọn agent target, bỏ qua bước, và xác nhận trước khi thực thi.
- [x] **OpenSpec bootstrap** — Cài `@fission-ai/openspec` global khi cần, chạy OpenSpec initialization, và đồng bộ skill đã chọn.
- [x] **Package installer** — `init package` cài package registry; hiện có `@fission-ai/openspec` và `ui-ux-pro-max-cli`.
- [x] **Configuration sync** — `init configs` sao chép project config templates; hiện có OpenSpec config.
- [x] **Combo setup** — `combo` và `init combo` cài bundle định sẵn; hiện có `idsd-flow` gồm OpenSpec, config, và kỹ năng IDSD.
- [x] **Agent target selection** — Dùng selection flow chung, chỉ hỗ trợ Antigravity, Claude, Cursor, Codex; reject target không hợp lệ trước side effect.
- [x] **Machine-readable output** — Hỗ trợ `--json` cho command output.
- [x] **Environment diagnostics** — `doctor` kiểm tra trạng thái môi trường CLI.
- [x] **Asset refresh** — `update` làm mới skill/template agent đã cài trong project.

## Đã có — Agent workspace management

- [x] **Skill management** — `skill` và `init skill` phát hiện, chọn, và đồng bộ custom skills cho agent targets.
- [x] **Bundled skills** — Cung cấp `architectural-decision-records`, `c4-diagrams`, `gherkin-authoring`, `grill-me`, `only-one-clockify-skill`, `only-one-pr-git-skill`.
- [x] **Workflow management** — `workflow` cài và đồng bộ agent workflows cùng dependencies.
- [x] **Clockify workflow** — `only-one-clockify` xác thực task time entry và dùng Clockify MCP để ghi time.
- [x] **GitHub PR workflow** — `only-one-pr-git` tạo hoặc cập nhật GitHub PR bằng GitHub MCP.
- [x] **Plugin management** — `plugin` quản lý plugin theo target; hiện có Superpowers.
- [x] **Superpowers install** — Tự chạy `agy plugin install` trên Antigravity; hướng dẫn command/UI chính thức cho Claude, Cursor, Codex.
- [x] **Rule management** — `rule` cài persistent agent rules vào native path của từng target.
- [x] **Context minimization rule** — Cung cấp rule `context-minimization`, tự kiểm tra dependency OpenSpec, Superpowers, GitNexus trước khi cài.

## Đã có — MCP management

- [x] **MCP sync** — `mcp` và `init mcp` chọn MCP server và merge global config vào Antigravity, Claude, Cursor, Codex.
- [x] **Multi-format config** — Đọc/ghi JSON cho Antigravity, Claude, Cursor và TOML cho Codex.
- [x] **Pre-write validation** — Dừng trước khi ghi khi selected existing configuration malformed.
- [x] **MCP registry** — Cung cấp Clockify, Fetch, GitNexus, GitHub, Memory, Notion, Postgres, Tavily manifests.
- [x] **GitNexus safety** — Cấu hình GitNexus MCP read-only mặc định qua `GITNEXUS_MCP_READ_ONLY=1`.

## Đã có — Editor synchronization

- [x] **VS settings sync** — `setting-vs` merge source settings vào Antigravity hoặc Cursor trên macOS/Windows; source thắng conflict, target-only keys giữ lại.
- [x] **Interactive settings selection** — Chọn setting keys và xác nhận overwrite trước khi ghi; hỗ trợ `--force` khi cần.
- [x] **VS extensions sync** — `extensions-vs` phát hiện và chỉ cài extension thiếu trên Antigravity hoặc Cursor.
- [x] **Extension manifest** — Cung cấp `claude-code`, `gruvbox`, `vscode-icons` và extension IDs đã cấu hình.
- [x] **Transactional safety** — Journal `.only-one/vs-sync-journal.json`, rollback khi lỗi, và recovery cho run bị gián đoạn.
- [x] **Progress reporting** — Báo tiến độ monotonic từ 0 đến 100 khi cài extensions.

## Đã có — Project tooling

- [x] **Structure generation** — `structure-generate` tạo structural blueprint markdown cho agent discovery.
- [x] **Ignore template sync** — Chọn và thêm Git, Docker, npm ignore templates; rule đã tồn tại không bị ghi lại.
- [x] **Command orchestration** — Các pipeline init/MCP tách thành action steps và planning phase trước execution.
- [x] **Cross-platform paths** — Có abstraction path/runtime cho macOS và Windows ở editor sync.

## P0 — Release reliability

- [ ] **Publish preflight** — Thêm lệnh hoặc CI kiểm tra version đồng bộ, changelog, `npm test`, và `npm run build` trước `npm publish`.
- [ ] **Dry-run thống nhất** — Cung cấp `--dry-run` cho mọi command có side effect; hiển thị thay đổi dự kiến nhưng không ghi file, cài package, hoặc gọi tool ngoài.

## P1 — Cross-platform and agent parity

- [ ] **VS sync trên Linux** — Hỗ trợ phát hiện paths settings và extension CLI của Antigravity/Cursor trên Linux, giữ transaction journal và rollback.
- [ ] **Plugin install tự động** — Tự động cài Superpowers cho Claude, Cursor, Codex khi host có CLI/API hỗ trợ; fallback sang hướng dẫn chính thức khi không hỗ trợ.
- [ ] **MCP config validation** — Bổ sung `only-one doctor` checks cho credentials, binary availability, malformed config, và GitNexus index trước khi sync.

## P2 — Template ecosystem

- [ ] **Ignore templates mở rộng** — Bổ sung template Python, Java, Go, Rust, Next.js; multi-select, preview, và không ghi rule đã tồn tại.
- [ ] **Workflow catalog** — Liệt kê metadata, requirements, compatibility workflow trước khi cài; hỗ trợ chọn nhiều workflow trong một phiên.
- [ ] **Asset update channels** — Đồng bộ có chọn lọc skills, workflows, rules, plugins theo version manifest, kèm changelog và rollback.

> [!NOTE]
> Mỗi mục chưa làm cần proposal OpenSpec trước khi triển khai.
