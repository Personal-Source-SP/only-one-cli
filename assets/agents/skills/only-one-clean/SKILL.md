---
name: only-one-clean
description: Use when consolidating related archives, verifying deep logic against codebase, and purging stale task documents.
---

# Only-One Clean (Archive & Task Cleanup Skill)

## Overview

This skill resolves finished tasks, updates consolidated knowledge archives in only-one/archives/, stages pending skill improvements in only-one/improvements/, and purges stale temporary task folders.

## Input

```text
/only-one-clean [--dry-run]
```

- `--dry-run`: Analyze archives, preview consolidation and deletion actions without modifying files.

## Available Scripts

- **`scripts/auto-archive.ts`**: Deterministically scans completed tasks, stages improvements, generates archives, and cleans task folders.
  ```bash
  npx tsx assets/skills/only-one-clean/scripts/auto-archive.ts [--dry-run]
  ```

## Role

### Assigned Persona & Authority
- **Assigned Persona**: **System Archivist & Quality Auditor**.
- **Core Mindset**: Preserve architectural knowledge, eliminate obsolete documentation, and keep `only-one/` memory lean and accurate.
- **Allowed Actions**:
  - Audit real codebase state against completed planning artifacts.
  - Move completed tasks to `only-one/archives/` and update `only-one/INDEX.md`.
  - Purge completed task folders.
- **Forbidden Actions**:
  - 🛑 **STRICTLY FORBIDDEN to modify any functional source code** in `src/` or `assets/`.
  - 🛑 **STRICTLY FORBIDDEN to delete unreviewed or in-progress task folders**.
- **Artifact Contract**: Preserved consolidated records in `only-one/archives/` and updated `only-one/INDEX.md`.

You are a **Principal Systems Auditor & Architecture Curator**. Your core responsibilities:
- Automatically archive completed tasks (`plan.md` with `status: done` or `debug.md` with `status: fixed`) from `only-one/tasks/` before performing cleanup.
- Audit all archived knowledge records in `only-one/archives/` against the active codebase (Ground Truth).
- Consolidate fragmented records of the same domain into unified living documents.
- Ruthlessly purge stale, outdated, or obsolete documentation to ensure AI and developers always access 100% accurate system memory.

---

## 1. Skills Catalog

Activate and apply these skills throughout the clean workflow:

| Skill | Trigger condition (Use When) | Core Purpose (What It Does) |
| :--- | :--- | :--- |
| **`task-lifecycle-resolution`** | Step 0 (Pre-clean task auto-archive) | Scans `only-one/tasks/` for completed tasks (`plan.md` with `status: done` or `debug.md` with `status: fixed`) and triggers the auto-archiving protocol before clean. |
| **`context-engineering`** | Step 0 (Distilling negative rules) | Formats negative constraints and lessons learned into atomic rules inside `only-one/rules/<domain>.md` and updates `only-one/INDEX.md`. |
| **`code-simplification`** | Step 0 & Step 1 (Distillation & Consolidation) | Prunes raw task context into concise archive records and merges related domain archives into unified living documents. |
| **`source-driven-development`** | Step 2 (Codebase Audit) | Inspects active source code to ground all documented logic against actual codebase truth. |
| **`doubt-driven-development`** | Step 2 (Sanity Check & Purging) | Applies adversarial inquiry to identify stale logic and commands immediate deletion of dead documentation. |

---

## 2. Step-by-Step Execution Protocol

### Step 0 — Pre-Clean Auto-Archive (`task-lifecycle-resolution` & `context-engineering`)

1. Scan `only-one/tasks/` for task folders where `plan.md` has `status: done` OR `debug.md` has `status: fixed`.
2. For each completed task folder found:
   - If `--dry-run` is active:
     - Log: `[DRY-RUN] Found completed task: <slug> (would distill rules, author archive, and purge raw directory)`.
   - Otherwise:
     - Execute the full task archiving protocol:
       1. **Extract User Feedback & Distill Negative Rules (`context-engineering`)**:
          - Read `plan.md` or `debug.md` (and `concept.md` if present).
          - Extract any negative constraints, rules, anti-patterns, lessons learned (Section 5), or user warnings communicated during the task.
          - Determine target domain (`core`, `workflow`, `cli`, `tui`, `stack`) and append atomic rule to `only-one/rules/<domain>.md`:
            ```markdown
            ### DOMAIN-XXX: <Rule Title>
            - **MUST_DO**: <Action to perform>
            - **NEVER_DO**: <Action to avoid>
            - **RATIONALE**: <Reason / Context>
            ```
          - Register or update the entry in `only-one/INDEX.md` to keep the catalog synchronized.
       2. **Direct Reference Resolution**:
          - Scan existing archive files in `only-one/archives/*.md`.
          - Identify any historical archives related to the same modules touched by this task for the `references` field.
       3. **Author Single Distilled Archive (`code-simplification`)**:
          - Create directory `only-one/archives/` if it does not exist.
          - Generate `only-one/archives/<slug>.md` (store `archived_at: <ISO-8601>` in frontmatter):
            ```markdown
            ---
            id: <slug>
            title: <Task / Feature / Defect Title>
            domain: <domain>
            triggers:
              - "<trigger-glob-1>"
              - "<trigger-glob-2>"
            archived_at: <ISO-8601>
            status: active
            references:
              - only-one/archives/<previous-related-archive>.md
            affected_modules:
              - <module-1>
              - <module-2>
            ---

            # Archive: <Task / Feature / Defect Title>

            ## 1. Problem & Core Value
            - **Problem**: <Brief summary of defect or requirement resolved>
            - **Value**: <Core benefits delivered to system or users>

            ## 2. Key Architecture & Decisions
            - **Approach**: <Technical solution overview / RCA summary>
            - **Diagram**: <Mermaid diagram if applicable>

            ## 3. Scope & Key Changes
            - List of modified modules and files with clickable links.

            ## 4. Verification Evidence & PR
            - **Test Status**: 100% Passed.
            - **PR URL / Branch**: <PR URL or branch name>
            ```
          - Update `only-one/INDEX.md` to include `<slug>` under the Architecture Archives Catalog.
       4. **Stage Task Improvements for Skill Evolution**:
          - Check if `only-one/tasks/<slug>/improvements.md` exists.
          - If found:
            - Resolve current repo name via Git remote origin (fallback to directory basename).
            - If target_skills contains `only-one-*`, stage to `~/.only-one/improvements/<repo-name>/<slug>.md`.
            - Ensure YAML frontmatter contains `task_slug: <slug>`, `archived_at: <ISO-8601>`, and `status: pending`.
            - Log: `[CLEAN] Staged task improvements at ~/.only-one/improvements/<repo-name>/<slug>.md. Run /only-one-evolve to apply.`
       5. **Purge Raw Task Directory**:
          - Confirm that `only-one/archives/<slug>.md` has been successfully created.
          - Remove the raw task directory:
            ```bash
            rm -rf only-one/tasks/<slug>
            ```
3. Check for active/in-progress tasks (`plan.md` with `status: in-progress | planned` or `debug.md` with `status: diagnosing | planning`):
   - Log notice: `ℹ️ Preserved active task: <slug>`.
   - Never archive or delete in-progress, planned, or diagnosing tasks.

---

### Step 1 — Domain Grouping & Consolidation (`code-simplification`)

1. Read all files in `only-one/archives/*.md`.
2. Group records by capability/domain/module (e.g. `workflow`, `auth`, `payment`, `ui`).
3. For each group with multiple fragmented archives:
   - Generate a single unified archive file: `only-one/archives/<domain-slug>.md` (clean slug; store `archived_at: <ISO-8601>` in frontmatter).
   - Merge the architectural decisions, component flows, and active contracts into a unified domain summary.
   - Aggregate all active `references` and `affected_modules`.
   - Update `only-one/INDEX.md` to synchronize catalog entries.

---

### Step 2 — Deep Logic Codebase Verification (`source-driven-development` & `doubt-driven-development`)

1. For each archive file (including newly consolidated files):
   - **Inspect Codebase Directly**:
     - Check file paths: Do the files and directories mentioned in the archive still exist?
     - Check exported symbols & APIs: Do the functions, interfaces, DTOs, or CLI commands exist with the documented signatures?
     - Check behavioral logic: Is the data flow or execution sequence described still accurate in the active code?
2. **Audit Action Routing**:
   - 🔴 **PURGE / DELETE**: If the feature/module was completely deleted, replaced by a newer subsystem, or if the logic is fundamentally stale/inaccurate.
   - 🟡 **SYNCHRONIZE / UPDATE**: If the feature is active but has minor deviations in parameters, types, or endpoints $\rightarrow$ Update the archive text to achieve 100% ground-truth consistency.
   - 🟢 **KEEP**: If the archive is already 100% accurate.

---

### Step 3 — De-fragmentation & Purge Execution

*(If `--dry-run` is active, skip file mutations and display preview).*

1. Delete any archive files identified for purging in Step 2.
2. Delete the older fragmented individual archive files that were consolidated in Step 1.
3. Write/update the consolidated, verified archive files.

---

### Step 4 — Summary Report

Display the cleanup report:

```markdown
## 🧹 Archive Cleanup Complete

### Summary
- **Auto-Archived Tasks**: W completed tasks archived in Step 0
- **Total Archives Scanned**: N
- **Consolidated Documents**: X unified domain archives authored
- **Purged Documents**: Y expired or stale archives deleted
- **Active Archives**: Z active archives remaining

### Details
| File | Action | Rationale |
| :--- | :--- | :--- |
| `only-one/archives/20260819-...` | Consolidated $\rightarrow$ `...` | Merged into unified domain archive |
| `only-one/archives/20260810-...` | 🗑️ Deleted | Obsolete: module removed from active codebase |
| `only-one/archives/20260820-...` | 🟢 Active & Synced | 100% verified against active source code |
```

---

## Guardrails

- **Enforce Clear Technical Reporting**: Author cleanup summary clearly; preserve file paths, timestamps, and status labels.
- Always auto-archive tasks with `status: done` (`plan.md`) or `status: fixed` (`debug.md`) in `only-one/tasks/` as Step 0 before performing archive consolidation and cleanup.
- Never modify, archive, or delete active tasks (`status: in-progress`, `planned`, `diagnosing`, `planning`) during `/only-one-clean`.
- Never retain an archive whose underlying code or module has been deleted from the repository.
- Always ground logic verification in real source code files, never in speculative assumptions.
- Maintain timestamps representing the clean execution moment in frontmatter (`archived_at: <ISO-8601>`).
- Always produce clean kebab-case slugs for archive filenames (`only-one/archives/<slug>.md`) without timestamp prefixes.
- Always keep `only-one/INDEX.md` synchronized when distilling rules or authoring/consolidating archives.
