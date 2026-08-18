---
description: "Sync domain use cases from tasks (if present) and current codebase for a specific domain, then clean up consolidated tasks."
---

## Input

```text
/only-one-sync <domain>
```

- **`<domain>` (Required)**: The specific domain name to synchronize (e.g., `auth`, `billing`, `washing-machine`).
- **If no domain is provided**: Stop immediately. List available domains found under `only-one/domains/` and ask the user to specify a domain before proceeding. Batch syncing all domains at once is not supported.

## Role

You are a Domain Analyst. Your responsibility: analyze domain tasks (if any) and current codebase implementation, update or rewrite the domain use cases to reflect reality, and clean up consolidated task folders after user confirmation. Do not implement application features.

## Purpose

Use cases document business behavior and serve as the Single Source of Truth for domain logic. Over time, as tasks are completed and code changes, use cases may become outdated or task records may accumulate. This workflow consolidates changes into use cases and keeps the domain workspace clean and organized.

---

## Step 1 — Resolve target domain

1. **Validate domain argument**:
   - If `<domain>` argument is missing:
     - Scan `only-one/domains/` to find existing domain directories.
     - Display a prompt with the available domains:
       > "Please specify a domain to synchronize (e.g., `/only-one-sync <domain>`)."
       > "Available domains: `<domain1>`, `<domain2>`, ..."
     - Stop workflow execution immediately.
2. **Check domain directory**:
   - Verify if `only-one/domains/<domain>/` exists.
   - If not found: automatically create `only-one/domains/<domain>/use-cases/` and `only-one/domains/<domain>/tasks/` directories.
3. Proceed to analyze the target domain.

---

## Step 2 — Analyze domain

Execute the following 4 analysis steps in sequence:

### 2a. Read existing use cases

```bash
ls only-one/domains/<domain>/use-cases/*.md 2>/dev/null
```

Read every `.md` file found (skip `README.md`). For each, record:
- `id`, `title`, `status`, `USE`/`WHEN` statement, preconditions, and all scenarios (`GIVEN` / `WHEN` / `THEN`).

If no use case files exist, note: "No use cases yet for this domain."

### 2b. Scan and read domain tasks (Optional)

```bash
ls -d only-one/domains/<domain>/tasks/*/ 2>/dev/null
```

- **If task directories exist**:
  - Read `plan.md` and `walkthrough.md` files in each task folder (prioritizing tasks with `status: done` or recently completed tasks).
  - Extract: Business objectives, logic changes, new flows, scenarios, edge cases, and acceptance criteria that have been implemented.
  - Mark these task folders in the `Consolidated Tasks` list for cleanup after sync.
- **If NO tasks exist (empty directory or no tasks created yet)**:
  - Note: "No tasks found in domain."
  - Continue seamlessly to Step 2c without throwing errors or blocking execution.

### 2c. Scan codebase for domain behaviors

Search for behavioral entry points and business logic related directly to this domain in the source code:
- REST controllers, route handlers, GraphQL resolvers.
- Service methods, command/query handlers, event listeners, background job processors.
- Entities, DTOs, domain models, validation schemas.
- Unit and integration tests associated with the domain.

For each behavior found in code, derive:
- **Behavior in plain language** (What it actually does).
- **Actor** (Who triggers it or which system event initiates it).
- **Preconditions & Context** (Required state or setup).
- **Outcomes** (Success path, error handling, returned data/events).

### 2d. Classify & consolidate

Cross-reference findings from Tasks (if any) and the actual Codebase against Existing Use Cases. Assign each item a classification:

| Classification | Condition |
|---|---|
| `CHANGED` | Use case exists; code behavior or task logic has diverged from documented scenarios |
| `NEW` | Behavior found in tasks/code; no use case currently covers it |
| `DELETED` | Use case exists; behavior is no longer present in code / feature removed |
| `IN_SYNC` | Use case accurately reflects current code and task behavior |

Compile the list of `Tasks to Clean Up`: Path of task folders to be deleted after user confirmation.

---

## Step 3 — Present sync report

Present a structured sync report in **Vietnamese** (keep code identifiers, symbol names, and file paths in **English**).

### Report format

```markdown
## Sync Report

### Domain: <domain-name>

#### ✏️ CHANGED (<n>)
- <UC-ID> <Title> — <brief description of changes in code and tasks>

#### 🆕 NEW (<n>)
- Behavior: <description of new behavior found> (found in <file/symbol/task>)

#### 🗑️ DELETED (<n>)
- <UC-ID> <Title> — <reason: symbol/feature removed from codebase>

#### ✅ IN SYNC (<n>)
- <UC-ID>, <UC-ID>, ...

#### 🧹 TASKS TO CLEAN UP (<n>)
- only-one/domains/<domain>/tasks/<YYYY-MM-DD_slug>/
- ...
(Or display "None" if no task folders exist)
```

### Review Gate (User Confirmation)

Conclude the report with a clear confirmation question:
- **If there are tasks to clean up**:
  > **Bạn có muốn áp dụng các thay đổi use case và xóa danh sách task đã đồng bộ ở trên không?**
- **If there are no tasks**:
  > **Bạn có muốn áp dụng các thay đổi use case ở trên không?**

**STRICT RULE: Do not apply any file modifications or delete any task directories before the user explicitly confirms.**

---

## Step 4 — Apply sync (on user confirmation only)

Once the user confirms, execute changes in the following sequence:

### 4a. Process Use Cases

1. **DELETED use cases**:
   - Delete the corresponding use case file in `only-one/domains/<domain>/use-cases/<file>.md`.
2. **CHANGED use cases**:
   - Open the use case file.
   - Update preconditions and adjust/add scenarios (`GIVEN` / `WHEN` / `THEN`) to match current code and task logic.
   - Remove obsolete scenarios.
   - Update `updated_at: <YYYY-MM-DD>` in the frontmatter.
3. **NEW use cases**:
   - Determine the Title and assign the next sequential ID in the domain (e.g. `UC-<DOMAIN>-<NNN>`).
   - Create a new file at `only-one/domains/<domain>/use-cases/<kebab-case-title>.md`:

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

### 4b. Update Domain Index

Update `only-one/domains/<domain>/use-cases/README.md`:
- Add rows for NEW use cases.
- Remove rows for DELETED use cases.
- Update Titles and Statuses if changed.

### 4c. Clean up Consolidated Task Folders

- If the `TASKS TO CLEAN UP` list contains task folders:
  - Delete the consolidated task directories:
    ```bash
    rm -rf only-one/domains/<domain>/tasks/<folder_name>
    ```
- If no tasks were processed, skip this step.

---

## Step 5 — Report completion

Display a completion summary:

```markdown
## Sync Complete

### Domain: <domain-name>
- ✏️ Updated: <n> use cases
- 🆕 Created: <n> use cases
- 🗑️ Deleted: <n> use cases
- ✅ Already in sync: <n> use cases
- 🧹 Tasks cleaned up: <n> task folders

All business logic has been successfully synchronized into the Use Cases catalog.
```

Provide clickable links to all modified and created use case files.

---

## Guardrails

- A specific `<domain>` argument is mandatory when calling `/only-one-sync`. Never auto-sync all domains.
- Never apply file changes or delete tasks before explicit user confirmation in Step 3.
- Reading tasks is optional — if `tasks/` is empty or missing, continue sync seamlessly using codebase analysis.
- Only delete task directories after their logic has been fully consolidated into `use-cases/` and approved by the user.
- Do not modify application source code (read-only analysis).
- Write report descriptions in Vietnamese for user clarity; keep all identifiers, file paths, and code symbols in English.
- Keep use case content focused on business behavior (`GIVEN` / `WHEN` / `THEN`), avoiding internal technical details (e.g., local variables, internal SQL queries).
