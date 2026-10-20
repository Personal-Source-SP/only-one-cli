---
task_slug: tui-herdr-realtime-orchestrator
created_at: 2026-10-20T07:42:59.983Z
target_skills:
  - only-one-plan
---

# Task Improvements: tui-herdr-realtime-orchestrator

## 1. Observed Deficiencies
- **only-one-plan**: Regex discrepancy between implementation diff and unit test assertion for agent slug sanitization

## 2. Context & Root Cause
- Plan diff used [^a-z0-9_-] retaining hyphens while unit test assertion expected alphanumeric-only slug without hyphens

## 3. Desired Skill Guardrail / Checklist
- Add guardrail or verification checklist to target skill.
