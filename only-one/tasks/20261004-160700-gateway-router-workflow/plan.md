---
status: done
slug: gateway-router-workflow
started_at: 2026-10-04
completed_at: 2026-10-04
pr_url: ~
branch: ~
---

# Plan: Xây dựng Gateway Router Workflow (/only-one)

## Section 1. Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
only-one-cli/
├── assets/
│   ├── workflows/
│   │   ├── [NEW]    only-one.md                 # Asset template cho Gateway Router workflow
│   │   └── [MODIFY] index.ts                    # Đăng ký only-one workflow manifest
│   └── combos/
│       └── [MODIFY] index.ts                    # Bổ sung only-one vào frontend, backend, full-sdlc combos
├── .agents/
│   └── workflows/
│       └── [NEW]    only-one.md                 # Active agent workflow đồng bộ với assets
└── test/
    └── core/
        └── [MODIFY] workflow-registry.test.ts   # Thêm test case xác thực gateway router registration
```

---

## Section 2. File Changes

### 1. `[NEW]` `assets/workflows/only-one.md`

- **Status**: `[x]`
- **Context**: Chưa có workflow gateway định tuyến intent người dùng và trạng thái workspace.
- **Target Symbols / AST Seams**: Markdown template frontmatter, Triage Protocol, Intent Matrix.
- **Invariants**: Tuân thủ chuẩn 70% ASD-STE100, câu lệnh điều hướng chính xác 100% với 11 workflow hiện hữu.
- **Depends On**: None.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Khởi tạo tài liệu workflow asset `only-one.md` làm gateway router điều hướng tác vụ.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Tạo file workflow asset mới với format markdown chuẩn hoá.
- **Rejected alternative**: Ghép logic triage vào `only-one-idea.md` (sai Single Responsibility Principle).

```diff
+---
+description: Triage user intent, inspect workspace state, and route to the matching specialized workflow.
+---
+
+## Input
+
+```text
+/only-one [<task description, error log, task folder, or question>]
+```
+
+If input is empty, inspect workspace status and active tasks to offer immediate guidance.
+
+## Role
+
+You are a **Senior Software Architect and Gateway Dispatcher**. Your core responsibilities:
+- Perform automated workspace reconnaissance (git status, conflict markers, active tasks).
+- Classify user intent into matching domain categories using the 8-group Intent Matrix.
+- Emit concise triage results and the exact slash command with 70% ASD-STE100 discipline.
+- Pause and hand off execution cleanly without modifying source code or starting sub-workflows destructively.
+
+## Purpose
+
+Serve as the Single Entry Point for the entire Only-One workflow suite, eliminating workflow discovery friction and preventing misaligned SDLC process execution.
+
+---
+
+## Mandatory Output Skill
+
+Before the first user-visible response, read and activate `i-have-adhd`; keep it active throughout this workflow.
+
+`i-have-adhd` is a presentation adapter, not an execution policy. Priority: safety -> workflow lifecycle, gates, artifacts, and order -> domain-skill completeness and evidence -> ADHD-friendly formatting -> generic style. Structured tables and recommendations are exempt from prose list limits.
+
+## 1. Skills Catalog (Gateway Triage & Dispatch)
+
+| Skill | Trigger condition (Use When) | Core Purpose (What It Does) |
+| :--- | :--- | :--- |
+| **`i-have-adhd`** | Every user-visible turn | Action-first progress output with clean visual hierarchy. |
+| **`karpathy-ste100-discipline`** | Formatting triage report & advice | Enforce <= 25 words per sentence, zero prose filler, and explicit actions. |
+| **`ponytail`** | Scope & workflow matching | Select first sufficient workflow rung (Flash vs Full SDLC). |
+| **`doubt-driven-development`** | Ambiguous or high-blast-radius inputs | Red-team scope assumptions before recommending fast-track paths. |
+
+---
+
+## 2. Multi-Tier Triage Protocol
+
+### Tier 1 — Workspace Reconnaissance (Internal)
+1. **Git State**: Check for conflict markers, in-progress rebase/merge, or untracked changes.
+2. **Task State**: Inspect `only-one/tasks/` for active tasks with `concept.md`, `plan.md`, or `debug.md`.
+
+### Tier 2 — Intent Classification Matrix
+
+| Observed State / User Input | Intent Category | Target Workflow |
+| :--- | :--- | :--- |
+| Git merge conflict or rebase conflict in progress | Conflict Resolution | `/only-one-conflict` |
+| Stack trace, crash log, compiler error, regression bug | Root Cause Diagnosis | `/only-one-debug` |
+| New complex feature, architectural change, open idea | Discovery & Specification | `/only-one-idea` |
+| Small task, quick fix, micro-refactor (<= 2 files) | Fast-Track Execution | `/only-one-flash` |
+| Active task folder with `concept.md` (no `plan.md`) | Implementation Planning | `/only-one-plan <task-folder>` |
+| Active task folder with `plan.md` or `debug.md` | Code Implementation | `/only-one-apply <task-folder>` |
+| Code quality audit, uncommitted review, PR inspection | Open CodeReview | `/only-one-review` |
+| Stale task archive, outdated docs cleanup | Repo Maintenance | `/only-one-clean` |
+| Git branch ready for Pull Request | PR Submission | `/only-one-pr-git` |
+| Timesheet logging or daily work tracking | Time Logging | `/only-one-clockify` \| `/only-one-intranet` |
+
+---
+
+## 3. Dispatch & Handoff Format
+
+Emit the triage result directly into the chat response using this standardized format:
+
+```markdown
+### 🧭 Only-One Workflow Gateway
+
+- **Phân loại tác vụ**: <Intent Category>
+- **Căn cứ đánh giá**: <1 concise sentence explaining the match, <= 25 words>
+- **Workflow khuyến nghị**: `/only-one-<name>`
+
+👉 **Câu lệnh thực thi đề xuất**:
+```text
+/only-one-<name> <normalized arguments>
+```
+```
+
+🛑 **Review Gate**: Stop immediately after emitting the dispatch recommendation. Wait for user command execution.
+
+---
+
+## Guardrails
+
+- **Zero Destructive Action**: Never start modifying source code directly in the gateway workflow.
+- **Single Entry Purity**: Only output triage classification, reason, and executable command.
+- **Blast Radius Guard**: If a task seems small but modifies core architecture, route to `/only-one-idea`.
+```

---

### 2. `[NEW]` `.agents/workflows/only-one.md`

- **Status**: `[x]`
- **Context**: Agent workflow active file cần đồng bộ 1:1 với template asset.
- **Target Symbols / AST Seams**: Agent workflow active definition.
- **Invariants**: Đồng bộ chính xác với `assets/workflows/only-one.md`.
- **Depends On**: Task 1 (`assets/workflows/only-one.md`).
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Tạo bản sao đồng bộ của workflow `only-one.md` trong thư mục `.agents/workflows/`.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Bản sao 1:1 từ `assets/workflows/only-one.md` vào `.agents/workflows/only-one.md`.
- **Rejected alternative**: Chỉ tạo ở `assets` mà bỏ qua `.agents` (khiến runtime agent không nhận diện được slash command).

```diff
+---
+description: Triage user intent, inspect workspace state, and route to the matching specialized workflow.
+---
+
+## Input
+
+```text
+/only-one [<task description, error log, task folder, or question>]
+```
+
+If input is empty, inspect workspace status and active tasks to offer immediate guidance.
+
+## Role
+
+You are a **Senior Software Architect and Gateway Dispatcher**. Your core responsibilities:
+- Perform automated workspace reconnaissance (git status, conflict markers, active tasks).
+- Classify user intent into matching domain categories using the 8-group Intent Matrix.
+- Emit concise triage results and the exact slash command with 70% ASD-STE100 discipline.
+- Pause and hand off execution cleanly without modifying source code or starting sub-workflows destructively.
+
+## Purpose
+
+Serve as the Single Entry Point for the entire Only-One workflow suite, eliminating workflow discovery friction and preventing misaligned SDLC process execution.
+
+---
+
+## Mandatory Output Skill
+
+Before the first user-visible response, read and activate `i-have-adhd`; keep it active throughout this workflow.
+
+`i-have-adhd` is a presentation adapter, not an execution policy. Priority: safety -> workflow lifecycle, gates, artifacts, and order -> domain-skill completeness and evidence -> ADHD-friendly formatting -> generic style. Structured tables and recommendations are exempt from prose list limits.
+
+## 1. Skills Catalog (Gateway Triage & Dispatch)
+
+| Skill | Trigger condition (Use When) | Core Purpose (What It Does) |
+| :--- | :--- | :--- |
+| **`i-have-adhd`** | Every user-visible turn | Action-first progress output with clean visual hierarchy. |
+| **`karpathy-ste100-discipline`** | Formatting triage report & advice | Enforce <= 25 words per sentence, zero prose filler, and explicit actions. |
+| **`ponytail`** | Scope & workflow matching | Select first sufficient workflow rung (Flash vs Full SDLC). |
+| **`doubt-driven-development`** | Ambiguous or high-blast-radius inputs | Red-team scope assumptions before recommending fast-track paths. |
+
+---
+
+## 2. Multi-Tier Triage Protocol
+
+### Tier 1 — Workspace Reconnaissance (Internal)
+1. **Git State**: Check for conflict markers, in-progress rebase/merge, or untracked changes.
+2. **Task State**: Inspect `only-one/tasks/` for active tasks with `concept.md`, `plan.md`, or `debug.md`.
+
+### Tier 2 — Intent Classification Matrix
+
+| Observed State / User Input | Intent Category | Target Workflow |
+| :--- | :--- | :--- |
+| Git merge conflict or rebase conflict in progress | Conflict Resolution | `/only-one-conflict` |
+| Stack trace, crash log, compiler error, regression bug | Root Cause Diagnosis | `/only-one-debug` |
+| New complex feature, architectural change, open idea | Discovery & Specification | `/only-one-idea` |
+| Small task, quick fix, micro-refactor (<= 2 files) | Fast-Track Execution | `/only-one-flash` |
+| Active task folder with `concept.md` (no `plan.md`) | Implementation Planning | `/only-one-plan <task-folder>` |
+| Active task folder with `plan.md` or `debug.md` | Code Implementation | `/only-one-apply <task-folder>` |
+| Code quality audit, uncommitted review, PR inspection | Open CodeReview | `/only-one-review` |
+| Stale task archive, outdated docs cleanup | Repo Maintenance | `/only-one-clean` |
+| Git branch ready for Pull Request | PR Submission | `/only-one-pr-git` |
+| Timesheet logging or daily work tracking | Time Logging | `/only-one-clockify` \| `/only-one-intranet` |
+
+---
+
+## 3. Dispatch & Handoff Format
+
+Emit the triage result directly into the chat response using this standardized format:
+
+```markdown
+### 🧭 Only-One Workflow Gateway
+
+- **Phân loại tác vụ**: <Intent Category>
+- **Căn cứ đánh giá**: <1 concise sentence explaining the match, <= 25 words>
+- **Workflow khuyến nghị**: `/only-one-<name>`
+
+👉 **Câu lệnh thực thi đề xuất**:
+```text
+/only-one-<name> <normalized arguments>
+```
+```
+
+🛑 **Review Gate**: Stop immediately after emitting the dispatch recommendation. Wait for user command execution.
+
+---
+
+## Guardrails
+
+- **Zero Destructive Action**: Never start modifying source code directly in the gateway workflow.
+- **Single Entry Purity**: Only output triage classification, reason, and executable command.
+- **Blast Radius Guard**: If a task seems small but modifies core architecture, route to `/only-one-idea`.
+```

---

### 3. `[MODIFY]` `assets/workflows/index.ts`

- **Status**: `[x]`
- **Context**: Danh sách `WORKFLOWS` chứa 11 workflows, chưa có `only-one` gateway router.
- **Target Symbols / AST Seams**: `WORKFLOWS` array.
- **Invariants**: Phiên bản semver hợp lệ (`0.0.1`), description không rỗng, requiredSkills chứa `i-have-adhd`, `karpathy-ste100-discipline`, `ponytail`, `doubt-driven-development`.
- **Depends On**: Task 1 (`assets/workflows/only-one.md`).
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Đăng ký workflow manifest `only-one` vào mảng `WORKFLOWS`.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Thêm entry `only-one` vào `WORKFLOWS` manifest array.
- **Rejected alternative**: Định nghĩa gateway workflow ngầm không qua manifest.

```diff
@@ -3,4 +3,18 @@
 export const WORKFLOWS: WorkflowManifest[] = [
+    {
+        name: 'only-one',
+        version: '0.0.1',
+        description:
+            'Triage user intent, inspect workspace state, and route to the matching specialized workflow.',
+        requiredSkills: [
+            'i-have-adhd',
+            'karpathy-ste100-discipline',
+            'ponytail',
+            'doubt-driven-development',
+        ],
+    },
     {
         name: 'only-one-idea',
```

---

### 4. `[MODIFY]` `assets/combos/index.ts`

- **Status**: `[x]`
- **Context**: Các combo `frontend-flow`, `backend-flow`, `full-sdlc-flow` chưa đăng ký `only-one` gateway router.
- **Target Symbols / AST Seams**: `COMBOS` array items `frontend-flow`, `backend-flow`, `full-sdlc-flow`.
- **Invariants**: Bổ sung `'only-one'` vào mảng `workflows` và tăng patch version của 3 combo từ `0.0.9` lên `0.0.10`.
- **Depends On**: Task 3 (`assets/workflows/index.ts`).
- **Fast Test Command**: `npx vitest run test/core/combo.test.ts`.

> **Action**: Bổ sung `only-one` workflow vào các combo tiêu chuẩn và tăng version.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Thêm `only-one` vào danh sách workflows của 3 combo chính.
- **Rejected alternative**: Chỉ thêm vào full-sdlc-flow mà bỏ qua frontend/backend flows.

```diff
@@ -6,3 +6,3 @@
         id: 'frontend-flow',
-        version: '0.0.9',
+        version: '0.0.10',
         name: 'Frontend Flow Setup',
@@ -35,2 +35,3 @@
         workflows: [
+            'only-one',
             'only-one-idea',
@@ -47,3 +48,3 @@
         id: 'backend-flow',
-        version: '0.0.9',
+        version: '0.0.10',
         name: 'Backend Flow Setup',
@@ -75,2 +76,3 @@
         workflows: [
+            'only-one',
             'only-one-idea',
@@ -87,3 +89,3 @@
         id: 'full-sdlc-flow',
-        version: '0.0.9',
+        version: '0.0.10',
         name: 'Full SDLC Universal Flow Setup',
@@ -123,2 +125,3 @@
         workflows: [
+            'only-one',
             'only-one-idea',
```

---

### 5. `[MODIFY]` `test/core/workflow-registry.test.ts`

- **Status**: `[x]`
- **Context**: Bộ unit test kiểm tra tính toàn vẹn của registry chưa có test case riêng biệt cho `only-one` gateway.
- **Target Symbols / AST Seams**: `describe('workflow registry integrity')`.
- **Invariants**: Test suite chạy pass 100%, kiểm tra `only-one` tồn tại và có đầy đủ requiredSkills.
- **Depends On**: Task 3 (`assets/workflows/index.ts`).
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Thêm test case xác thực đăng ký `only-one` gateway router.

**Test checklist**
- [x] Fixture / helper reuse: Sử dụng `WORKFLOWS` và `expect` sẵn có.
- [x] No duplicate setup: Tận dụng `describe` hiện có.
- [x] Changed behavior only: Kiểm tra manifest `only-one`.
- [x] Existing toolchain: Chạy vitest.
- **Decision**: Thêm `it('registers only-one gateway router')`.
- **Rejected alternative**: Bỏ qua test case riêng và chỉ dựa vào generic test.

```diff
@@ -29,2 +29,9 @@
     });
 
+    it('registers only-one gateway router', () => {
+        const workflow = WORKFLOWS.find(({ name }) => name === 'only-one');
+        expect(workflow).toBeDefined();
+        expect(workflow?.requiredSkills).toContain('i-have-adhd');
+        expect(workflow?.requiredSkills).toContain('karpathy-ste100-discipline');
+    });
+
     it('requires and activates i-have-adhd in the five core workflows', () => {
```

---

## Section 3. Test Cases & Verification

- **Automated Tests**:
  - [x] `npx vitest run test/core/workflow-registry.test.ts` (PASS - 10 passed)
  - [x] `npx vitest run test/core/combo.test.ts test/core/assets/version-gate.test.ts` (PASS - 17 passed)
  - [x] `npm test` (PASS - 55 test files passed, 242 tests passed)
  - [x] `npm run build` (PASS - Prettier formatting clean, TypeScript compilation clean)
- **Manual Checks**:
  - [x] File asset `assets/workflows/only-one.md` và `.agents/workflows/only-one.md` có đầy đủ frontmatter và bảng Intent Matrix.
  - [x] Đăng ký `only-one` trong `WORKFLOWS` manifest và 3 combo chính (`frontend-flow`, `backend-flow`, `full-sdlc-flow`).
