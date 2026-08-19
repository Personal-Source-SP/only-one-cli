# Walkthrough: Triển khai Workflow & Skill `only-one-intranet` với MCP `zodinet-timesheet`

## 1. Tóm tắt Thay đổi

Đã triển khai thành công toàn bộ các thành phần theo thiết kế của `plan.md`:

1. **Workflow Command Asset**:
   - `[NEW]` [assets/workflows/only-one-intranet.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/only-one-intranet.md): Định nghĩa workflow `/only-one-intranet` tiếp nhận tham số `--date`, `--project`, `--tasks-per-day`, `--validate` và danh sách task.
2. **Skill & Tài liệu Tham chiếu**:
   - `[NEW]` [assets/skills/only-one-intranet-skill/SKILL.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-intranet-skill/SKILL.md): Định nghĩa skill thực thi 13 bước chi tiết (validate $\rightarrow$ resolve project $\rightarrow$ preview $\rightarrow$ safe snapshot & replace $\rightarrow$ bulk log $\rightarrow$ render post-log summary).
   - `[NEW]` [assets/skills/only-one-intranet-skill/references/task-format.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-intranet-skill/references/task-format.md): Quy chuẩn ngữ pháp task `[Label] Description | start-endh`.
   - `[NEW]` [assets/skills/only-one-intranet-skill/references/validation-rules.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/only-one-intranet-skill/references/validation-rules.md): Quy chuẩn phân bổ ngày làm việc, xử lý weekend, preview, rollback và format báo cáo tổng kết tháng.
3. **MCP Manifest & Combos Registry**:
   - `[MODIFY]` [assets/mcps/index.ts](file:///Users/kiem/Sources/Personal/only-one-cli/assets/mcps/index.ts): Đăng ký `zodinet-timesheet` với bridge `mcp-remote` và biến môi trường `TIMESHEET_PAT`.
   - `[MODIFY]` [assets/combos/index.ts](file:///Users/kiem/Sources/Personal/only-one-cli/assets/combos/index.ts): Bổ sung `only-one-intranet` vào `full-sdlc-flow`, `zodinet-timesheet` vào `mcp-flow`, và combo mới `git-intranet-flow`.
   - `[MODIFY]` [assets/skills/index.ts](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/index.ts): Đăng ký `only-one-intranet-skill`.
   - `[MODIFY]` [assets/workflows/index.ts](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/index.ts): Đăng ký `only-one-intranet`.
4. **Core Templates & Inference**:
   - `[MODIFY]` [src/core/templates/agent-workflows.ts](file:///Users/kiem/Sources/Personal/only-one-cli/src/core/templates/agent-workflows.ts): Bổ sung `AgentWorkflowCommandId.Intranet`, `INTRANET_SKILL_NAME`, `buildIntranetCommandContent`, và export workflow.
   - `[MODIFY]` [src/core/combo/index.ts](file:///Users/kiem/Sources/Personal/only-one-cli/src/core/combo/index.ts): Tự động suy luận MCP `zodinet-timesheet` khi chọn `only-one-intranet-skill`.
5. **Unit Tests**:
   - `[MODIFY]` [test/core/agent-workflows.test.ts](file:///Users/kiem/Sources/Personal/only-one-cli/test/core/agent-workflows.test.ts): Thêm test contract kiểm thử các options bắt buộc, dependency và thứ tự xuất bản workflow.

---

## 2. Kết quả Kiểm thử (Verification Results)

### 1. Kiểm tra Unit Test Suite
```bash
npm test
```
**Kết quả**: 45/45 test files passed (180 tests passed, 4 skipped).

### 2. Kiểm tra Format Code & TypeScript Build
```bash
npm run format:check && npm run build
```
**Kết quả**: Không có lỗi cú pháp hoặc typecheck, build ra thư mục `dist` thành công.

---

## 3. Minh chứng Code Diffs

### Cấu hình MCP Manifest (`zodinet-timesheet`)
```diff
+    {
+        id: 'zodinet-timesheet',
+        server: {
+            command: 'npx',
+            args: [
+                '-y',
+                'mcp-remote',
+                'https://intranet-api.vn02.zodinet.tech/api/mcp',
+                '--header',
+                'Authorization:Bearer ${TIMESHEET_PAT}',
+            ],
+            env: {
+                TIMESHEET_PAT: '',
+            },
+        },
+    },
```

### Command Template cho Intranet
```diff
+export const buildIntranetCommandContent = (): CommandContent => ({
+    body: buildIntranetCommandBody(),
+    category: 'Workflow',
+    description: 'Validate, log Intranet timesheet entries, and output monthly summary using only-one-intranet-skill and zodinet-timesheet MCP.',
+    id: AgentWorkflowCommandId.Intranet,
+    name: AgentWorkflowCommandId.Intranet,
+    tags: ['only-one', 'intranet', 'timesheet', 'mcp', 'time-tracking'],
+});
```
