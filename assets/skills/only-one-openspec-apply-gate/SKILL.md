---
name: only-one-openspec-apply-gate
description: Resolve, apply, and validate an OpenSpec change before implementation begins. Reads contextFiles, verifies required plan artifacts are present, and enforces stop conditions on missing or conflicting information. Use at the start of implement workflows (BE and FE).
---

Run this gate immediately after dependency preflight, before any worktree setup or implementation work.

## Resolution

1. Resolve `<name>` using `openspec-apply-change`. If ambiguous, run `openspec list --json` and ask the user to select.

## Status and instruction read

2. Run `openspec status --change "<name>" --json`. Read:
   - `schemaName`, `planningHome`, `changeRoot`, `actionContext`
   - Dynamic artifact paths — do not assume repo-local paths or fixed artifact names.
3. Run `openspec instructions apply --change "<name>" --json`. Read:
   - `state`, `contextFiles`, progress, pending tasks, and dynamic instruction.

## Stop conditions

4. Stop immediately when any of the following is true:
   - `state` is `blocked`
   - `actionContext` disallows implementation edits
   - Explicit approval evidence is absent

## Context validation

5. Read every path in `contextFiles`. Verify the following are present and consistent:
   - Approved scope and allowlist
   - Task list (ordered)
   - Risks and verification commands
   - **BE additionally requires:** API contract, schema changes, task dependencies
   - **FE additionally requires:** Directory structure plan (`[NEW]`/`[IMPROVE]`/`[WIRE]`/`[EXISTING]` per file), component inventory (`[USE]`/`[EXTEND]`/`[NEW]` per component), canonical ref path and summary

6. Stop for missing or conflicting information. Do not infer requirements or expand scope beyond what is documented in `contextFiles`.

## Output

After a successful gate, record:
- The ordered task list for the task loop
- The allowlist for GitNexus freshness gates
- The verification commands for integrated verification
