# Walkthrough: Tối ưu hóa và Tinh gọn Hệ thống Workflows & Skills Catalog

Đã hoàn thành xuất sắc việc tối ưu hóa danh mục Skills, cập nhật các Workflows cốt lõi và bổ sung các Workflows thực chiến mới cho `only-one-cli`.

---

## 1. Những thay đổi đã thực hiện

### A. Tái cấu trúc danh mục Skills ([assets/skills/index.ts](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/index.ts))
- Phân tầng thành 5 giai đoạn vòng đời phần mềm rõ ràng:
  1. **Define Phase**: `grill-with-docs`, `grill-me`, `interview-me`, `idea-refine`, `domain-modeling`, `wait-what`.
  2. **Plan Phase**: `to-tickets`, `codebase-design`, `api-and-interface-design`, `doubt-driven-development`, `c4-diagrams`, `gherkin-authoring`.
  3. **Build Phase**: `incremental-implementation`, `test-driven-development`, `context-engineering`, `prototype`, `wizard`.
  4. **Verify & Debug Phase**: `diagnosing-bugs`, `resolving-merge-conflicts`, `handoff`.
  5. **Review & Ship Phase**: `code-review-and-quality`, `code-simplification`, `security-and-hardening`, `performance-optimization`, `only-one-pr-git-skill`.
- Thêm mới 4 skills giá trị: `resolving-merge-conflicts`, `handoff`, `prototype`, `wizard`.
- Loại bỏ `spec-driven-development` để đồng nhất với cặp `concept.md` + `plan.md`.

### B. Nâng cấp các Workflows hiện hữu
- **`/only-one-idea`**: Tích hợp `grill-with-docs` để duy trì `CONTEXT.md` và ghi nhận ADRs.
- **`/only-one-plan`**: Tích hợp `to-tickets` (task graph có `depends_on`), `codebase-design` và `doubt-driven-development`.
- **`/only-one-apply`**: Kiểm tra rào chắn `depends_on`, tuân thủ lát cắt mỏng và Beyoncé Rule.
- **`/only-one-debug`**: Tích hợp quy tắc **Red Feedback Loop** từ `diagnosing-bugs`.
- **`/only-one-review`**: Tách ngữ cảnh theo mô hình Dual-Perspective (Spec Auditor vs Quality/Security Auditor).

### C. Thêm mới 2 Workflows thực chiến
- **`/only-one-handoff` ([assets/workflows/only-one-handoff.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/only-one-handoff.md))**: Nén phiên làm việc để chuyển giao liền mạch giữa các session.
- **`/only-one-conflict` ([assets/workflows/only-one-conflict.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/only-one-conflict.md))**: Xử lý git merge conflict theo ý định gốc thay vì abort.

### D. Đồng bộ hóa
- Cập nhật [assets/workflows/index.ts](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/index.ts).
- Đồng bộ toàn bộ các file workflow `.md` sang thư mục runtime `.agents/workflows/`.

---

## 2. Kết quả kiểm thử & Xác minh

- **TypeScript Compilation & Prettier**: Chạy `npm run build` thành công 100% với exit code 0.
- **Độ hoàn thiện**: Tất cả các workflows và skills đều có cấu trúc nhất quán, không xung đột hay trùng lặp.
