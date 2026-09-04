# Walkthrough: Loại Bỏ Hoàn Toàn Flow Học Tiếng Anh (English Learning Purge)

Đã hoàn tất việc loại bỏ toàn bộ các luồng học tiếng Anh, kỹ năng coaching/extraction, khai báo manifest, thư mục lưu trữ `only-one/learn/` và cập nhật kiểm thử tự động, đưa CLI về trạng thái thuần kỹ thuật, tinh gọn và đạt 100% tính nhất quán.

## Các Thay Đổi Đã Thực Hiện

### 1. Tẩy xóa Thư mục Vật lý (Physical Directory Deletions)
- `assets/skills/conversational-english-coaching` 🗑️ (Đã xóa)
- `assets/skills/english-learning-extraction` 🗑️ (Đã xóa)
- `.agents/skills/conversational-english-coaching` 🗑️ (Đã xóa)
- `.agents/skills/english-learning-extraction` 🗑️ (Đã xóa)
- `only-one/learn` 🗑️ (Đã xóa toàn bộ 5 file sổ tay tiếng Anh)

### 2. Dọn sạch Manifests & Combos (Manifests Cleansing)
- **[assets/skills/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/skills/index.ts)**: Loại bỏ khai báo và export của `conversational-english-coaching` và `english-learning-extraction` khỏi mảng `SKILLS`.
- **[assets/workflows/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/index.ts)**:
  - Gỡ bỏ 2 skills khỏi `requiredSkills` của `only-one-idea`, `only-one-plan`, `only-one-archive`.
  - Cập nhật description của `only-one-archive`.
  - Bump patch version cho 4 workflows: `only-one-idea: 0.0.3`, `only-one-plan: 0.0.3`, `only-one-archive: 0.0.2`, `only-one-clean: 0.0.2`.
- **[assets/combos/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/combos/index.ts)**:
  - Gỡ bỏ 2 skills khỏi `frontend-flow`, `backend-flow`, `full-sdlc-flow`.
  - Bump patch version của 3 combo lên `0.0.2`.

### 3. Làm sạch Workflow Markdown Templates & Rules (Templates & Rules Cleansing)
- **[assets/workflows/only-one-idea.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-idea.md)** & **[.agents/workflows/only-one-idea.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/.agents/workflows/only-one-idea.md)**:
  - Gỡ bỏ references trong role definition, bảng Skills Catalog và Step 2.5 `💬 English Expression Coaching`.
- **[assets/workflows/only-one-plan.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-plan.md)** & **[.agents/workflows/only-one-plan.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/.agents/workflows/only-one-plan.md)**:
  - Gỡ bỏ references trong role definition, bảng Skills Catalog, Review Gate activation step và guardrails.
- **[assets/workflows/only-one-archive.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-archive.md)** & **[.agents/workflows/only-one-archive.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/.agents/workflows/only-one-archive.md)**:
  - Gỡ bỏ hoàn toàn `Step 2b — Extract & Distill Technical English Learning`.
  - Gỡ bỏ dòng báo cáo `only-one/learn/` trong summary report và guardrails.
- **[assets/workflows/only-one-clean.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-clean.md)** & **[.agents/workflows/only-one-clean.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/.agents/workflows/only-one-clean.md)**:
  - Gỡ bỏ bước `Append English learning patterns to only-one/learn/<topic>.md` trong Step 0 auto-archive.
- **[only-one/rules.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/only-one/rules.md)**:
  - Xóa rule số 10 về tiêu chuẩn trích xuất vào `only-one/learn/`.
  - Làm sạch quy định trong rule số 21 (tránh làm loãng nội dung task).

### 4. Cập nhật Test Suite & Hàng rào Kiểm định (Tests & Verification)
- **[test/commands/workflow.test.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/test/commands/workflow.test.ts)**:
  - Chuyển assertion sang kiểm tra phủ định: `only-one-idea.md` và `only-one-plan.md` không còn chứa `conversational-english-coaching` hay `english-learning-extraction`.
- **[test/core/combo.test.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/test/core/combo.test.ts)**:
  - Bổ sung assertion đảm bảo `referencedIds` không chứa `conversational-english-coaching` và `english-learning-extraction`.

---

## Kết Quả Xác Minh (Verification Results)

### 1. Kiểm tra Tham chiếu Rác (Zero Dangling References)
```bash
git grep "conversational-english-coaching"
git grep "english-learning-extraction"
git grep "only-one/learn"
```
-> Kết quả: Hoàn toàn không còn bất kỳ tham chiếu nào trong mã nguồn active, assets template, combo hay workflows.

### 2. Automated Test Suite
- `npm test test/commands/workflow.test.ts`: **4/4 passed**
- `npm test test/core/combo.test.ts`: **12/12 passed**
- `npm test test/core/assets/version-gate.test.ts`: **2/2 passed**
- `npm test`: **224 passed, 4 skipped (55 test files passed, 0 failures)**

### 3. Linter & Build
- `npm run format:check`: **All matched files use Prettier code style!**
- `npm run build`: **TypeScript compilation & bundle successful (Exit code 0)**
