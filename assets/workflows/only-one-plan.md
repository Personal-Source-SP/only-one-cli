---
description: Perform grounded code discovery and draft an approved planning artifact using only-one-plan-skill and GitNexus MCP.
---

Use skill `only-one-plan-skill` to investigate the codebase, resolve decision gates with the user, and write a durable plan using `gitnexus` MCP and source file verification.

## Input

```text
/only-one-plan <planning-goal-or-problem-description>
```

The prompt or message following `/only-one-plan` describes the goal, feature request, or problem to plan.

## Required behavior

1. Load and follow skill `only-one-plan-skill`.
2. Enforce planning-only execution boundary: inspect the project and write only the confirmed OpenSpec artifact or plan document (`docs/plans/<slug>.md`).
3. Never modify application code, Git state, configuration, indexes, or external systems.
4. Perform GitNexus-first code intelligence query for symbols, dependencies, call paths, and blast radius.
5. Verify all planning conclusions against actual source code files before documenting.
6. Ask the user (one question at a time, walking down the decision tree like `grill-me`) when evidence is missing or a choice materially affects scope, behavior, architecture, API, dependencies, data, performance, security, or reversibility (provide 2–4 options with recommendation and trade-offs). Explore codebase first if a question can be answered by code.
7. Justify minimum-impact changes by documenting expected files to modify, reused logic, and preserved areas.
8. Require explicit performance and security evidence/conclusions in the final output.
9. Output durable plan to OpenSpec change artifacts (if available) or `docs/plans/<slug>.md`.

If skill `only-one-plan-skill` or MCP `gitnexus` is unavailable, stop and tell the user to run `only-one init` or `only-one init mcp gitnexus`.
