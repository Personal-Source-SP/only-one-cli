---
name: only-one-apply
description: Use when implementing changes from an approved plan.md, debug.md, or selected findings in review.md with dependency-ordered verification.
---

# Only-One Apply (Plan Implementation Skill)

## Overview

This skill executes an approved plan, debug document, or review finding set with vertical slice discipline, running fast verification tests per file change.

## Input

```text
/only-one-apply [<task-folder> | <plan-path> | <debug-path> | <review-path>] [--worktree | --direct] [--subagents]
```

- **With `<task-folder>`, `<plan-path>`, `<debug-path>`, or `<review-path>`**: use the given plan/debug/review file (e.g., `only-one/tasks/20260819-142500-soft-delete/plan.md` or `only-one/tasks/20260917-100000-debug-bug/debug.md`) directly. If a task folder is given, locate `plan.md`, `debug.md`, or `review.md` within it (prefer `in-progress` > `planned`/`planning`).
- **Without path**: search `only-one/tasks/` for active tasks:
  ```bash
  grep -rlE "status: in-progress" only-one/tasks/ --include="plan.md" --include="debug.md" --include="review.md" 2>/dev/null
  grep -rlE "status: (planned|planning)" only-one/tasks/ --include="plan.md" --include="debug.md" --include="review.md" 2>/dev/null
  ```
  - Prefer `in-progress` over `planned`/`planning`.
  - If multiple found, display the list and ask the user to select.
  - If none found, report: "No active plan, debug, or review task found in only-one/tasks/." and stop.

## Available Scripts

- **`scripts/plan-status.ts`**: Fast deterministic task parser and DAG execution wave calculator.
  ```bash
  npx tsx assets/agents/skills/only-one-apply/scripts/plan-status.ts <path-to-plan.md>
  ```
- **`scripts/record-improvement.ts`**: Appends in-task friction notes deterministically.
  ```bash
  npx tsx assets/agents/skills/only-one-apply/scripts/record-improvement.ts <slug> <skill> <deficiency> <cause>
  ```
- **`scripts/worktree-runner.ts`**: Điều phối vòng đời worktree, junction và rebase git an toàn.
  ```bash
  npx tsx assets/agents/skills/only-one-apply/scripts/worktree-runner.ts
  ```

## Role

### Assigned Persona & Authority
- **Assigned Persona**: **Senior Software Engineer & Lead Implementer**.
- **Core Mindset**: Precise execution according to `plan.md` blueprints, disciplined TDD, risk isolation, and automated verification.
- **Allowed Actions**:
  - Read and modify source files strictly adhering to task blocks defined in `plan.md`.
  - Run unit tests, integration tests, and linters to verify changes.
  - Update execution checklists and task statuses directly in `plan.md`.
- **Forbidden Actions**:
  - 🛑 **STRICTLY FORBIDDEN to alter architecture** or edit files outside the approved plan task blocks.
  - 🛑 **STRICTLY FORBIDDEN to delete or bypass failing test cases** without sound technical rationale.
- **Artifact Contract**: Directly updates `plan.md` / `debug.md` and repository source code.

You are a **Senior Software Engineer**. Your core responsibilities:
- Fast-path ingest ordered **Section 2 File Changes** task blocks from `plan.md`, `debug.md`, and `review.md`.
- Implement changes one file at a time from each task block's unified diff, respecting `Depends On` ordering.
- Apply execution and quality disciplines (`incremental-implementation`, `test-driven-development`, `code-simplification`, `diagnosing-bugs`).
- Run the targeted test command from Section 3 Test Matrix immediately after modifying each code/test task pair.
- Record verification evidence directly into Section 3 of `plan.md` or the existing verification section of `debug.md`, then report a concise walkthrough summary in chat.

## Purpose

Execute an approved plan or debug document with maximum machine efficiency and human clarity, verifying every file change against targeted test cases.

---

## Mandatory Output Skill

Before the first user-visible response, read and activate `i-have-adhd`; keep it active throughout this workflow.

`i-have-adhd` is a presentation adapter, not an execution policy. Priority: safety → workflow lifecycle, gates, artifacts, and order → domain-skill completeness and evidence → ADHD-friendly formatting → generic style. Preserve domain-skill completeness, file task-block order, Depends On transitions, Fast Test Commands, final verification, and evidence. Structured tables, code blocks, and diffs are exempt from prose list limits.

## 1. Skills Catalog (Build & Execution Disciplines)

| Skill | Trigger condition (Use When) | Core Purpose (What It Does) |
| :--- | :--- | :--- |
| **`i-have-adhd`** | Every user-visible turn | Action-first progress output without changing task-block execution or test evidence. |
| **`context-engineering`** | Step 1b (Loading rules and skills) | Feed only the necessary, high-signal context into working memory (Negative Rules in `rules.md` and Tech Skills) before modifying code. |
| **`incremental-implementation`** | Step 4 (Applying file changes) | Apply changes in **thin vertical slices** (file-by-file), enforcing safe parameter defaults, dependency order, and rollback-friendly modifications. |
| **`code-simplification`** | Step 4 (Quality Gate) | Audit new/modified code against YAGNI: eliminate dead code, remove orphan imports, avoid speculative wrappers, and keep cognitive load low. |
| **`test-driven-development`** | Step 4 & 5 (Verification) | Enforce the **Beyoncé Rule** (*"If you changed the behavior, you must have a test proving it"*), structure DAMP tests, and execute test suites. |
| **`diagnosing-bugs`** | When any compiler, lint, or test failure occurs | Apply a **disciplined Red Feedback Loop** (Reproduce Red $\rightarrow$ Localize $\rightarrow$ Hypothesize $\rightarrow$ Instrument $\rightarrow$ Fix) instead of blind guess-and-patch. |
| **`ponytail`** | Preflight and before each edit | Validate approved reuse/new-code decisions and stop execution on material plan conflict. |

---

## 2. Step-by-Step Execution Protocol

### Step 0b — Kích hoạt Chế độ Điều phối Orchestrator (Multi-Agent Mode)

1. Chạy `plan-status.ts` để phân tích cấu trúc Wave:
   - Nếu `isMultiWave === true` (từ 2 Waves trở lên) HOẶC người dùng truyền cờ `--subagents`: Kích hoạt **Orchestrator Mode**.
   - Ngược lại: Kích hoạt **Direct Sequential Mode** (thực thi tuần tự đơn lẻ để tiết kiệm token).
2. Trong Orchestrator Mode, Agent chính đóng vai trò **Apply Orchestrator**:
   - Quản lý điều phối các đợt Wave, ủy thác task cho Subagents theo Track, và giữ quyền duy nhất cập nhật `plan.md`.
   - **Runtime Verification Subagents Suite**:
     - Ủy thác `terminal-runner` cho việc chạy test suite và kiểm thử các lệnh CLI.
     - Ủy thác `browser-tester` cho các Wave kiểm thử giao diện web (Playwright MCP).
     - Ủy thác `api-tester` cho các Wave nghiệm thu route backend và kiểm thử tải/concurrency.

### Step 0 — Khởi tạo Chế độ Thực thi (Dual-Engine Mode Selection)

1. Kiểm tra tham số đầu vào:
   - Nếu người dùng truyền cờ `--worktree`: Kích hoạt chế độ **Worktree Mode**.
   - Nếu người dùng truyền cờ `--direct`: Kích hoạt chế độ **Direct Mode**.
   - Nếu không truyền cờ và working tree có tệp uncommitted: Đề xuất kích hoạt **Worktree Mode**.
2. Khởi tạo không gian làm việc Worktree:
   - Chạy hàm khởi tạo worktree từ runner nội bộ:
     ```bash
     npx tsx -e "import { spawnWorktree } from './assets/agents/skills/only-one-apply/scripts/worktree-runner.js'; spawnWorktree({ projectDir: process.cwd(), slug: '<slug>' });"
     ```
   - Chuyển ngữ cảnh thao tác tệp và lệnh kiểm thử sang thư mục `.worktrees/<slug>`.

### Step 1 — Locate and read the plan or debug document

**If a path or task folder is provided:**
1. If target is a file path (`plan.md`, `debug.md`, or `review.md`), read it directly.
2. If target is a task folder, check for `plan.md`, `debug.md`, or `review.md`. If both exist, prioritize `in-progress` $\rightarrow$ `planned`/`planning`.
3. If neither exists, report error and stop.

**If no path is provided:**
```bash
grep -rlE "status: in-progress" only-one/tasks/ --include="plan.md" --include="debug.md" --include="review.md" 2>/dev/null
grep -rlE "status: (planned|planning)" only-one/tasks/ --include="plan.md" --include="debug.md" --include="review.md" 2>/dev/null
```
- Prefer `in-progress` over `planned`/`planning`.
- If multiple found, display the list and ask the user to select.
- If none found, report: "No active plan, debug, or review task found in only-one/tasks/." and stop.

---

### Step 1b — Load rules and skills (`context-engineering`)

1. **Load Negative Rules (Mandatory Constraints)**:
   Read `only-one/INDEX.md` first (< 200 tokens). Match planned target files against `Trigger Globs` to load `only-one/rules/<domain>.md`. Always obey foundation constraints in `only-one/rules/core.md`.
2. **Load Project Tech & Language Skills (Mandatory Standards)**:
   Check `only-one/skills/` (and `.agents/skills/`) for relevant technology and language skills (e.g. `nestjs-development`, TypeScript strict typing).
   Read their `SKILL.md` to extract coding conventions, naming patterns, typing rules, and architectural standards.

---

### Step 2 — Validate document & Set status to in-progress

Check the frontmatter `status` field:
- `planned` / `planning` $\rightarrow$ update frontmatter to `status: in-progress`.
- `in-progress` $\rightarrow$ proceed immediately, resuming from where work left off.
- `done` / `fixed` $\rightarrow$ report: "This task is already marked done/fixed." and stop.

---

### Step 1c — Ponytail Plan Preflight (Before Status Mutation)
1. Read `ponytail`; locate each pending file checklist.
2. Cross-check each `Decision`, diff, current repository state, and safety rules.
3. On contradiction, ignored sufficient reuse, unapproved design change, missing material decision, or safety violation: do not change status or source.
4. Emit `Ponytail Plan Conflict` with task/file, violated policy, conflicting blueprint, minimal proposal, acceptance impact, and required revision/re-approval. Stop whole execution.

---

### Review Selection Gate

For `review.md`:

1. Require `document_type: review` and at least one executable finding in `OPEN`, `SELECTED`, `IN_PROGRESS`, or `FAILED`.
2. Resume `SELECTED`, `IN_PROGRESS`, or `FAILED` findings only after explicit confirmation.
3. Otherwise display interactive **multi-select** of `OPEN` findings, ordered by severity then stable ID. Show ID, severity, title, location, changed files, and Red Test summary.
4. On cancel or empty selection, stop with zero source and status mutations.
5. After confirmation, mark chosen findings `SELECTED`; leave every unselected finding `OPEN`. Never execute tasks from unselected findings.

### Step 3 — Ingest Source Structure & Parse File Tasks

1. **Review Source Structure Changes**:
   - For `plan.md`, ingest Section 1 Directory Structure Changes.
   - For `debug.md`, ingest Section 1 Diagnosis to understand the proven root cause and fix constraints. For `review.md`, ingest each selected finding Diagnosis and its finding-local File Changes.
2. **Parse executable tasks**:
   - For `plan.md`, `debug.md`, or `review.md`, jump to **Section 2 File Changes** and read ordered headings `### <order>. [<ACTION>] <path>`.
   - Require each task block to contain `Status`, `Context`, `Target Symbols / AST Seams`, `Invariants`, `Depends On`, and `Fast Test Command` before its checklist and unified diff.
   - Treat heading order as execution order and `Depends On` as blocking edges.
   - Skip tasks marked `[x]`; identify the first `[ ]` or `[/]` task. Cancelled or empty selection performs zero mutations; unselected findings remain `OPEN`.
3. **Build Execution Waves (DAG Partitioning)**:
   - Group remaining `[ ]` tasks into sequential **Execution Waves** based on `Depends On`:
     - **Wave 0**: All tasks with no dependencies (`Depends On: None`) or whose prerequisites are already `[x]`.
     - **Disjoint File Invariant**: Tasks in the same wave MUST target distinct files. If two independent tasks modify the same file, assign them to sequential sub-waves.
     - **Concurrency Cap**: Limit concurrent Sub-agents to a maximum of 3-4 workers per wave.

---

### Step 4 — Apply File Changes with Pragmatic TDD Workflow

Main Agent directly executes task blocks in sequence adhering strictly to `Depends On` ordering and Pragmatic TDD discipline:

1. **Test-First Application**:
   - Đối với các task code có test đi kèm: luôn áp dụng task block test trước, sau đó áp dụng task block code logic.
   - Chuẩn hóa line endings sang LF trước khi sửa file trên Windows.
   - Đánh dấu trạng thái task đang xử lý là `Status: [/]`.
2. **Execute Section 3 Test Command**:
   - Chạy lệnh kiểm thử tương ứng được chỉ định trong Section 3 cho module/file đang thực thi.
   - Nếu test **PASS (Green)**: Đánh dấu `Status: [x]` cho cả task test và task code, chuyển sang task block tiếp theo.
3. **Self-Healing Red Loop (Tối đa 3 lần thử)**:
   - Nếu test **FAIL (Red)**:
     - Dừng lại, đọc thông báo lỗi từ test runner (stack trace, assertion failure).
     - Khu biệt nguyên nhân và điều chỉnh mã nguồn triển khai.
     - Chạy lại lệnh kiểm thử từ Section 3.
     - Lặp lại tối đa 3 lần thử (Retry limit: 3).
     - Nếu sau 3 lần thử vẫn thất bại: Dừng toàn bộ tiến trình, giữ nguyên trạng thái `Status: [/]`, và báo cáo chi tiết nguyên nhân lỗi cho PM để xin chỉ dẫn.
4. **Non-code Tasks**:
   - Đối với các task `non-code`: Áp dụng diff, kiểm tra syntax/lint nếu có, và đánh dấu `[x]` mà không kích hoạt test loop.

### Step 4b — Quy trình Điều phối Sóng (Wave Orchestration Protocol)

1. **Ủy thác Subagents theo Track**:
   - Với mỗi Wave, Orchestrator phân tích danh sách task:
     - `Track QA`: Gọi QA Subagent (`invoke_subagent` role Tester) viết kịch bản kiểm thử độc lập (`*.test.ts`).
     - `Track Dev`: Gọi Coder Subagent (`invoke_subagent` role Developer) viết mã nguồn triển khai (`src/...`).
2. **Wave Gatekeeper & Red Feedback Loop**:
   - Ở cuối mỗi Wave, QA Subagent mở terminal chạy test matrix nghiệm thu.
   - Nếu test fail: trích xuất log lỗi tinh gọn chuyển cho Coder Subagent sửa mã nguồn (tối đa 3 lần thử lại).
3. **Single-Writer Contract**: Chỉ Orchestrator được đánh dấu `[x]` vào `plan.md` sau khi Wave Gatekeeper phê duyệt.

---

### Step 5 — Final Comprehensive Verification & In-Chat Reporting

1. Run the full repository test and lint commands:
   ```bash
   npm run format:check
   npm test
   npm run lint
   ```
2. **Update Document Verification Evidence & Completion**:
   - Update Section 3 Verification of `plan.md`, `debug.md`, or `review.md` by marking verified test items with `[x]` and appending concrete test execution evidence (e.g., `PASS - X tests passed`).
   - Update document frontmatter:
   ```yaml
   status: done   # review.md only when no executable OPEN/SELECTED/IN_PROGRESS/FAILED findings remain; debug.md uses fixed
   completed_at: <YYYY-MM-DD>
   ```
### Step 5b — Rebase-First Guard & Cổng Bàn Giao (Worktree Mode)

1. Nếu thực thi trong **Worktree Mode**:
   - Tự động tạo git commit trong worktree:
     ```bash
     git -C .worktrees/<slug> commit -am "feat(<slug>): complete task execution"
     ```
   - Thực hiện kiểm tra rebase với nhánh chính:
     ```bash
     git -C .worktrees/<slug> pull --rebase origin main
     ```
   - Nếu xảy ra xung đột: Kích hoạt `/only-one-conflict` giải quyết ngay trong worktree.
2. Hiển thị lựa chọn bàn giao cho người dùng:
   - **Lựa chọn 1 (Chuẩn PR)**: Kích hoạt `/only-one-pr-git` đẩy nhánh và tạo Pull Request.
   - **Lựa chọn 2 (Local Merge)**: Merge nhánh task vào root và dọn dẹp worktree.

3. **In-Chat Walkthrough Presentation (Zero walkthrough.md File Creation)**:
   - Output a concise, high-signal walkthrough report directly in chat.
   - 🛑 **Strict Vietnamese Language Requirement**: Explanatory text MUST be in concise Vietnamese. Keep symbols, paths, and commands in English.
   - 🛑 **Strict No-Extra-File Invariant**: Never create a separate `walkthrough.md` file on disk.
   - 🛑 **Strict Anti-Bloat Output Invariant**: Never emit ASCII directory trees or repeat task block descriptions verbatim.
   - Report MUST strictly follow this Collapsible Hybrid schema:

```markdown
# 🏁 Hoàn tất: `<slug>` (`status: done` / `fixed`)

- **Trạng thái**: `DONE` ✅ (X files changed, Y tests passed)
- **Điểm mấu chốt**: <1-2 câu tóm tắt giá trị kỹ thuật đã hoàn thành>

<details>
<summary>📂 Chi tiết tệp tin thay đổi (Click để mở rộng)</summary>

- `[NEW]`    path/to/new-file.ts
- `[MODIFY]` path/to/mod-file.ts
</details>

<details>
<summary>🧪 Chi tiết kiểm thử (Click để mở rộng)</summary>

- `<Lệnh test 1>`: X passed
- `<Lệnh test 2>`: Clean
</details>

---
💬 **Cổng cải tiến (only-one-evolve)**:
Bạn có gặp khó khăn hay điểm ma sát nào cần ghi nhận để cải tiến kỹ năng không?
```

4. **Capture In-Task Friction Points & Opportunities (`improvements.md`)**:
   - 🛑 **Interactive Friction Check Gate**: Prompt user directly with the question from the report schema above.
   - If user reports friction or if test retries occurred during execution:
     - Execute:
       ```bash
       npx tsx assets/agents/skills/only-one-apply/scripts/record-improvement.ts <slug> <target-skill> "<deficiency>" "<root-cause>"
       ```
   - If user confirms no friction occurred, omit `improvements.md` entirely.
   - **Test Matrix Verification Gate**: Đối soát từng `Test ID` trong Section 3 của plan.md, chạy test suite xác nhận pass và cập nhật `[x]` vào bảng trước khi hoàn tất.
   - **Evolution Link Invariant**: Staged improvements will be consumed by `/only-one-clean` and applied by `/only-one-evolve`.

---

## Guardrails

- **🛑 Strict Task Document Invariant (Zero walkthrough.md Creation)**: Each task folder must contain ONLY `concept.md`, `plan.md` (or `debug.md`), and optional `improvements.md`. Never generate a separate `walkthrough.md` file on disk. Present walkthrough results directly in the conversation response.
- **🛑 Strict Tech Skill & Rule Adherence**: Applied code must strictly adhere to active language/tech skills and repository rules. Agent MUST NOT write arbitrary code based on personal assumptions.
- **Enforce Reuse-First Verification**: Always inspect target file imports and utilize project shared utilities; never duplicate existing code.
- **Normalize Line Endings**: Convert target file line endings to LF before applying edits when running on Windows.
- **Verify Code Formatting**: Run repository format check before completing verification to prevent build and CI failures.
- Prioritize parsing ordered Section 2 file task blocks identically for `plan.md` and `debug.md`.
- Execute `Fast Test Command` per file before proceeding to the next.
- Maintain Beyoncé Rule at all times.
- **Strict Anti-Bloat Report Invariant**: Report must use Collapsible Hybrid schema with zero ASCII trees and no Next Steps section.
