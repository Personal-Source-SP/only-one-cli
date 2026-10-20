---
task_slug: init-tui-assets-sidebar
created_at: 2026-10-20T09:35:43.282Z
target_skills:
  - only-one-plan
---

# Task Improvements: init-tui-assets-sidebar

## 1. Observed Deficiencies
- **only-one-plan**: Invalid JSX layout props generated in plan diff (Text marginBottom instead of Box marginBottom in Ink)

## 2. Context & Root Cause
- Planning skill generated ink Text component with margin prop which only Box supports in ink

## 3. Desired Skill Guardrail / Checklist
- Validate Ink layout props against Ink component typings during planning
