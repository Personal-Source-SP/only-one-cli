## Why

Init command cần tải về và lưu trữ các thư viện, skills, templates từ bên ngoài. Hiện tại không có nơi chuẩn để đặt chúng — phải nhúng trong `src/` hoặc dùng `node_modules`. Tạo thư mục `libraries/` ngang cấp `src/` để isolate code ngoại vi, tách biệt khỏi source code chính.

## What Changes

- Tạo thư mục `libraries/` tại project root (ngang cấp `src/`, `test/`)
- Update `tsconfig.json` để TypeScript biết đường dẫn tới `libraries/`
- Move/tổ chức các external skills, templates về `libraries/`
- Init command load skills từ `libraries/` thay vì `src/`

## Capabilities

### New Capabilities
- `libraries-directory`: Thư mục chuẩn ở root cho external libraries/skills, có cấu trúc rõ ràng và TypeScript path alias

### Modified Capabilities

*(None — đây là structural change, không thay đổi behavior của tính năng có sẵn)*

## Impact

- **Project structure**: thêm `libraries/` directory
- **`tsconfig.json`**: thêm paths alias để import từ `@library/...`
- **Init command (`src/commands/init/`)**: cần load skills từ `libraries/` thay vì `src/` (nếu có)
- **`package.json`**: có thể cần update nếu publish dist
