---
id: UC-WF-003
title: Apply Approved Implementation Plan
domain: workflow
status: draft
implemented_by: []
created_at: 2026-08-19
updated_at: 2026-08-19
---

## USE Implement changes from an approved plan.md file
## WHEN Developer runs `/only-one-apply [<plan-path>]` in chat or IDE

### Preconditions
- A `plan.md` file exists with `status: planned` or `status: in-progress`.

### Scenarios

#### Execute plan sequentially and generate walkthrough
- GIVEN an approved `plan.md` file
- WHEN developer executes `/only-one-apply [<plan-path>]`
- THEN the system updates frontmatter to `status: in-progress`
- AND the system implements each file change in the order defined in Section 3 using Section 4 as implementation guidance
- AND the system runs automated verification tests defined in Section 5
- AND the system generates `walkthrough.md`, updates `plan.md` frontmatter to `status: done` and sets `completed_at` to today's date.
