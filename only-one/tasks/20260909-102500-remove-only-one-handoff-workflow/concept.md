# Concept: Xoá Bỏ Hoàn Toàn Workflow `only-one-handoff` và Skill `handoff`

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Workflow `only-one-handoff` ban đầu được xây dựng để xuất file `handoff.md` tóm tắt tiến độ phiên làm việc phục vụ việc chuyển giao context khi context window bị đầy hoặc đổi model.
- **Hiện tượng & Khiếm khuyết kỹ thuật**: Các LLM hiện đại có context window lớn cùng cơ chế quản lý task tập trung qua `plan.md`, `concept.md` và `walkthrough.md`. Việc duy trì thêm một workflow `only-one-handoff` tạo ra sự dư thừa thông tin (redundancy), gia tăng chi phí bảo trì catalog/prebuilt assets và gây nhiễu danh sách workflow cho người dùng.
- **Nguyên nhân cốt lõi (Root Cause)**: Nhu cầu tạo file `handoff.md` thủ công không còn cần thiết trong quy trình làm việc chuẩn của `only-one-cli`.
- **Tác động (Impact / Blast Radius)**: Ảnh hưởng tới catalog asset workflows (`assets/workflows/`), skills (`assets/skills/`), combos (`assets/combos/`), và các bộ unit test liên quan (`test/core/skill-registry.test.ts`, `test/core/combo.test.ts`, `test/core/workflow-registry.test.ts`).

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Loại bỏ triệt để workflow `only-one-handoff` và skill phụ thuộc `handoff` khỏi toàn bộ codebase của `only-one-cli`.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Xoá file asset markdown `assets/workflows/only-one-handoff.md`.
  - Xoá định nghĩa workflow `only-one-handoff` khỏi `assets/workflows/index.ts`.
  - Xoá định nghĩa skill `handoff` khỏi `assets/skills/index.ts`.
  - Loại bỏ `handoff` và `only-one-handoff` khỏi toàn bộ combo definitions trong `assets/combos/index.ts` (`frontend-flow`, `backend-flow`, `full-sdlc-flow`).
  - Cập nhật danh sách expected skills trong `test/core/skill-registry.test.ts`.
  - Đảm bảo 100% test suite (`npm test`) và format check (`npm run format:check`) pass, build sạch không lỗi.

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Xoá file `assets/workflows/only-one-handoff.md`.
  - Dọn dẹp references trong `assets/workflows/index.ts`.
  - Dọn dẹp references trong `assets/skills/index.ts`.
  - Dọn dẹp references trong `assets/combos/index.ts`.
  - Cập nhật unit tests trong `test/core/skill-registry.test.ts`.
  - Tái tạo / kiểm tra tính toàn vẹn của prebuilt manifests/registries.
- **Explicit Out-of-Scope**:
  - Không thay đổi hành vi hoặc cấu trúc của các workflow chuẩn khác (`only-one-idea`, `only-one-plan`, `only-one-apply`, `only-one-debug`, `only-one-review`, `only-one-conflict`, `only-one-clean`, `only-one-pr-git`).
  - Không sửa đổi logic core của runtime hay TUI layout.

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

- **Core Mechanism**:
  - Thực hiện dọn dẹp theo mô hình **Clean Sweep (Purge Complete)**.
  - Tháo gỡ các liên kết phụ thuộc theo thứ tự:
    1. Asset file `only-one-handoff.md` (Workflow Markdown).
    2. Registry exports (`assets/workflows/index.ts` và `assets/skills/index.ts`).
    3. Bundled combo presets (`assets/combos/index.ts`).
    4. Unit test assertions (`test/core/skill-registry.test.ts`).
- **Workflow / Logic Flow**:
  - `Workflow Registry` $\rightarrow$ loại bỏ item `only-one-handoff`.
  - `Skill Registry` $\rightarrow$ loại bỏ item `handoff`.
  - `Combo Validator` $\rightarrow$ xác thực toàn vẹn không còn tham chiếu rác (dangling reference) tới `handoff` hoặc `only-one-handoff`.
  - `Vitest Suite` $\rightarrow$ chạy kiểm thử toàn bộ hệ thống để xác nhận tính toàn vẹn của catalog.

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

- **Dangling References trong Prebuilts / Combos**: Nếu quên xoá `handoff` trong combo `backend-flow` hoặc `full-sdlc-flow`, validator `validateComboManifestReferences` sẽ throw error làm fail test suite.
- **Test Assertion Mismatch**: `test/core/skill-registry.test.ts` kiểm tra danh sách `mattpocock/skills` chính xác theo mảng `expectedNames`. Cần đồng bộ xoá phần tử `'handoff'` trong mảng test.
