---
description: "Check use cases against current codebase and sync: update changed, add new, mark deleted in HTML format."
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
ls only-one/domains/<domain>/use-cases/*.html 2>/dev/null
```

Read every `.html` file found (skip `index.html` or `README.html`). For each, record:
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

1. Delete the use case file or set `<meta name="status" content="deprecated">`.
2. Git history preserves the full content.

### CHANGED use cases

1. Open the use case file (`.html`).
2. Update scenarios to reflect current code behavior:
   - Add new scenarios that exist in code but were missing.
   - Modify scenarios where the behavior has changed.
   - Remove scenarios that no longer apply.
3. Update preconditions if they have changed.
4. Update `<meta name="updated_at" content="<YYYY-MM-DD>">`.

### NEW use cases

1. Determine the correct use case title from the behavior description.
2. Assign the next sequential ID in the domain (read existing IDs, pick next number).
3. Create the file at `only-one/domains/<domain>/use-cases/<kebab-case-title>.html`:

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="id" content="UC-<DOMAIN-ABBR>-<NNN>">
  <meta name="title" content="<Title in English>">
  <meta name="domain" content="<domain>">
  <meta name="status" content="draft">
  <meta name="updated_at" content="<YYYY-MM-DD>">
  <title>UC-<DOMAIN-ABBR>-<NNN>: <Title in English></title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem 1rem; color: #1e293b; }
    h1, h2, h3, h4 { color: #0f172a; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.75rem 1rem; margin-bottom: 1.5rem; font-size: 0.9rem; }
    .scenario { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 1rem; margin: 1rem 0; border-radius: 0 4px 4px 0; }
    ul { padding-left: 1.5rem; }
  </style>
</head>
<body>
  <div class="meta-box">
    <strong>ID:</strong> UC-<DOMAIN-ABBR>-<NNN> | <strong>Domain:</strong> <domain> | <strong>Status:</strong> draft | <strong>Updated:</strong> <YYYY-MM-DD>
  </div>

  <h1><Title in English></h1>

  <h2>USE &lt;action — verb phrase&gt;</h2>
  <h2>WHEN &lt;actor and context&gt;</h2>

  <h3>Preconditions</h3>
  <ul>
    <li>&lt;precondition&gt;</li>
  </ul>

  <h3>Scenarios</h3>
  <div class="scenario">
    <h4>&lt;Scenario name&gt;</h4>
    <ul>
      <li><strong>GIVEN</strong> &lt;state or setup&gt;</li>
      <li><strong>WHEN</strong> &lt;action taken&gt;</li>
      <li><strong>THEN</strong> &lt;expected result&gt;</li>
      <li><strong>AND</strong> &lt;additional outcome if needed&gt;</li>
    </ul>
  </div>
</body>
</html>
```

### Update domain index

After processing all items for a domain, update `only-one/domains/<domain>/use-cases/index.html` (or `README.md`):
- Add rows for NEW use cases.
- Remove rows for DELETED use cases.

---

## Step 5 — Report completion

After applying all changes, display a brief summary:

```
## Sync Complete

### Domain: <domain-name>
- ✏️ Updated: <n> use cases
- 🆕 Created: <n> use cases
- 🗑️ Deprecated: <n> use cases
- ✅ Already in sync: <n> use cases
```

Link each modified file. State only what changed — do not repeat file contents.

---

## Guardrails

- Do not apply any changes before the user confirms in Step 3.
- Do not modify application source code. Only read it.
- Do not create use case files outside `only-one/domains/`.
- Keep use case content behavior-focused.
- Write report and descriptions in Vietnamese; keep code identifiers and file paths in English.
