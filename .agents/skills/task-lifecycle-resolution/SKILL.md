---
name: task-lifecycle-resolution
description: Resolve and auto-archive completed tasks before running clean and maintenance workflows.
---

# Task Lifecycle Resolution

## Overview

Use this skill to scan task directories (`only-one/tasks/`), detect tasks marked with `status: done`, and execute the auto-archiving protocol before carrying out workspace cleanup or archive consolidation.

## Workflow

1. Scan `only-one/tasks/` for task folders containing `plan.md`.
2. Inspect frontmatter status:
   - If `status: done`: Trigger the archiving protocol to distill knowledge, update rules, and extract learning patterns.
   - If `status: in-progress` or `status: planned`: Explicitly preserve the folder and protect active work from deletion.
3. Log clean status reports distinguishing archived vs preserved tasks.
