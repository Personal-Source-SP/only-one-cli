## Why

`only-one` chưa có agent workflow chuẩn hóa cho tạo Pull Request và log Clockify, đồng thời chưa thể cài MCP config đúng schema IDE. Thay đổi này cung cấp command, skill và MCP dependency đồng bộ để user cài một lần, dùng nhất quán trên Cursor và Antigravity mà không lưu secret trong repository.

## What Changes

- Thêm agent command `pr-git`, chuyển options `branch` và Conventional Commit `tag` vào skill `ak-pr-git`.
- Thêm skill `ak-pr-git` để phân tích Git, soạn PR body tiếng Anh theo template, hiển thị tóm tắt tiếng Việt, yêu cầu xác nhận và tạo/cập nhật PR qua GitHub MCP.
- Thêm agent command `clockify` với `date`, `project`, `tasks-per-day` và `validate`.
- Thêm skill `ak-clockify` để parse task, lập lịch ngày làm việc, preview/validate, xác nhận, thay entry trùng an toàn và ghi Clockify qua MCP.
- Tối ưu hai skill bằng `SKILL.md` ngắn gọn và references riêng cho template, format, validation và recovery rules.
- Thêm registry `libraries/mcps`, mỗi MCP là một JSON manifest với secret placeholder rỗng.
- Mở rộng `init` để user chọn MCP, sau đó merge MCP chưa tồn tại vào global config đúng IDE.
- Hỗ trợ MCP config cho Cursor và Antigravity trên macOS/Windows; MCP đã tồn tại được giữ nguyên và bỏ qua.
- Tái sử dụng transaction pattern của `setting-vs` cho backup, atomic write, rollback và recovery.
- Cập nhật tài liệu root và `libraries/README.md` về command, skill, MCP, secret thủ công và IDE support.

## Capabilities

### New Capabilities

- `agent-pr-workflow`: Command `pr-git`, skill `ak-pr-git`, GitHub MCP dependency, PR preview/confirmation và duplicate-PR handling.
- `agent-clockify-workflow`: Command `clockify`, skill `ak-clockify`, task parsing/scheduling/validation, safe replacement và Clockify MCP logging.
- `mcp-library-registry`: Per-MCP JSON manifests với metadata/config an toàn và secret placeholders.
- `mcp-global-sync`: Interactive MCP selection và transactional global config merge cho Cursor và Antigravity.
- `agent-workflow-dependencies`: Mapping readiness giữa command, skill, MCP và manual secret configuration trong init.

### Modified Capabilities

- `init-interactive-flow`: Thêm bước chọn MCP và dependency defaults vào init flow.
- `init-subcommands`: Thêm subcommand init MCP và hỗ trợ non-interactive MCP names.
- `libraries-registry`: Mở rộng registry để discover và validate MCP manifests.
- `skills-install`: Cài `ak-pr-git`, `ak-clockify` cùng references vào đúng skill directory của IDE.
- `vs-sync-transaction`: Tổng quát hóa transaction file sync để MCP global sync dùng chung backup, atomic write, rollback và recovery.

## Impact

- Affected code: init orchestration, library discovery, command generation, skill installation, IDE path adapters, JSON/JSONC merge và transaction sync.
- New library content: command sources, `ak-pr-git`, `ak-clockify`, reference documents, `github.json`, `clockify.json` và MCP manifests khác.
- External systems: GitHub MCP và Clockify MCP chạy bởi IDE/agent, không chạy trực tiếp trong Node CLI.
- Global files: Cursor và Antigravity MCP config trên macOS/Windows.
- Security: API tokens không được commit, prompt hoặc log; user điền thủ công placeholder trong global IDE config.
- Compatibility: IDE khác vẫn có thể nhận command/skill qua adapter hiện có nhưng MCP global sync phiên bản đầu chỉ hỗ trợ Cursor và Antigravity.
