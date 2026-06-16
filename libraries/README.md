# libraries

Thư mục lưu trữ external libraries, skills, templates cho init command.

## Cấu trúc

```
libraries/
├── skills/       # Custom agent skills tải từ ngoài
├── templates/    # Init templates
└── README.md     # File này
```

## Mục đích

- Tách biệt code ngoại vi khỏi source code chính (`src/`)
- Cho phép init command load skills/templates từ đây
- Dễ dàng thêm/tháo external dependencies mà không ảnh hưởng core
