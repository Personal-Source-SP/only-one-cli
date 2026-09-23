---
status: done
slug: no-sleep-execution-rule
started_at: 2026-09-23
completed_at: 2026-09-23
pr_url: ~
branch: ~
---

# Plan: No-Sleep / No Busy-Wait Execution Rule

## Section 1. Current State

- `assets/rules/` contains 3 rule files (`01-context-and-tools.md`, `02-next-architecture-stack.md`, `02-nest-architecture-stack.md`) all with `alwaysApply: true` frontmatter and MUST/SHOULD imperative style.
- `assets/rules/index.ts` exports `RULES: RuleManifest[]` — each entry has `id`, `version`, `description`, `sourceFile`, `supportedTargets`, and optional `requiredSkills`.
- **No rule currently prohibits `sleep` commands or busy-wait loops.** Agents default to shell scripting convention of `sleep N && check` loops when waiting, causing unbounded polling.
- **Invariants to preserve**: frontmatter schema (`alwaysApply: true`), import aliases (`@/constants/allowed-tools.js`, `../types.js`), `RULES` array append-only (no reordering existing entries), `RuleManifest` interface shape.

## Section 2. Technical Contracts & AST Seams

**No new types introduced.** Reuses existing `RuleManifest` interface from `assets/types.ts` and `AllowedToolId` enum from `src/constants/allowed-tools.ts`.

**AST Seams:**
- `assets/rules/index.ts` → `RULES` array literal: append new object literal at end of array.
- `assets/rules/03-execution-terminal.md` → new file, no callers; consumed at runtime by CLI install logic that reads `sourceFile` field from manifest.

**Codex target decision:** `AllowedToolId.Codex` exists in the enum and `ALLOWED_TOOL_IDS` constant but is absent from all 3 existing rule entries. Concept specified Antigravity + Claude + Cursor only — **match existing pattern, exclude Codex.**

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes

```text
assets/rules/
├── 01-context-and-tools.md          # unchanged
├── 02-nest-architecture-stack.md    # unchanged
├── 02-next-architecture-stack.md    # unchanged
├── [NEW] 03-execution-terminal.md   # No-Sleep / No Busy-Wait rule
└── [MODIFY] index.ts                # register new rule entry
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[NEW]` | `assets/rules/03-execution-terminal.md` | N/A (markdown content) | None | `cat assets/rules/03-execution-terminal.md` |
| **2** | `[x]` | `[MODIFY]` | `assets/rules/index.ts` | `RULES` array literal | Order 1 | `npx tsc --noEmit` |

---

### 1. `[NEW]` `assets/rules/03-execution-terminal.md`

> **Action**: Create rule file banning `sleep` commands and busy-wait polling loops, with 4 approved alternative patterns.

**Ponytail checklist**
- [x] Required by acceptance criteria (concept.md §1 Goal).
- [x] Existing rules searched — no sleep-related content in `01-`, `02-` files or `.agents/rules/`.
- [x] No duplicate logic — this is net-new behavioral constraint.
- [x] Minimum content: prohibition block + 4 alternatives + edge case carve-out for tool-system scheduling.
- **Decision**: New file at `03-` prefix to maintain sequential numbering convention.
- **Rejected alternative**: Adding to `01-context-and-tools.md` — rejected because sleep prohibition is an execution/terminal concern, not a context/discovery concern (SRP).

```diff
--- /dev/null
+++ b/assets/rules/03-execution-terminal.md
@@ -0,0 +1,31 @@
+---
+alwaysApply: true
+---
+
+# RULE 3: EXECUTION & TERMINAL
+
+## 1. No Sleep / No Busy-Wait
+
+- NEVER use `sleep` commands under any circumstances.
+- DO NOT poll or busy-wait using iterative terminal commands (e.g., repeatedly calling
+  `sleep`, `ps`, or checking logs in a loop).
+- This prohibition applies to shell commands only. Tool-system scheduling mechanisms
+  (e.g., `schedule` tool, cron jobs, reactive wakeup via background task notifications)
+  are permitted because they are event-driven, not spin-loop polling.
+
+## 2. Approved Alternatives
+
+If a command or process requires waiting, use exactly one of the following strategies:
+
+1. **Increase timeout directly**: Set `WaitMsBeforeAsync` / `block_until_ms` to a value
+   large enough to cover the expected completion time. Do not split the wait into intervals.
+2. **True background process**: Start the process as a daemon (`IsDaemon: true`) or
+   detached background task. Inspect its log or output file at a single, deterministic
+   later step — do not poll between steps.
+3. **One-shot readiness check**: For port or socket readiness, run a single check command
+   with a built-in timeout and retry — e.g., `wait-on`, `nc -z -w <timeout>`, or
+   `curl --retry <n> --retry-delay 0 --retry-connrefused`. Do not loop this check manually.
+4. **Hard-stop on timeout**: If the process fails to yield output within the designated
+   timeout, STOP immediately. Report the current status and ask the user for clarification
+   instead of attempting to wait indefinitely.
```

---

### 2. `[MODIFY]` `assets/rules/index.ts`

> **Action**: Append new `RuleManifest` entry for `execution-terminal` to the `RULES` array.

**Ponytail checklist**
- [x] Required by acceptance criteria (concept.md §1 Goal — rule must be registered).
- [x] Reuses existing `RuleManifest` interface and `AllowedToolId` enum — no new types.
- [x] `requiredSkills` omitted — rule is stack-agnostic, no framework skill dependency.
- [x] Codex excluded — consistent with existing 3 entries which all omit `AllowedToolId.Codex`.
- **Decision**: Append at end of array; do not reorder existing entries.
- **Rejected alternative**: Placing before `context-and-tools` entry — rejected to preserve stable array ordering.

```diff
--- a/assets/rules/index.ts
+++ b/assets/rules/index.ts
@@ -21,4 +21,10 @@
     {
         id: 'context-and-tools',
         version: '0.0.1',
         description: 'Context Minimization — enforce dependency discovery and minimal file context loading before edits',
         sourceFile: '01-context-and-tools.md',
         supportedTargets: [AllowedToolId.Antigravity, AllowedToolId.Claude, AllowedToolId.Cursor],
     },
+    {
+        id: 'execution-terminal',
+        version: '0.0.1',
+        description: 'No-Sleep / No Busy-Wait — ban sleep commands and polling loops; enforce approved async alternatives',
+        sourceFile: '03-execution-terminal.md',
+        supportedTargets: [AllowedToolId.Antigravity, AllowedToolId.Claude, AllowedToolId.Cursor],
+    },
 ];
```

## Section 5. Test Cases & Verification

**Automated Tests:**
- [x] `npx tsc --noEmit` — exit code 0, zero type errors. PASS
- [x] `cat assets/rules/03-execution-terminal.md` — file exists, frontmatter `alwaysApply: true` confirmed. PASS

**Manual Checks:**
- [x] `03-execution-terminal.md` frontmatter: `alwaysApply: true` ✅
- [x] `RULES` array in `index.ts` now contains `execution-terminal` entry at position 4 ✅
- [x] `supportedTargets`: `[Antigravity, Claude, Cursor]` — consistent with existing 3 entries ✅
