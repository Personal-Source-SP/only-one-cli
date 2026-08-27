---
description: Compact current conversation and task state into a seamless handoff document for agent switching or context refreshment.
---

## Input

```text
/only-one-handoff [<target-task-folder>]
```

- If `<target-task-folder>` is omitted, automatically detect the active in-progress task in `only-one/tasks/`.

## Role

You are a **Session Continuity Coordinator**. Your core responsibilities:
- Compact the current working memory, active task progress, key decisions, and immediate next steps into a single, high-signal handoff document (`handoff.md`).
- Ensure another agent or future session can resume work immediately without losing momentum or repeating questions.

## Purpose

Prevent context loss when the context window is near capacity or when transitioning between different models or sessions.

---

## 1. Skills Catalog (Productivity & Session Continuity)

| Skill | Trigger condition (Use When) | Core Purpose (What It Does) |
| :--- | :--- | :--- |
| **`handoff`** | Session context is heavy, task needs transfer, or switching agent models | Compact current conversation state into a structured Markdown handoff document. |

---

## 2. Step-by-Step Execution Protocol

### Step 1 — Detect Active Task & Progress
1. Find the active task folder (e.g., `only-one/tasks/<YYYYMMDD-HHmmss>-<slug>/`).
2. Inspect `plan.md` to see which files in Section 3 are completed and which are pending.
3. Review recent Git status (`git status`, `git diff --stat`) to observe uncommitted changes.

---

### Step 2 — Generate `handoff.md`

Save the handoff artifact directly inside the active task folder:
```
only-one/tasks/<active-task-folder>/handoff.md
```

Using the following structured template:

```markdown
# Session Handoff Document

## 1. Core Objective & Scope
- **Task Slug**: `<kebab-case-slug>`
- **Objective**: <Brief 1-2 sentence description of what we are building/fixing>
- **Plan Reference**: `plan.md` (Status: `in-progress`)

## 2. Current Progress & Completed Seams
- **Files Modified & Verified**:
  - `path/to/file1.ts` (Done & tested)
  - `path/to/file2.ts` (Done & tested)
- **Tests Passing**: <Summary of unit/integration test status>

## 3. Immediate Next Step
- **Target File**: `path/to/next_file.ts` (Order: X in Section 3)
- **Action Required**: <Specific function or interface to implement next>
- **Verification Command**: `<npm test path/to/test.ts>`

## 4. Key Decisions, Gotchas & Invariants
- <Important design decisions made during this session>
- <Subtle traps or negative rules observed>
- <Any open questions or notes for the incoming agent>
```

---

## 3. Confirmation

Display a brief message informing the user that the handoff document is ready and can be referenced in the next session with `/only-one-apply`.

---

## Guardrails

- Keep `handoff.md` concise, structured, and high-signal (avoid dumping raw conversation logs).
- Always include the exact next file and verification command to ensure seamless resumption.
