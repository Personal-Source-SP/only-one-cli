---
id: UC-WF-002
title: Author Implementation Plan
domain: workflow
status: draft
implemented_by: []
created_at: 2026-08-19
updated_at: 2026-08-19
---

## USE Research codebase and author reviewable implementation plan
## WHEN Developer runs `/only-one-ag-plan <description>` in chat or IDE

### Preconditions
- The repository workspace is accessible.
- Negative rules and technology skills are loaded if present.

### Scenarios

#### Plan single-domain task
- GIVEN a feature or fix request belonging to a specific domain
- WHEN developer executes `/only-one-ag-plan <description>`
- THEN the system resolves the target domain and runs domain sync if use cases exist
- AND the system researches current code, evaluates design options, defines architecture and test cases
- AND the system saves a structured `plan.md` with `status: planned` at `only-one/domains/<domain>/tasks/<YYYY-MM-DD>_<slug>/plan.md` and requests user approval.

#### Plan cross-domain epic
- GIVEN a feature touching multiple domains
- WHEN developer executes `/only-one-ag-plan <description>`
- THEN the system saves `plan.md` with `status: planned` at `only-one/epics/<YYYY-MM-DD>_<slug>/plan.md` and lists affected domains.
