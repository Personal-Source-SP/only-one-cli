---
description: "Check use cases against current codebase and sync: update changed, add new, mark deleted."
---

## Input

```text
/only-one-sync [<domain>]
```

- **With domain**: sync use cases for that specific domain only.
- **Without domain**: ask if the user wants to sync all domains; if confirmed, sync all.

## Role

You are a Domain Analyst. Your responsibility: compare the living use case catalog against the current codebase, identify what has drifted, and bring both sides into sync. Do not implement application features.

## Purpose

Use cases document business behavior. Over time, code changes without updating use cases, or use cases describe behaviors that no longer exist. This workflow detects and resolves that drift.

---

## Step 1 — Resolve target domains

**If a domain name is provided:**
1. Check if `only-one/domains/<domain>/` exists.
2. If not found: automatically create `only-one/domains/<domain>/use-cases/` directory structure.
3. Proceed with that single domain.

**If no domain is provided:**
1. Check if `only-one/domains/` exists and contains domain directories.
2. If `only-one/domains/` does not exist or has no domain subdirectories:
   - Ask the user:
     > "Chưa có domain nào trong `only-one/domains/`. Bạn muốn tạo và sync domain nào?"
   - Once the user specifies a domain, create `only-one/domains/<domain>/use-cases/` and proceed with that domain.
3. If `only-one/domains/` contains domain subdirectories:
   - Ask the user:
     > "Không có domain nào được chỉ định. Bạn có muốn sync tất cả domains không?"
   - If **yes**: collect all folders under `only-one/domains/` as target domains.
   - If **no**: ask which domain to sync and wait for selection.

---

## Step 2 — Analyze each domain

Repeat this process for every target domain.

### 2a. Read existing use cases

```bash
ls only-one/domains/<domain>/use-cases/*.md 2>/dev/null
```

Read every `.md` file found (skip `README.md`). For each, record:
- `id`, `title`, `status`, `USE`/`WHEN` statement, preconditions, all scenarios.

If no use case files exist, note: "No use cases yet for this domain."

### 2b. Scan codebase for domain behaviors

Search for behavioral entry points related to this domain:
- REST controllers, route handlers, service methods, command handlers, event listeners.
- Look for the domain name as a keyword in file paths and class names first.
- Then read relevant files to understand what each entry point does.

For each entry point found, derive:
- **What it does** (the behavior in plain language).
- **Who calls it** (actor or system).
- **When it is triggered** (precondition or context).
- **Outcome** (success and failure paths).

Keep search bounded to the domain scope. Do not read unrelated modules.

### 2c. Classify

Compare use cases against codebase findings. Assign each item a classification:

| Classification | Condition |
|---|---|
| `CHANGED` | Use case exists; code behavior has diverged from documented scenarios |
| `NEW` | Behavior found in code; no use case covers it |
| `DELETED` | Use case exists; behavior no longer present in code |
| `IN_SYNC` | Use case accurately reflects current code behavior |

---

## Step 3 — Present sync report

After analyzing all target domains, present a combined report in **Vietnamese**. Keep code identifiers and file paths in **English**.

### Report format

```
## Sync Report

### Domain: <domain-name>

#### ✏️ CHANGED (<n>)
- <UC-ID> <Title> — <mô tả ngắn gọn điều gì đã thay đổi trong code>
  ...

#### 🆕 NEW (<n>)
- Behavior: <mô tả behavior mới phát hiện trong code> (found in <file/symbol>)
  ...

#### 🗑️ DELETED (<n>)
- <UC-ID> <Title> — <mô tả lý do: symbol/file đã bị xoá hoặc đổi tên>
  ...

#### ✅ IN SYNC (<n>)
- <UC-ID>, <UC-ID>, ...
```

End the report with:
> **Bạn có muốn áp dụng các thay đổi trên không?**

Do not apply any changes before the user confirms.

---

## Step 4 — Apply sync (on user confirmation only)

Process each domain's classified items in this order: DELETED → CHANGED → NEW.

### DELETED use cases

1. Delete the use case file.
2. Git history preserves the full content — no need to keep the file.

### CHANGED use cases

1. Open the use case file.
2. Update scenarios to reflect current code behavior:
   - Add new scenarios that exist in code but were missing.
   - Modify scenarios where the behavior has changed.
   - Remove scenarios that no longer apply — no need to comment them out.
3. Update preconditions if they have changed.
4. Update `updated_at` to today's date.

### NEW use cases

1. Determine the correct use case title from the behavior description.
2. Assign the next sequential ID in the domain (read existing IDs, pick next number).
3. Create the file at `only-one/domains/<domain>/use-cases/<kebab-case-title>.md`:

```markdown
---
id: UC-<DOMAIN-ABBR>-<NNN>
title: <Title in English>
domain: <domain>
status: draft
implemented_by: []
updated_at: <YYYY-MM-DD>
---

## USE <action — verb phrase>
## WHEN <actor and context>

### Preconditions
- <precondition>

### Scenarios

#### <Scenario name>
- GIVEN <state or setup>
- WHEN <action taken>
- THEN <expected result>
- AND <additional outcome if needed>
```

### Update domain index

After processing all items for a domain, update `only-one/domains/<domain>/use-cases/README.md`:
- Add rows for NEW use cases.
- Remove rows for DELETED use cases.
- If `README.md` does not exist, create it:

```markdown
# <Domain Name> — Use Cases

| ID | Title | Status |
|---|---|---|
| UC-<ABBR>-<NNN> | <Title> | draft |
```

---

## Step 5 — Report completion

After applying all changes, display a brief summary:

```
## Sync Complete

### Domain: <domain-name>
- ✏️ Updated: <n> use cases
- 🆕 Created: <n> use cases
- 🗑️ Deleted: <n> use cases
- ✅ Already in sync: <n> use cases
```

Link each modified file. State only what changed — do not repeat file contents.

---

## Guardrails

- Do not apply any changes before the user confirms in Step 3.
- Do not delete use case files — only set `status: deprecated` if preferred or delete as per team convention.
- Do not modify application source code. Only read it.
- Do not create use case files outside `only-one/domains/`.
- Keep use case content behavior-focused. Do not copy implementation details (variable names, SQL, internal field names) into use case files.
- Write report and descriptions in Vietnamese; keep code identifiers and file paths in English.
- If a behavior is ambiguous — could belong to multiple use cases or no clear mapping exists — note it in the report and ask the user before acting.
