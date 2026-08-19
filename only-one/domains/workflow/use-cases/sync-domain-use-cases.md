---
id: UC-WF-001
title: Sync Domain Use Cases
domain: workflow
status: draft
implemented_by: []
created_at: 2026-08-19
updated_at: 2026-08-19
---

## USE Synchronize domain use cases and clean up completed tasks
## WHEN Developer runs `/only-one-sync <domain>` in chat or IDE

### Preconditions
- The `<domain>` argument is provided.
- The directory `only-one/domains/<domain>/` exists (or is created by the workflow).

### Scenarios

#### Synchronize use cases from completed tasks and codebase
- GIVEN a domain has completed tasks (`status: done`) in `only-one/domains/<domain>/tasks/` and code changes in the repository
- WHEN developer executes `/only-one-sync <domain>`
- THEN the system reads existing use cases, inspects completed tasks with `status: done`, and scans the codebase
- AND the system presents a Sync Report with classifications (`CHANGED`, `NEW`, `DELETED`, `IN_SYNC`) and lists completed tasks to clean up
- AND upon user confirmation, the system updates/creates use case files with timestamps (`created_at`, `updated_at`), updates `README.md`, and removes the consolidated completed task directories.

#### Preserve in-progress and planned tasks
- GIVEN a domain has tasks with `status: in-progress` or `status: planned` in `only-one/domains/<domain>/tasks/`
- WHEN developer executes `/only-one-sync <domain>`
- THEN the system skips these non-done task folders during use case extraction
- AND the system excludes these task folders from the cleanup list, preserving them intact in the workspace.

#### Missing domain argument
- GIVEN developer invokes `/only-one-sync` without specifying a domain
- WHEN the workflow starts
- THEN the system stops execution immediately and prompts the developer to select an available domain.
