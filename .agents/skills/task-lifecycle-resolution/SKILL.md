---
name: task-lifecycle-resolution
description: Resolve and auto-archive completed tasks before running clean and maintenance workflows.
---

# Task Lifecycle Resolution

## Overview

Use this skill to scan task directories (`only-one/tasks/`), detect tasks marked as completed (`plan.md` with `status: done` or `debug.md` with `status: fixed`), and execute the auto-archiving protocol before carrying out workspace cleanup or archive consolidation.

## Workflow

1. Scan `only-one/tasks/` for task folders containing either `plan.md` or `debug.md`.
2. Inspect frontmatter status:
   - If `plan.md` has `status: done` OR `debug.md` has `status: fixed`: Trigger the auto-archiving protocol to distill knowledge, extract negative rules into `only-one/rules.md`, generate archive record in `only-one/archives/`, and purge raw task directory.
   - If `plan.md` has `status: in-progress | planned` OR `debug.md` has `status: diagnosing | planning`: Explicitly preserve the folder and protect active work from deletion.
3. Log clean status reports distinguishing archived vs preserved tasks.
