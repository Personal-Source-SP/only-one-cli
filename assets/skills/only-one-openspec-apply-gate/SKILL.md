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
    - `state`, `contextFiles`, progress, pending tasks, dynamic instruction, and profile-required context.

## Stop conditions

4. Stop immediately when any of the following is true:
    - `state` is `blocked`
    - `actionContext` disallows implementation edits
    - Explicit approval evidence is absent

## Context validation

5. Read every path in `contextFiles`. Verify approved scope/allowlist, ordered tasks, risks, verification commands, and every required section declared by resolved apply instruction and active schema profile.

6. Stop for missing or conflicting information. Do not infer requirements, select a profile, or expand scope beyond `contextFiles` and resolved schema instructions.

## Output

After a successful gate, record:
- The ordered task list for the task loop
- The allowlist for GitNexus freshness gates
- The verification commands for integrated verification
