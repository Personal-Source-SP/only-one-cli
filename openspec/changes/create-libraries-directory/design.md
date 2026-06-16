## Context

Hiện tại project không có thư mục chuẩn để lưu trữ external libraries, skills, templates mà init command cần tải về. External code bị lẫn trong `src/` hoặc `node_modules/`, gây khó maintain.

ADR-0001 xác định init command là orchestrator gọi openspec CLI + sync custom skills. Tuy nhiên skills/templates vẫn lưu trong `src/`.

## Goals / Non-Goals

**Goals:**
- Tạo `libraries/` directory tại project root, ngang cấp `src/`
- Config TypeScript path alias để import từ `@library/...`
- Init command có thể load external assets từ `libraries/`
- Cấu trúc thư mục rõ ràng, dễ mở rộng

**Non-Goals:**
- Không move code từ `src/` sang `libraries/` (trừ khi có external assets sẵn)
- Không thay đổi behavior của init command
- Không thêm dependency mới

## Decisions

1. **Tên `libraries`**: Dùng số nhiều đúng chính tả.
2. **Cấu trúc `libraries/`**:
   ```
   libraries/
   ├── skills/           # Custom agent skills
   ├── templates/        # Init templates
   └── README.md         # Mô tả thư mục
   ```
3. **TypeScript path alias**: Thêm `@library/*` → `libraries/*` trong `tsconfig.json` compilerOptions.paths.
4. **Dist build**: `package.json` / `tsconfig.json` cần include `libraries/` trong build output nếu có file cần ship.

## Risks / Trade-offs

- [Risk] Thêm path alias có thể conflict với alias khác. Mitigation: Đặt tên cụ thể `@library/...`.

## Migration Plan

1. Tạo `libraries/` directory và cấu trúc con
2. Update `tsconfig.json` paths
3. Update `package.json` build config (nếu cần)
4. Update init command để load từ `libraries/` nếu có

## Open Questions

- Có external assets nào cần move ngay từ `src/` sang `libraries/` không?
- Cần thêm `.gitkeep` trong các thư mục con không?
