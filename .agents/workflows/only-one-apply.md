---
description: "Implement tasks from an approved plan.md or debug.md file by parsing machine-readable file task blocks and applying changes in dependency order."
---

## Input

```text
/only-one-apply [<task-folder> | <plan-path> | <debug-path>]
```

- **With `<task-folder>`, `<plan-path>`, or `<debug-path>`**: use the given plan/debug file (e.g., `only-one/tasks/20260819-142500-soft-delete/plan.md` or `only-one/tasks/20260917-100000-debug-bug/debug.md`) directly. If a task folder is given, locate `plan.md` or `debug.md` within it (prefer `in-progress` > `planned`/`planning`).
- **Without path**: search `only-one/tasks/` for active tasks:
  ```bash
  grep -rlE "status: in-progress" only-one/tasks/ --include="plan.md" --include="debug.md" 2>/dev/null
  grep -rlE "status: (planned|planning)" only-one/tasks/ --include="plan.md" --include="debug.md" 2>/dev/null
  ```
  - Prefer `in-progress` over `planned`/`planning`.
  - If multiple found, display the list and ask the user to select.
  - If none found, report: "No active plan or debug task found in only-one/tasks/." and stop.

## Role

You are a **Senior Software Engineer**. Your core responsibilities:
- Fast-path ingest ordered **Section 2 File Changes** task blocks from both `plan.md` and `debug.md`.
- Implement changes one file at a time from each task block's unified diff, respecting `Depends On` ordering.
- Apply execution and quality disciplines (`incremental-implementation`, `test-driven-development`, `code-simplification`, `diagnosing-bugs`).
- Run the targeted `Fast Test Command` immediately after modifying each file to maintain rapid feedback loops.
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

### Step 1 — Locate and read the plan or debug document

**If a path or task folder is provided:**
1. If target is a file path (`plan.md` or `debug.md`), read it directly.
2. If target is a task folder, check for `plan.md` or `debug.md`. If both exist, prioritize `in-progress` $\rightarrow$ `planned`/`planning`.
3. If neither exists, report error and stop.

**If no path is provided:**
```bash
grep -rlE "status: in-progress" only-one/tasks/ --include="plan.md" --include="debug.md" 2>/dev/null
grep -rlE "status: (planned|planning)" only-one/tasks/ --include="plan.md" --include="debug.md" 2>/dev/null
```
- Prefer `in-progress` over `planned`/`planning`.
- If multiple found, display the list and ask the user to select.
- If none found, report: "No active plan or debug task found in only-one/tasks/." and stop.

---

### Step 1b — Load rules and skills (`context-engineering`)

1. **Load Negative Rules (Mandatory Constraints)**:
   Read `only-one/rules.md` if present. Strictly obey all negative constraints.
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

### Step 3 — Ingest Source Structure & Parse File Tasks

1. **Review Source Structure Changes**:
   - For `plan.md`, ingest Section 1 Directory Structure Changes.
   - For `debug.md`, ingest Section 1 Diagnosis to understand the proven root cause and fix constraints.
2. **Parse executable tasks**:
   - For `plan.md` or `debug.md`, jump to **Section 2 File Changes** and read ordered headings `### <order>. [<ACTION>] <path>`.
   - Require each task block to contain `Status`, `Context`, `Target Symbols / AST Seams`, `Invariants`, `Depends On`, and `Fast Test Command` before its checklist and unified diff.
   - Treat heading order as execution order and `Depends On` as blocking edges.
   - Skip tasks marked `[x]`; identify the first `[ ]` or `[/]` task.

---

### Step 4 — Apply File Changes Incrementally (`incremental-implementation`)

For each pending file task block:
1. Verify that all prerequisite files (`Depends On`) have been successfully applied and verified (`[x]`).
2. Mark the task's `Status` as `[/]` (in-progress) in the active document (`plan.md` or `debug.md`).
3. **Step 4a — Pre-apply Context, Existing Imports & Language Skill Compliance Gate**:
   - Read the target file (`view_file`) to inspect its current imports, shared utilities, and surrounding code patterns.
   - Verify that existing project helpers/hooks are properly imported and utilized (Reuse-First Invariant).
   - ❌ **Strict Anti-Reinvention Check**: Do NOT write inline helper logic or duplicate functions if a shared project utility already exists.
   - 🛑 **Strict Language Skill & Rule Adherence Gate**:
     - Code modification MUST strictly follow conventions defined in active language/tech skills (Step 1b) and `only-one/rules.md`.
     - ❌ **Anti-Agent-Drift**: DO NOT code arbitrarily based on agent habits or unverified training defaults. Adhere 100% to project typing, naming, and error handling standards.
4. **Step 4b — Ponytail Revalidation Before Edit**:
   - Re-run the checklist against the current file for stale-plan drift.
   - On material conflict, do not edit. Emit `Ponytail Plan Conflict`, report completed rows, and stop before edit.
5. **Step 4c — Apply Code Modification (Diff Application)**:
   - Use the Unified Diff inside the current Section 2 task block.
   - Apply the modification precisely by replacing the deleted lines (`-`) with added lines (`+`).
6. **Step 4d — Fast Test Command**:
   - Run the task's **`Fast Test Command`** immediately:
     - If test passes: mark task `Status` as `[x]` (done) in the document and proceed to next row.
     - If test fails: activate `diagnosing-bugs` (Red Feedback Loop $\rightarrow$ Instrument $\rightarrow$ Fix).

---

### Step 5 — Final Comprehensive Verification & In-Chat Reporting

1. Run the full repository test and lint commands:
   ```bash
   npm test
   npm run lint
   ```
2. **Update Document Verification Evidence & Completion**:
   - Update Section 3 Verification of `plan.md` or `debug.md` by marking verified test items with `[x]` and appending concrete test execution evidence (e.g., `PASS - X tests passed`).
   - Update document frontmatter:
   ```yaml
   status: done   # (hoặc status: fixed cho debug.md)
   completed_at: <YYYY-MM-DD>
   ```
3. **In-Chat Walkthrough Presentation (Zero walkthrough.md File Creation)**:
   - Output a clean, structured walkthrough summary directly in the chat response.
   - ❌ **Strict No-Extra-File Invariant**: Do NOT create a separate `walkthrough.md` file on disk.

---

## Guardrails

- **🛑 Strict Task Document Invariant (Zero walkthrough.md Creation)**: Each task folder must contain ONLY `concept.md` and `plan.md` (or `debug.md`). Never generate a separate `walkthrough.md` file on disk. Present walkthrough results directly in the conversation response.
- **🛑 Strict Tech Skill & Rule Adherence**: Applied code must strictly adhere to active language/tech skills and repository rules. Agent MUST NOT write arbitrary code based on personal assumptions.
- **Enforce Reuse-First Verification**: Always inspect target file imports and utilize project shared utilities; never duplicate existing code.
- Prioritize parsing ordered Section 2 file task blocks identically for `plan.md` and `debug.md`.
- Execute `Fast Test Command` per file before proceeding to the next.
- Maintain Beyoncé Rule at all times.
