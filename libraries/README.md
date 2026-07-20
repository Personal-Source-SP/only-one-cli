# libraries

Thư mục lưu trữ external libraries, skills, templates, packages cho init command và các command đồng bộ editor.

## Cấu trúc

```
libraries/
├── skills/       # Pre-copied agent skills (từng skill 1 subdir, chứa SKILL.md)
├── templates/    # Init templates
├── packages/     # Package manifests (.yaml) — npm package name + optional version
├── configs/      # Configuration templates
├── vs/           # VS Code/Cursor/Antigravity settings + extension manifest
└── README.md     # File này
```

## Sử dụng

Init command đọc các manifest trong thư mục này để hiển thị danh sách cho user chọn:
1. **skills/**: Mỗi subdir là 1 skill. Copy vào tool's skillsDir khi user chọn. Các skill workflows mới gồm `ak-pr-git` và `ak-clockify`.
2. **packages/**: Mỗi file `.yaml` là 1 package. Install khi user chọn.
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
