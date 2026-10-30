---
status: done
slug: compact-apply-walkthrough-report
created_at: 2026-10-30T03:19:30.000Z
started_at: 2026-10-30
completed_at: 2026-10-30T10:24:35.000Z
pr_url: ~
branch: ~
---

# Plan: Cải tiến báo cáo nghiệm thu only-one-apply

## Section 1. Directory Structure Changes

```text
assets/agents/skills/only-one-apply/
└── [MODIFY] SKILL.md                          # Chuẩn hóa Walkthrough Schema và Friction Check Gate
test/skills/
└── [MODIFY] applyReportTemplate.test.ts       # Cập nhật bộ test invariants cho mẫu báo cáo mới
C:/Users/ADMIN/.gemini/config/skills/only-one-apply/
└── [MODIFY] SKILL.md                          # Đồng bộ cấu hình toàn cục Antigravity
```

## Section 1.5. Story Board (User Journey & Feature Scenarios)

### Story 1: Tối ưu báo cáo nghiệm thu và kích hoạt cổng cải tiến [MODIFY]
- **User Story**: Với vai trò là PM/Developer sử dụng `only-one-apply`, tôi muốn nhận được báo cáo nghiệm thu siêu gọn gàng kèm câu hỏi tiếp nhận cải tiến, để nắm bắt nhanh trạng thái mà không bị ngập trong log rườm rà.
- **Before**: Báo cáo chiếm diện tích lớn với cây thư mục ASCII chi tiết, lặp lại danh sách task vụn vặt từ plan, in mục bước tiếp theo không cần thiết, và bỏ qua cổng hỏi tiếp nhận ma sát cho `/only-one-evolve`.
- **After**: Báo cáo chỉ gồm 2 dòng tổng quan; danh sách file và log test được thu gọn bên trong thẻ `<details>`; loại bỏ mục bước tiếp theo; hiển thị câu hỏi tương tác ngắn gọn để tiếp nhận dữ liệu cho `/only-one-evolve`.
- **Key Scenarios**:
  - *Scenario 1 (Happy Path - Hoàn tất sạch sẽ)*: Agent in báo cáo Collapsible Hybrid 3-4 dòng, người dùng xác nhận không có ma sát, hoàn tất task với 0 tệp rác.
  - *Scenario 2 (Ma sát phát sinh)*: Người dùng phản hồi điểm khó khăn, agent tự động kích hoạt `record-improvement.ts` tạo `improvements.md`.
  - *Scenario 3 (Markdown không hỗ trợ details)*: Trình hiển thị bung sẵn nội dung danh sách markdown sạch sẽ, không vỡ giao diện.

```mermaid
flowchart LR
    A["Báo cáo cũ: Dài dòng, lặp task, thiếu cổng hỏi"] -->|"Chạy /only-one-apply"| B["Báo cáo mới: Collapsible Hybrid, bỏ Bước tiếp theo, có Friction Check Gate"]
```

## Section 3. Test Cases & Verification Matrix

### 3.1. Concept Coverage & Traceability Matrix (Đối soát Tiêu chí Concept)
- **Tiêu chí 1 (Báo cáo Collapsible Hybrid)**: Xác thực mẫu `<details>` và tổng quan 2 dòng.
- **Tiêu chí 2 (Loại bỏ Bước tiếp theo)**: Kiểm tra không còn tiêu đề `### 4. Bước tiếp theo`.
- **Tiêu chí 3 (Cổng Friction Check Gate)**: Kiểm tra sự hiện diện của câu hỏi tương tác mẫu.
- **Tiêu chí 4 (Đính chính đường dẫn scripts)**: Kiểm tra tiền tố `assets/agents/skills/...`.
- **Tiêu chí 5 (Tuân thủ chuẩn ASD-STE100)**: Kiểm tra qua linter `lintSkill` đạt chuẩn.

### 3.2. Test Case Specification Matrix (Ma trận Test Case Chi tiết)

| Test ID | Module / File Mục Tiêu | Loại Kiểm Thử | Tình Huống Kiểm Thử & Hành Vi Mong Đợi | Trạng Thái / Kết Quả |
| :--- | :--- | :--- | :--- | :--- |
| `TC-REPORT-01` | `test/skills/applyReportTemplate.test.ts` | Unit / Invariant | Xác nhận `SKILL.md` chứa cấu trúc `<details>` cho danh sách file và test | [x] PASS (3 tests passed) |
| `TC-REPORT-02` | `test/skills/applyReportTemplate.test.ts` | Unit / Invariant | Xác nhận `SKILL.md` đã loại bỏ hoàn toàn `### 4. Bước tiếp theo` và cây ASCII cũ | [x] PASS (3 tests passed) |
| `TC-REPORT-03` | `test/skills/applyReportTemplate.test.ts` | Unit / Invariant | Xác nhận sự hiện diện của Cổng cải tiến `💬 **Cổng cải tiến (only-one-evolve)**:` | [x] PASS (3 tests passed) |
| `TC-REPORT-04` | `test/skills/applyReportTemplate.test.ts` | Unit / Invariant | Xác nhận đường dẫn thực thi `assets/agents/skills/only-one-apply/scripts/...` | [x] PASS (3 tests passed) |
| `TC-REPORT-05` | `test/skills/applyReportTemplate.test.ts` | Linter / STE100 | Xác nhận toàn bộ nội dung `SKILL.md` vượt qua `lintSkill` với 0 lỗi cú pháp | [x] PASS (valid: true, 0 violations) |

### Automated Test Execution Commands (Lệnh Kiểm thử Tự động Tập trung)
- Chạy test kiểm thử mẫu báo cáo:
  ```bash
  npx vitest run test/skills/applyReportTemplate.test.ts
  ```
- Kiểm tra độ gọn gàng và chuẩn câu ASD-STE100:
  ```bash
  $env:NODE_PATH="d:\Sources\PERSONAL\only-one-cli\node_modules"; npx tsx assets/agents/skills/only-one-evolve/scripts/lint-skill.ts assets/agents/skills/only-one-apply/SKILL.md
  ```

## Section 4. File Changes

### 1. `[MODIFY]` `test/skills/applyReportTemplate.test.ts`

- **Status**: `[x]`
- **Task Type**: `code`
- **Context**: Bộ kiểm thử hiện tại đang kiểm tra mẫu 4 phần cũ với cây thư mục và bước tiếp theo.
- **Target Symbols / AST Seams**: `only-one-apply Concise Report Template Invariants`
- **Invariants**: Áp dụng Pragmatic TDD; chạy trước khi chỉnh sửa file tài liệu `SKILL.md`.
- **Depends On**: None.

> **Action**: Cập nhật các assertions để kiểm tra cấu trúc Collapsible Hybrid, cổng Friction Check và loại bỏ bước tiếp theo.

**Test checklist**
- [x] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [x] Đã rà soát code hiện có, thư viện chuẩn và dependencies.
- [x] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [x] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Viết test trước theo quy chuẩn Pragmatic TDD để khóa chặt ranh giới báo cáo mới.
- **Rejected alternative**: Sửa file tài liệu trước khi cập nhật test suite.

```diff
--- a/test/skills/applyReportTemplate.test.ts
+++ b/test/skills/applyReportTemplate.test.ts
@@ -14,15 +14,18 @@
     it('chứa mẫu báo cáo tinh gọn bằng tiếng Việt', () => {
         const content = fs.readFileSync(skillPath, 'utf8');
 
-        // 1. Cấu trúc source thay đổi
-        expect(content).toContain('1. Cấu trúc source thay đổi');
+        // Khối tổng quan và chi tiết thu gọn
+        expect(content).toContain('<summary>📂 Chi tiết tệp tin thay đổi (Click để mở rộng)</summary>');
+        expect(content).toContain('<summary>🧪 Chi tiết kiểm thử (Click để mở rộng)</summary>');
+        expect(content).toContain('💬 **Cổng cải tiến (only-one-evolve)**:');
 
-        // 2. Các công việc đã xử lý
-        expect(content).toContain('2. Các công việc đã xử lý');
+        // Loại bỏ hoàn toàn các mục dài dòng cũ và Bước tiếp theo
+        expect(content).not.toContain('### 1. Cấu trúc source thay đổi');
+        expect(content).not.toContain('### 2. Các công việc đã xử lý');
+        expect(content).not.toContain('### 4. Bước tiếp theo');
 
-        // 3. Nghiệm thu & Kiểm thử
-        expect(content).toContain('3. Nghiệm thu & Kiểm thử');
-
-        // 4. Bước tiếp theo
-        expect(content).toContain('4. Bước tiếp theo');
+        // Đường dẫn script chính xác
+        expect(content).toContain('assets/agents/skills/only-one-apply/scripts/record-improvement.ts');
+        expect(content).toContain('assets/agents/skills/only-one-apply/scripts/plan-status.ts');
     });
 
     it('đáp ứng tiêu chuẩn độ dài câu ASD-STE100 qua lintSkill', () => {
```

### 2. `[MODIFY]` `assets/agents/skills/only-one-apply/SKILL.md`

- **Status**: `[x]`
- **Task Type**: `code`
- **Context**: File tài liệu kỹ năng gốc chứa mẫu Walkthrough 4 phần cũ, sai đường dẫn script và thiếu câu hỏi ma sát.
- **Target Symbols / AST Seams**: `In-Chat Walkthrough Presentation`, `Capture In-Task Friction Points`, `Available Scripts`, `Guardrails`
- **Invariants**: Giữ nguyên độ dài câu ASD-STE100 <= 25 từ; tổng dung lượng từ <= 2500 từ.
- **Depends On**: `test/skills/applyReportTemplate.test.ts`

> **Action**: Thay thế mẫu báo cáo thành Collapsible Hybrid, bỏ bước tiếp theo, đính chính đường dẫn scripts và chuẩn hóa câu hỏi Friction Check.

**Ponytail checklist**
- [x] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [x] Đã rà soát code hiện có, thư viện chuẩn và dependencies.
- [x] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [x] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Thay thế cấu trúc tĩnh bằng khối collapsible và bổ sung prompt câu hỏi tương tác trực tiếp.
- **Rejected alternative**: Giữ nguyên cấu trúc cũ và thêm cờ tham số dòng lệnh phức tạp.

```diff
--- a/assets/agents/skills/only-one-apply/SKILL.md
+++ b/assets/agents/skills/only-one-apply/SKILL.md
@@ -31,10 +31,10 @@
 - **`scripts/plan-status.ts`**: Fast deterministic task parser and DAG execution wave calculator.
   ```bash
-  npx tsx assets/skills/only-one-apply/scripts/plan-status.ts <path-to-plan.md>
+  npx tsx assets/agents/skills/only-one-apply/scripts/plan-status.ts <path-to-plan.md>
   ```
 - **`scripts/record-improvement.ts`**: Appends in-task friction notes deterministically.
   ```bash
-  npx tsx assets/skills/only-one-apply/scripts/record-improvement.ts <slug> <skill> <deficiency> <cause>
+  npx tsx assets/agents/skills/only-one-apply/scripts/record-improvement.ts <slug> <skill> <deficiency> <cause>
   ```
 - **`scripts/worktree-runner.ts`**: Điều phối vòng đời worktree, junction và rebase git an toàn.
@@ -235,32 +235,42 @@
    - 🛑 **Strict No-Extra-File Invariant**: Never create a separate `walkthrough.md` file on disk.
-   - Report MUST strictly follow this concise schema:
+   - 🛑 **Strict Anti-Bloat Output Invariant**: Never emit ASCII directory trees or repeat task block descriptions verbatim.
+   - Report MUST strictly follow this Collapsible Hybrid schema:
 
 ```markdown
 # 🏁 Hoàn tất: `<slug>` (`status: done` / `fixed`)
 
-### 1. Cấu trúc source thay đổi
-```text
-src/
-├── [NEW]    path/to/newFile.ts   # <Mô tả ngắn gọn>
-└── [MODIFY] path/to/modFile.ts   # <Mô tả ngắn gọn>
-```
-
-### 2. Các công việc đã xử lý
-- <Tóm tắt ngắn gọn các task block đã thực thi>.
-
-### 3. Nghiệm thu & Kiểm thử
-- `<Lệnh test>` -> `PASS (X tests passed)`
-
-### 4. Bước tiếp theo
-- `/only-one-clean` | `/only-one-pr-git`
+- **Trạng thái**: `DONE` ✅ (X files changed, Y tests passed)
+- **Điểm mấu chốt**: <1-2 câu tóm tắt giá trị kỹ thuật đã hoàn thành>
+
+<details>
+<summary>📂 Chi tiết tệp tin thay đổi (Click để mở rộng)</summary>
+
+- `[NEW]`    path/to/new-file.ts
+- `[MODIFY]` path/to/mod-file.ts
+</details>
+
+<details>
+<summary>🧪 Chi tiết kiểm thử (Click để mở rộng)</summary>
+
+- `<Lệnh test 1>`: X passed
+- `<Lệnh test 2>`: Clean
+</details>
+
+---
+💬 **Cổng cải tiến (only-one-evolve)**:
+Bạn có gặp khó khăn hay điểm ma sát nào cần ghi nhận để cải tiến kỹ năng không?
 ```
 
 4. **Capture In-Task Friction Points & Opportunities (`improvements.md`)**:
-   - If test failures, lint retries, or user corrective prompts occurred during task execution:
+   - 🛑 **Interactive Friction Check Gate**: Prompt user directly with the question from the report schema above.
+   - If user reports friction or if test retries occurred during execution:
      - Execute:
        ```bash
-       npx tsx assets/skills/only-one-apply/scripts/record-improvement.ts <slug> <target-skill> "<deficiency>" "<root-cause>"
+       npx tsx assets/agents/skills/only-one-apply/scripts/record-improvement.ts <slug> <target-skill> "<deficiency>" "<root-cause>"
        ```
-   - If execution completed 100% cleanly without friction or user corrections, omit this file.
+   - If user confirms no friction occurred, omit `improvements.md` entirely.
    - **Test Matrix Verification Gate**: Đối soát từng `Test ID` trong Section 3 của plan.md, chạy test suite xác nhận pass và cập nhật `[x]` vào bảng trước khi hoàn tất.
-   - **Friction Check Gate**: Chủ động hỏi người dùng xem có bài học hoặc điểm ma sát nào cần ghi nhận để cải tiến kỹ năng only-one-* trước khi đóng tác vụ.
+   - **Evolution Link Invariant**: Staged improvements will be consumed by `/only-one-clean` and applied by `/only-one-evolve`.
@@ -278,2 +288,3 @@
 - Execute `Fast Test Command` per file before proceeding to the next.
 - Maintain Beyoncé Rule at all times.
+- **Strict Anti-Bloat Report Invariant**: Report must use Collapsible Hybrid schema with zero ASCII trees and no Next Steps section.
```

### 3. `[MODIFY]` `C:/Users/ADMIN/.gemini/config/skills/only-one-apply/SKILL.md`

- **Status**: `[x]`
- **Task Type**: `non-code`
- **Context**: File cấu hình kỹ năng toàn cục của Antigravity cần được đồng bộ với tài nguyên của repository.
- **Target Symbols / AST Seams**: `In-Chat Walkthrough Presentation`, `Capture In-Task Friction Points`, `Available Scripts`, `Guardrails`
- **Invariants**: Nội dung phải đồng nhất hoàn toàn với file asset `only-one-apply/SKILL.md`.
- **Depends On**: `assets/agents/skills/only-one-apply/SKILL.md`

> **Action**: Đồng bộ nội dung Walkthrough Schema mới và Cổng Friction Check sang file cấu hình toàn cục.

**Ponytail checklist**
- [x] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [x] Đã rà soát code hiện có, thư viện chuẩn và dependencies.
- [x] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [x] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Đồng bộ trực tiếp đảm bảo Antigravity áp dụng ngay quy chuẩn mới.
- **Rejected alternative**: Chờ người dùng tự chạy lệnh đồng bộ thủ công ngoài terminal.

```diff
--- a/C:/Users/ADMIN/.gemini/config/skills/only-one-apply/SKILL.md
+++ b/C:/Users/ADMIN/.gemini/config/skills/only-one-apply/SKILL.md
@@ -31,10 +31,10 @@
 - **`scripts/plan-status.ts`**: Fast deterministic task parser and DAG execution wave calculator.
   ```bash
-  npx tsx assets/skills/only-one-apply/scripts/plan-status.ts <path-to-plan.md>
+  npx tsx assets/agents/skills/only-one-apply/scripts/plan-status.ts <path-to-plan.md>
   ```
 - **`scripts/record-improvement.ts`**: Appends in-task friction notes deterministically.
   ```bash
-  npx tsx assets/skills/only-one-apply/scripts/record-improvement.ts <slug> <skill> <deficiency> <cause>
+  npx tsx assets/agents/skills/only-one-apply/scripts/record-improvement.ts <slug> <skill> <deficiency> <cause>
   ```
 - **`scripts/worktree-runner.ts`**: Điều phối vòng đời worktree, junction và rebase git an toàn.
@@ -235,32 +235,42 @@
    - 🛑 **Strict No-Extra-File Invariant**: Never create a separate `walkthrough.md` file on disk.
-   - Report MUST strictly follow this concise schema:
+   - 🛑 **Strict Anti-Bloat Output Invariant**: Never emit ASCII directory trees or repeat task block descriptions verbatim.
+   - Report MUST strictly follow this Collapsible Hybrid schema:
 
 ```markdown
 # 🏁 Hoàn tất: `<slug>` (`status: done` / `fixed`)
 
-### 1. Cấu trúc source thay đổi
-```text
-src/
-├── [NEW]    path/to/newFile.ts   # <Mô tả ngắn gọn>
-└── [MODIFY] path/to/modFile.ts   # <Mô tả ngắn gọn>
-```
-
-### 2. Các công việc đã xử lý
-- <Tóm tắt ngắn gọn các task block đã thực thi>.
-
-### 3. Nghiệm thu & Kiểm thử
-- `<Lệnh test>` -> `PASS (X tests passed)`
-
-### 4. Bước tiếp theo
-- `/only-one-clean` | `/only-one-pr-git`
+- **Trạng thái**: `DONE` ✅ (X files changed, Y tests passed)
+- **Điểm mấu chốt**: <1-2 câu tóm tắt giá trị kỹ thuật đã hoàn thành>
+
+<details>
+<summary>📂 Chi tiết tệp tin thay đổi (Click để mở rộng)</summary>
+
+- `[NEW]`    path/to/new-file.ts
+- `[MODIFY]` path/to/mod-file.ts
+</details>
+
+<details>
+<summary>🧪 Chi tiết kiểm thử (Click để mở rộng)</summary>
+
+- `<Lệnh test 1>`: X passed
+- `<Lệnh test 2>`: Clean
+</details>
+
+---
+💬 **Cổng cải tiến (only-one-evolve)**:
+Bạn có gặp khó khăn hay điểm ma sát nào cần ghi nhận để cải tiến kỹ năng không?
 ```
 
 4. **Capture In-Task Friction Points & Opportunities (`improvements.md`)**:
-   - If test failures, lint retries, or user corrective prompts occurred during task execution:
+   - 🛑 **Interactive Friction Check Gate**: Prompt user directly with the question from the report schema above.
+   - If user reports friction or if test retries occurred during execution:
      - Execute:
        ```bash
-       npx tsx assets/skills/only-one-apply/scripts/record-improvement.ts <slug> <target-skill> "<deficiency>" "<root-cause>"
+       npx tsx assets/agents/skills/only-one-apply/scripts/record-improvement.ts <slug> <target-skill> "<deficiency>" "<root-cause>"
        ```
-   - If execution completed 100% cleanly without friction or user corrections, omit this file.
+   - If user confirms no friction occurred, omit `improvements.md` entirely.
    - **Test Matrix Verification Gate**: Đối soát từng `Test ID` trong Section 3 của plan.md, chạy test suite xác nhận pass và cập nhật `[x]` vào bảng trước khi hoàn tất.
-   - **Friction Check Gate**: Chủ động hỏi người dùng xem có bài học hoặc điểm ma sát nào cần ghi nhận để cải tiến kỹ năng only-one-* trước khi đóng tác vụ.
+   - **Evolution Link Invariant**: Staged improvements will be consumed by `/only-one-clean` and applied by `/only-one-evolve`.
@@ -278,2 +288,3 @@
 - Execute `Fast Test Command` per file before proceeding to the next.
 - Maintain Beyoncé Rule at all times.
+- **Strict Anti-Bloat Report Invariant**: Report must use Collapsible Hybrid schema with zero ASCII trees and no Next Steps section.
```

