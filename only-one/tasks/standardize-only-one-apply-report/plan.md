---
status: in-progress
slug: standardize-only-one-apply-report
created_at: 2026-10-20
started_at: 2026-10-20
completed_at: ~
pr_url: ~
branch: ~
---

# Plan: Chuẩn hóa Báo cáo Nghiệm thu Hoàn thành của `only-one-apply`

## Section 1. Directory Structure Changes

```text
assets/skills/only-one-apply/
└── [MODIFY] SKILL.md                          # Chuẩn hóa Step 5 với Khung Báo Cáo 5 Phần bằng Tiếng Việt

test/skills/
└── [NEW]    applyReportTemplate.test.ts       # Kiểm thử cấu trúc schema báo cáo và kiểm tra linter STE-100
```

---

## Section 2. File Changes

### 1. `[MODIFY]` `assets/skills/only-one-apply/SKILL.md`

- **Status**: `[/]`
- **Context**: Báo cáo kết thúc trong chat của `only-one-apply` hiện tại chưa có schema chi tiết, thiếu cấu trúc source, thiếu giải thích từng file và chưa chuẩn hóa tiếng Việt.
- **Target Symbols / AST Seams**: `Step 5 — Final Comprehensive Verification & In-Chat Reporting`.
- **Invariants**:
  - Bảo toàn nghiêm ngặt quy tắc không tạo file `walkthrough.md` trên đĩa.
  - Thuyết minh 100% bằng tiếng Việt chuẩn mực, giữ nguyên English code symbols, paths và commands.
  - Phải chứa đủ 5 phần nghiệm thu bắt buộc (Executive Summary, Source Structure & File Walkthrough, Verification Proof, Safety Checks, Next Steps).
- **Depends On**: None.
- **Fast Test Command**: `npm test test/skills/applyReportTemplate.test.ts`.

> **Action**: Nâng cấp Step 5 thành quy chuẩn báo cáo nghiệm thu 5 phần bằng tiếng Việt kèm mẫu chuẩn.

**Ponytail checklist**
- [ ] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [ ] Đã rà soát code hiện có, thư viện chuẩn và dependencies.
- [ ] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [ ] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Định nghĩa trực tiếp mẫu báo cáo Markdown chuẩn vào Step 5 của `SKILL.md` để mọi agent thực thi đều tuân thủ nhất quán.
- **Rejected alternative**: Không tạo script riêng sinh file markdown để tránh vi phạm Invariant không tạo file rác trên đĩa.

```diff
@@ -191,4 +191,73 @@
 3. **In-Chat Walkthrough Presentation (Zero walkthrough.md File Creation)**:
-   - Output a clean, structured walkthrough summary directly in the chat response.
-   - ❌ **Strict No-Extra-File Invariant**: Do NOT create a separate `walkthrough.md` file on disk.
+   - Output a structured, production-grade walkthrough report directly in chat.
+   - 🛑 **Strict Vietnamese Language Requirement**: Explanatory text MUST be in Vietnamese. Keep symbols, paths, and commands in English.
+   - 🛑 **Strict No-Extra-File Invariant**: Never create a separate `walkthrough.md` file on disk.
+   - Report MUST strictly follow this 5-part schema:
+
+```markdown
+# 🏁 BÁO CÁO NGHIỆM THU HOÀN THÀNH TÁC VỤ: `<slug>`
+
+## 📌 1. Tóm tắt nhanh (Executive Summary)
+- **Mục tiêu**: <Tóm tắt 1 câu về mục tiêu bài toán>.
+- **Giải pháp**: <Giải pháp kiến trúc hoặc kỹ thuật đã áp dụng>.
+- **Kết quả**: Đã áp dụng thành công X/X task blocks, 100% test suites vượt qua.
+
+---
+
+## 🗂 2. Cấu trúc Source & Chi tiết từng file
+
+### Cây thư mục tác động (Directory Tree)
+\`\`\`text
+src/
+├── [NEW]    path/to/newFile.ts
+└── [MODIFY] path/to/modifiedFile.ts
+\`\`\`
+
+### Chi tiết thay đổi theo từng file
+1. **`path/to/file.ts`** `[NEW | MODIFY | DELETE]`
+   - **Mục đích**: <Lý do thay đổi file>.
+   - **Symbols/Hàm chính**: `<symbol1>`, `<symbol2>`.
+   - **Chi tiết thay đổi**: <Mô tả cụ thể logic đã sửa đổi hoặc bổ sung>.
+   - **Fast Test**: `<fast test command>` (PASS).
+
+---
+
+## ✅ 3. Điều kiện nghiệm thu & Bằng chứng kiểm thử (Verification Proof)
+
+### Tiêu chí nghiệm thu (Acceptance Criteria)
+- [x] <Tiêu chí 1>: <Đã đáp ứng>.
+- [x] <Tiêu chí 2>: <Đã đáp ứng>.
+
+### Bằng chứng kiểm thử định lượng
+- **Fast Tests**: Đã chạy qua từng file thay đổi, 100% PASS.
+- **Full Test Suite**: `npm test` -> `PASS (X test files, Y passed, 0 failed)`.
+- **Lint & Format**: `npm run format:check` -> `Clean`.
+- **Cập nhật tài liệu task**: Frontmatter đã đổi thành `status: done` (hoặc `fixed`), `completed_at: <YYYY-MM-DD>`.
+
+---
+
+## 🛡️ 4. Kiểm soát An toàn & Rủi ro (Safety Checks)
+- [x] **Beyoncé Rule**: 100% hành vi mới hoặc sửa đổi đều có test chứng minh.
+- [x] **Ponytail Reuse**: Tận dụng tối đa logic và helper có sẵn, không trùng lặp mã.
+- [x] **Side-effects**: Xác nhận không gây ảnh hưởng tiêu cực tới các module liên đới.
+
+---
+
+## 🚀 5. Bước tiếp theo đề xuất (Next Steps)
+- Kiểm tra lại code review: `/only-one-review`
+- Đóng gói / Tạo Pull Request: `/only-one-pr-git`
+- Hoặc dọn dẹp task đã xong: `/only-one-clean`
+```
```

---

### 2. `[NEW]` `test/skills/applyReportTemplate.test.ts`

- **Status**: `[ ]`
- **Context**: Tạo bài test kiểm thử schema báo cáo của `only-one-apply` và kiểm tra tuân thủ linter ASD-STE100.
- **Target Symbols / AST Seams**: `validateApplySkillSchema`.
- **Invariants**: `assets/skills/only-one-apply/SKILL.md` phải chứa đầy đủ 5 mục bắt buộc và vượt qua bộ linter kỹ thuật.
- **Depends On**: `assets/skills/only-one-apply/SKILL.md`.
- **Fast Test Command**: `npm test test/skills/applyReportTemplate.test.ts`.

> **Action**: Tạo file test kiểm tra sự tồn tại và tính hợp lệ của mẫu báo cáo nghiệm thu.

**Ponytail checklist**
- [ ] Bắt buộc theo đúng tiêu chí nghiệm thu.
- [ ] Đã rà soát code hiện có, thư viện chuẩn và dependencies.
- [ ] Không tạo logic trùng lặp hoặc điểm mở rộng suy đoán.
- [ ] Diff tối thiểu, đảm bảo an toàn và tính đúng đắn.
- **Decision**: Sử dụng Vitest kiểm tra nội dung file `SKILL.md`.
- **Rejected alternative**: Không hard-code chuỗi so sánh quá chặt gây giòn test khi format nhẹ.

```diff
@@ -0,0 +1,41 @@
+import fs from 'node:fs';
+import path from 'node:path';
+import { describe, expect, it } from 'vitest';
+import { lintSkill } from '../../assets/skills/only-one-evolve/scripts/lint-skill.js';
+
+describe('only-one-apply Completion Report Template Invariants', () => {
+    const skillPath = path.resolve(process.cwd(), 'assets/skills/only-one-apply/SKILL.md');
+
+    it('tồn tại file assets/skills/only-one-apply/SKILL.md', () => {
+        expect(fs.existsSync(skillPath)).toBe(true);
+    });
+
+    it('chứa đầy đủ 5 phần của mẫu báo cáo nghiệm thu hoàn thành', () => {
+        const content = fs.readFileSync(skillPath, 'utf8');
+
+        // 1. Tóm tắt nhanh (Executive Summary)
+        expect(content).toContain('1. Tóm tắt nhanh (Executive Summary)');
+
+        // 2. Cấu trúc Source & Chi tiết từng file
+        expect(content).toContain('2. Cấu trúc Source & Chi tiết từng file');
+        expect(content).toContain('Cây thư mục tác động (Directory Tree)');
+
+        // 3. Điều kiện nghiệm thu & Bằng chứng kiểm thử
+        expect(content).toContain('3. Điều kiện nghiệm thu & Bằng chứng kiểm thử (Verification Proof)');
+
+        // 4. Kiểm soát An toàn & Rủi ro
+        expect(content).toContain('4. Kiểm soát An toàn & Rủi ro (Safety Checks)');
+        expect(content).toContain('Beyoncé Rule');
+        expect(content).toContain('Ponytail Reuse');
+
+        // 5. Bước tiếp theo đề xuất
+        expect(content).toContain('5. Bước tiếp theo đề xuất (Next Steps)');
+    });
+
+    it('đáp ứng tiêu chuẩn độ dài câu ASD-STE100 qua lintSkill', () => {
+        const content = fs.readFileSync(skillPath, 'utf8');
+        const result = lintSkill(content);
+        expect(result.valid).toBe(true);
+    });
+});
```

---

## Section 3. Test Cases & Verification

### Fast Test Command
- Task 1: `npm test test/skills/applyReportTemplate.test.ts`
- Task 2: `npm test test/skills/applyReportTemplate.test.ts`

### Comprehensive Verification
1. Chạy bài test vừa tạo:
   ```bash
   npm test test/skills/applyReportTemplate.test.ts
   ```
2. Chạy toàn bộ test suite của skills:
   ```bash
   npm test test/core/skill-sdlc-scripts.test.ts
   ```
3. Kiểm tra định dạng code:
   ```bash
   npm run format:check
   ```
