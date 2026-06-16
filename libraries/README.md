# libraries

Thư mục lưu trữ external libraries, skills, templates, packages cho init command.

## Cấu trúc

```
libraries/
├── skills/       # Pre-copied agent skills (từng skill 1 subdir, chứa SKILL.md)
├── templates/    # Init templates
├── packages/     # Package manifests (.yaml) — npm package name + optional version
└── README.md     # File này
```

## Sử dụng

Init command đọc các manifest trong thư mục này để hiển thị danh sách cho user chọn:
1. **skills/**: Mỗi subdir là 1 skill. Copy vào tool's skillsDir khi user chọn.
2. **packages/**: Mỗi file `.yaml` là 1 package. Install via `npm install -g` khi user chọn.
3. **templates/**: Sử dụng cho scaffolding (WIP).
