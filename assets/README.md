# libraries

Thư mục lưu trữ external libraries, skills, templates, packages cho init command và các command đồng bộ editor.

## Cấu trúc

```
libraries/
├── skills/       # Pre-copied agent skills (từng skill 1 subdir, chứa SKILL.md)
├── templates/    # Init templates
├── packages/     # Package manifests (.ts) — npm package name + global scope
├── plugins/      # Target-specific plugin manifests (.ts) — superpowers, etc.
├── rules/        # Persistent agent rule manifests (.ts) and markdown instructions (.md)
├── configs/      # Configuration templates
├── vs/           # VS Code/Cursor/Antigravity settings + extension manifest
└── README.md     # File này
```

## Sử dụng

Init command và CLI subcommands (`skill`, `plugin`, `rule`, `mcp`, `combo`) đọc các manifest trong thư mục này:
1. **skills/**: Mỗi subdir là 1 skill. Copy vào tool's skillsDir khi user chọn.
2. **packages/**: Manifest package npm.
3. **plugins/**: Manifest plugin theo target (vd: `superpowers`). Hỗ trợ command `agy plugin install` cho Antigravity và hướng dẫn manual cho Claude/Cursor/Codex.
4. **rules/**: Persistent agent rules (vd: `context-minimization.md`). Copy vào path native của target (`.agents/rules`, `.claude/rules`, `.cursor/rules`). Tự động trigger dependency packages/plugins/MCPs trước khi ghi rule file.
3. **templates/**: Sử dụng cho scaffolding (WIP).
4. **configs/**: Các template cấu hình cho project.
5. **mcps/**: Các file manifest cấu hình MCP servers (ví dụ: `github.json`, `clockify.json`). Được dùng bởi `init mcp` hoặc bước đồng bộ MCP của `init` để merge cấu hình global vào Cursor/Antigravity.
6. **vs/**: `setting-vs` merge `settings.json`; `extensions-vs` cài extension ID còn thiếu qua CLI editor.

## VS sync

- `vs/settings.json`: source settings dùng cho `setting-vs`.
- `vs/extensions.json`: danh sách extension ID dùng cho `extensions-vs`.
- Khi merge settings, source trong `libraries/vs` thắng nếu trùng key; key chỉ có ở máy đích được giữ lại.
- Extensions hiện có được giữ; command chỉ cài extension ID còn thiếu.
- Commands hỗ trợ VS Code, Cursor, Antigravity trên macOS và Windows.
- Commands dùng journal trong `.only-one/vs-sync-journal.json` để rollback khi lỗi hoặc phục hồi lần chạy bị gián đoạn.
