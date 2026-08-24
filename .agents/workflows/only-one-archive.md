---
description: "Distill completed tasks into concise single-file archives, sync rules, and clean task folders."
---

## Input

```text
/only-one-archive [<task-folder> | <slug> | --all]
```

- **With `<task-folder>`** (e.g., `only-one/tasks/20260819-150535-workflow-only-one-intranet`): Archive the specified task folder.
- **With `<slug>`**: Find matching task folder in `only-one/tasks/*-<slug>/` and archive it.
- **With `--all`**: Archive all task folders in `only-one/tasks/` where `plan.md` has `status: done`.
- **Without arguments**: Search `only-one/tasks/` for folders with `status: done`. If multiple, list and prompt user to select. If none, report error and stop.

## Role

You are a **Software Knowledge & Release Architect**. Your core responsibilities:
- Distill completed task folders into concise, living system knowledge records (`only-one/archives/<timestamp>-<slug>.md`).
- Extract user constraints, warnings, and lessons learned into `only-one/rules.md`.
- Extract and categorize technical English structures and expressions into `only-one/learn/<topic>.md`.
- Ensure clean workspace hygiene by removing temporary raw task directories while preserving permanent architectural context and audit links.

---

## 1. Skills Catalog

Activate and apply these skills throughout the archiving workflow:

| Skill | Trigger condition (Use When) | Core Purpose (What It Does) |
| :--- | :--- | :--- |
| **`spec-driven-development`** | Step 4 (Authoring archive markdown) | Consolidates Problem Statement, Architecture Decisions, and Test Evidence into a structured single-file specification (`only-one/archives/<timestamp>-<slug>.md`). |
| **`code-simplification`** | Step 4 (Distillation) | Prunes transient code diffs and keeps document concise (< 50-100 lines) for optimal agent token efficiency. |
| **`context-engineering`** | Step 2 (Distilling rules) | Formats negative constraints and lessons learned into high-signal `[NEVER]` / `[AVOID]` rules inside `only-one/rules.md`. |
| **`english-learning-extraction`** | Step 2b (Distilling learning notes) | Scans task history, extracts 2–5 high-value technical English expressions, and appends them to thematic topics in `only-one/learn/` with Vietnamese translations. |

---

## 2. Step-by-Step Execution Protocol

### Step 1 — Task Resolution & Validation

1. Identify target task folder(s) in `only-one/tasks/`.
2. Check `plan.md` in each target folder:
   - Verify `status: done`. If `status` is `planned` or `in-progress`, warn the user:
     > *"⚠️ Task `<slug>` is not marked done. Do you want to force archive?"*
     Proceed only upon explicit user confirmation.
3. Verify that `walkthrough.md` exists in the task folder.

---

### Step 2 — Extract User Feedback & Distill Negative Rules (`context-engineering`)

1. Read `walkthrough.md` (specifically Section 4: *User Constraints & Lessons Learned*) and `plan.md`.
2. Extract any negative constraints, rules, anti-patterns, or user warnings communicated during the task.
3. Open or create `only-one/rules.md`.
4. Append new negative rules formatted as:
   ```markdown
   - **[NEVER]** <Action to avoid> — <Reason / Context>
   - **[AVOID]** <Anti-pattern to avoid> — <Reason / Context>
   ```
   *(Ensure deduplication against existing rules).*

---

### Step 2b — Extract & Distill Technical English Learning (`english-learning-extraction`)

1. Review the task's conversation history, `concept.md`, `plan.md`, and `walkthrough.md`.
2. Extract 2–5 high-signal technical English patterns (grammar structures, professional idioms, technical expressions) used during the task.
3. Identify the matching standard topic file in `only-one/learn/`:
   - `architecture-and-design.md`
   - `debugging-and-troubleshooting.md`
   - `code-review-and-refactoring.md`
   - `workflow-and-automation.md`
   - `general-engineering.md` (fallback)
4. Check for existing entries in the target file to avoid duplication.
5. Append new entries following the standard schema:
   ```markdown
   ### N. <Grammar Pattern or Idiomatic Expression>
   - **Meaning (VI)**: <Giải nghĩa tiếng Việt ngắn gọn, chính xác>
   - **Grammar / Usage**: `<Syntax breakdown>`
   - **Engineering Example**:
     > *"<Real-world example sentence in software context>"*
   - **Origin Task**: `<timestamp>-<slug>`
   ```

---

### Step 3 — Direct Reference Resolution

1. Scan existing archive files in `only-one/archives/*.md`.
2. Identify any historical archives related to the same modules, services, or workflows touched by this task.
3. Prepare a list of relative markdown links for the `references` frontmatter field.

---

### Step 4 — Author Single Distilled Archive (`spec-driven-development` & `code-simplification`)

1. Create directory `only-one/archives/` if it does not exist.
2. Generate target file: `only-one/archives/<timestamp>-<slug>.md` using the task's timestamp prefix.
3. Structure the distilled archive:

````markdown
---
id: <timestamp>-<slug>
title: <Task Title>
archived_at: <YYYY-MM-DD>
status: active
references:
  - only-one/archives/<previous-related-archive>.md
affected_modules:
  - <module-1>
  - <module-2>
---

# Archive: <Task Title>

## 1. Problem & Core Value
- **Problem**: <Concise summary of problem solved>
- **Value**: <Primary benefit to system/users>

## 2. Key Architecture & Decisions
- **Approach**: <High-level technical solution>
- **Diagram** (if applicable):
```mermaid
flowchart TD
    ...
```

## 3. Scope & Key Changes
- Modified components and files list (clickable links).

## 4. Verification Evidence & PR
- **Test Status**: 100% Passed.
- **PR URL**: <PR link or branch name>
````

---

### Step 5 — Purge Raw Task Directory

1. Confirm that `only-one/archives/<timestamp>-<slug>.md` has been successfully created.
2. Remove the raw task directory:
   ```bash
   rm -rf only-one/tasks/<timestamp>-<slug>
   ```

---

### Step 6 — Completion Summary

Display the archive completion report:

```markdown
## 📦 Task Archive Complete

- **Archived Record**: `only-one/archives/<timestamp>-<slug>.md` (status: active)
- **Rules Updated**: `only-one/rules.md` (N rules synced)
- **Learning Notes Synced**: `only-one/learn/<topic>.md` (+N patterns synced)
- **Cleaned Task Folder**: `only-one/tasks/<timestamp>-<slug>/` (deleted)
```

---

## Guardrails

- Never delete a task directory before confirming the archive markdown file has been written.
- Ensure distilled archive documents remain concise (< 100 lines) by omitting full raw code diffs.
- Always preserve `only-one/rules.md` at root and avoid creating nested rule directories.
- Always extract and record high-value technical English patterns into `only-one/learn/<topic>.md` with Vietnamese explanations before purging task directories.
- Avoid adding trivial everyday vocabulary to `only-one/learn/`; focus strictly on professional engineering expressions, compound terms, and sentence structures.
