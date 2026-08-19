---
id: UC-WF-004
title: Install Workflow Assets to Agents
domain: workflow
status: draft
implemented_by: []
created_at: 2026-08-19
updated_at: 2026-08-19
---

## USE Install selected workflow markdown files into target IDE/Agent configurations
## WHEN User runs `only-one workflow` CLI command

### Preconditions
- Project directory is initialized or selected.
- Target agent tools (e.g. Antigravity, Claude, Copilot) are selected.

### Scenarios

#### Install workflows with target prompt
- GIVEN a project directory
- WHEN user executes `only-one workflow`
- THEN the CLI prompts user to select target IDEs/Tools first, then prompts for workflows to install
- AND the CLI copies workflow markdown assets into the respective target directories (e.g. `.agents/workflows/`) without overwriting unless confirmed.
