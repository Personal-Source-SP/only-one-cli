## 1. Create libraries directory structure

- [x] 1.1 Tạo `libraries/`, `libraries/skills/`, `libraries/templates/` với `.gitkeep`
- [x] 1.2 Thêm `README.md` vào `libraries/` giải thích mục đích thư mục

## 2. Configure TypeScript path alias

- [x] 2.1 Thêm `@library/*` → `libraries/*` vào `tsconfig.json` compilerOptions.paths
- [x] 2.2 Verify IDE resolve được `@library/...` imports

## 3. Update init command

- [x] 3.1 Update init command để load skills từ `libraries/skills/` nếu có, fallback về `.agents/skills/`

## 4. Move openspec bootstrap into libraries

- [x] 4.1 Move `openspec-bootstrap.ts` → `libraries/openspec-bootstrap/index.ts`, fix internal imports
- [x] 4.2 Move `custom-skills-sync.ts` → `libraries/custom-skills-sync/index.ts`, fix internal imports
- [x] 4.3 Delete old files from `src/core/init/`
- [x] 4.4 Update `init-command.ts` imports to use `@library/...`
- [x] 4.5 TypeScript compile check
- [x] 4.6 Chạy `openspec validate create-libraries-directory --type change --strict`
