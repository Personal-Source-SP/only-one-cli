---
status: done
slug: align-debug-flash-structures
started_at: 2026-09-23
completed_at: 2026-09-23
pr_url: ~
branch: ~
---

# Plan: Align Debug and Flash with File-Centric Workflow Structure

## Section 1. Directory Structure Changes

```text
.
├── .agents/workflows/
│   ├── [MODIFY] only-one-apply.md      # Parse full task blocks from plan.md and debug.md
│   ├── [MODIFY] only-one-debug.md      # Emit three-section debug.md
│   └── [MODIFY] only-one-flash.md      # Emit compact in-chat File Changes
├── assets/workflows/
│   ├── [MODIFY] index.ts               # Bump versions and align descriptions
│   ├── [MODIFY] only-one-apply.md      # Canonical shared task-block executor
│   ├── [MODIFY] only-one-debug.md      # Canonical file-centric debug workflow
│   └── [MODIFY] only-one-flash.md      # Canonical compact flash workflow
├── only-one/
│   └── [MODIFY] rules.md                # Persist new Debug and Flash contracts
└── test/core/
    └── [MODIFY] workflow-registry.test.ts # Assert new domain invariants
```

## Section 2. File Changes

### 1. `[MODIFY]` `assets/workflows/only-one-debug.md`

- **Status**: `[x]`
- **Context**: Debug currently splits symptom, RCA, source structure, Task Matrix, diffs, and verification across five sections.
- **Target Symbols / AST Seams**: Frontmatter description; Role; Purpose; Steps 1–5; `debug.md` template; Summary Report; Guardrails.
- **Invariants**: Preserve RCA depth, exact Red reproduction, evidence-first diagnosis, minimal surgical patch, regression test, three-attempt escalation semantics, lifecycle isolation, and handoff to `/only-one-apply`.
- **Depends On**: None.
- **Fast Test Command**: `grep -n "Section [123]\\|Diagnosis\\|File Changes\\|Hypotheses Rejected" assets/workflows/only-one-debug.md`

> **Action**: Replace five-section/Task Matrix document contract with three sections: Diagnosis, full machine-readable File Changes, and Verification.

**Ponytail checklist**
- [x] Required by approved concept.
- [x] Existing RCA phases and file-level diff mechanics reused.
- [x] No new artifact or parsing abstraction introduced.
- [x] Minimum structural change preserves diagnostic rigor.
- **Decision**: Keep mandatory Diagnosis subheadings and colocate each file's metadata, checklist, and unified diff.
- **Rejected alternative**: Force Debug to match Plan semantics exactly; loses RCA-specific evidence chain.

```diff
@@ Role
-    - Author Section 1 & 2 ...
-    - Section 2 must clearly separate ...
-    - Section 3 must use the structured Task Matrix ...
-    - Section 4 must provide detailed file-by-file ...
+    - Author Section 1 Diagnosis with mandatory `Symptom`, `Reproduction`, `Evidence`, `Root Cause`, and `Fix Constraints` subheadings.
+    - Add `Hypotheses Rejected` only when runtime evidence disproves a hypothesis.
+    - Section 2 must use the same full machine-readable file task blocks as `plan.md`.
+    - Keep metadata, Ponytail/Test checklist, and Unified Diff inside each file task block.
@@ Protocol
-Record findings across Sections 1, 2.1, 2.2, 3, 4, and 5.
+Record investigation in Section 1, executable patch blocks in Section 2, and regression evidence in Section 3.
@@ debug.md template
-## Section 1. Symptom & Red Feedback Loop
-## Section 2. Root Cause Analysis & Proposed Solution
-## Section 3. Task Matrix & Dependency Graph
-## Section 4. Code Changes
-## Section 5. Verification & Regression Guard
+## Section 1. Diagnosis
+### Symptom
+### Reproduction
+### Evidence
+### Root Cause
+### Hypotheses Rejected
+### Fix Constraints
+
+## Section 2. File Changes
+### 1. `[MODIFY]` `path/to/test.spec.ts`
+- **Status**: `[ ]`
+- **Context**: <Current failure mechanism>.
+- **Target Symbols / AST Seams**: `describe('reproduction')`.
+- **Invariants**: <Regression constraint>.
+- **Depends On**: None.
+- **Fast Test Command**: `npm test path/to/test.spec.ts`.
+...
+```diff
+...
+```
+
+## Section 3. Verification
+### Red Feedback Loop
+### Regression
+### Evidence
@@ Guardrails
-- All investigation, RCA, task matrix, and diffs must be stored ...
+- All Diagnosis, file task blocks, diffs, and verification evidence must be stored ...
```

### 2. `[MODIFY]` `.agents/workflows/only-one-debug.md`

- **Status**: `[x]`
- **Context**: Installed Debug workflow must mirror its canonical asset.
- **Target Symbols / AST Seams**: Entire workflow document.
- **Invariants**: Remain byte-equivalent to `assets/workflows/only-one-debug.md`.
- **Depends On**: Task 1.
- **Fast Test Command**: `cmp -s assets/workflows/only-one-debug.md .agents/workflows/only-one-debug.md`

> **Action**: Copy canonical Debug workflow verbatim.

**Ponytail checklist**
- [x] Required by synchronization rule.
- [x] Canonical asset reused directly.
- [x] No independent behavior.
- [x] Byte copy is minimum safe change.
- **Decision**: Synchronize after Task 1.
- **Rejected alternative**: Edit both copies independently; risks drift.

```diff
--- a/.agents/workflows/only-one-debug.md
+++ b/.agents/workflows/only-one-debug.md
@@
-<current content>
+<exact post-change content of assets/workflows/only-one-debug.md>
```

### 3. `[MODIFY]` `assets/workflows/only-one-flash.md`

- **Status**: `[x]`
- **Context**: Flash Plan exposes description, target tree, and verification but no reviewable per-file action blocks.
- **Target Symbols / AST Seams**: Role; Step 2 Flash Plan template; Step 3 execution order; Guardrails.
- **Invariants**: Preserve Zero Disk Plan Footprint, mandatory Review Gate, rapid target-driven research, direct apply after approval, and fast verification.
- **Depends On**: None.
- **Fast Test Command**: `grep -n "File Changes\\|Target\\|Change\\|Preserve\\|Fast Test" assets/workflows/only-one-flash.md`

> **Action**: Add compact File Changes blocks to Flash Plan without turning Flash into a full disk plan.

**Ponytail checklist**
- [x] Required by approved concept.
- [x] Existing target tree and fast-test data reused.
- [x] No full task schema, dependency graph, or artifact added.
- [x] Four compact fields are sufficient for review.
- **Decision**: Use heading order plus `Target`, `Change`, `Preserve`, and `Fast Test`.
- **Rejected alternative**: Reuse full Plan blocks; too verbose and violates Flash purpose.

```diff
@@ Role
-- Output ... containing only Mô tả, Target Structure, and Verification.
+- Output ... containing Mô tả, Target Structure, compact File Changes, and Verification.
@@ Flash Plan template
 - **Target Structure**:
 ```text
 ...
 ```
+- **File Changes**:
+  ### 1. `[MODIFY]` `path/to/file.ts`
+  - **Target**: `Class.method`.
+  - **Change**: <One concise action>.
+  - **Preserve**: <Primary invariant>.
+  - **Fast Test**: `npm test ...`.
 - **Verification**: `<Aggregate command>`
@@ Step 2
+Use heading order as execution order. Do not emit `Status`, `Context`, `Depends On`, full checklists, or Unified Diffs.
@@ Step 3
-Apply code changes ...
+Apply approved compact File Changes sequentially by heading order ...
```

### 4. `[MODIFY]` `.agents/workflows/only-one-flash.md`

- **Status**: `[x]`
- **Context**: Installed Flash workflow must mirror its canonical asset.
- **Target Symbols / AST Seams**: Entire workflow document.
- **Invariants**: Remain byte-equivalent to `assets/workflows/only-one-flash.md`.
- **Depends On**: Task 3.
- **Fast Test Command**: `cmp -s assets/workflows/only-one-flash.md .agents/workflows/only-one-flash.md`

> **Action**: Copy canonical Flash workflow verbatim.

**Ponytail checklist**
- [x] Required by synchronization rule.
- [x] Canonical asset reused directly.
- [x] No independent behavior.
- [x] Byte copy is minimum safe change.
- **Decision**: Synchronize after Task 3.
- **Rejected alternative**: Leave installed workflow stale.

```diff
--- a/.agents/workflows/only-one-flash.md
+++ b/.agents/workflows/only-one-flash.md
@@
-<current content>
+<exact post-change content of assets/workflows/only-one-flash.md>
```

### 5. `[MODIFY]` `assets/workflows/only-one-apply.md`

- **Status**: `[x]`
- **Context**: Apply parses Section 2 blocks only for `plan.md` and retains a separate legacy Task Matrix path for `debug.md`.
- **Target Symbols / AST Seams**: Role; Step 3 task ingestion; Step 4 diff lookup; Step 5 evidence location; Guardrails.
- **Invariants**: Preserve dependency ordering, status transitions, Ponytail preflight, per-file Fast Tests, failure diagnosis, and final evidence.
- **Depends On**: Task 1.
- **Fast Test Command**: `grep -n "plan.md.*debug.md\\|Section 2 File Changes\\|task block" assets/workflows/only-one-apply.md`

> **Action**: Use one full Section 2 task-block ingestion path for both `plan.md` and `debug.md`.

**Ponytail checklist**
- [x] Required for atomic Debug handoff compatibility.
- [x] Existing Plan task-block parser reused.
- [x] Legacy branch removed rather than maintained in parallel.
- [x] Unified path lowers parser drift.
- **Decision**: Parse identical fixed fields from both artifact types.
- **Rejected alternative**: Keep Debug Task Matrix fallback; preserves duplicate contracts.

```diff
@@ Role
-- Fast-path ingest Section 2 blocks from plan.md; retain Task Matrix path for debug.md.
+- Fast-path ingest ordered Section 2 File Changes blocks from both plan.md and debug.md.
@@ Step 3
-- For plan.md, jump to Section 2 File Changes ...
+- For plan.md or debug.md, jump to Section 2 File Changes ...
 ... require fixed metadata ...
-- For legacy debug.md, retain its existing Task Matrix parsing contract.
@@ Step 4
-For each pending file task block (or pending legacy debug.md Task Matrix row):
+For each pending file task block:
@@ diff lookup
-- For plan.md use current block; for debug.md use documented code-change section.
+- Use the Unified Diff inside the current Section 2 task block.
@@ verification
-- Update Section 3 of plan.md or existing verification section of debug.md ...
+- Update Section 3 Verification of plan.md or debug.md ...
```

### 6. `[MODIFY]` `.agents/workflows/only-one-apply.md`

- **Status**: `[x]`
- **Context**: Installed Apply workflow must mirror its canonical asset.
- **Target Symbols / AST Seams**: Entire workflow document.
- **Invariants**: Remain byte-equivalent to `assets/workflows/only-one-apply.md`.
- **Depends On**: Task 5.
- **Fast Test Command**: `cmp -s assets/workflows/only-one-apply.md .agents/workflows/only-one-apply.md`

> **Action**: Copy canonical Apply workflow verbatim.

**Ponytail checklist**
- [x] Required by synchronization rule.
- [x] Canonical asset reused directly.
- [x] No independent behavior.
- [x] Byte copy is minimum safe change.
- **Decision**: Synchronize after Task 5.
- **Rejected alternative**: Independent edit risks parser drift.

```diff
--- a/.agents/workflows/only-one-apply.md
+++ b/.agents/workflows/only-one-apply.md
@@
-<current content>
+<exact post-change content of assets/workflows/only-one-apply.md>
```

### 7. `[MODIFY]` `assets/workflows/index.ts`

- **Status**: `[x]`
- **Context**: Manifest versions and descriptions advertise pre-change Debug, Flash, and Apply contracts.
- **Target Symbols / AST Seams**: `WORKFLOWS` entries for `only-one-debug`, `only-one-flash`, and `only-one-apply`.
- **Invariants**: Preserve workflow names and `requiredSkills`; use decimal `X.Y.Z` versions.
- **Depends On**: Tasks 1, 3, and 5.
- **Fast Test Command**: `npx vitest run test/core/assets/version.test.ts test/core/assets/version-gate.test.ts`

> **Action**: Increment Debug `0.0.6 → 0.0.7`, Flash `0.0.5 → 0.0.6`, Apply `0.0.8 → 0.0.9`, and align descriptions.

**Ponytail checklist**
- [x] Required by asset version gate.
- [x] Existing registry entries updated in place.
- [x] No new fields.
- [x] Patch bumps fit workflow refinements.
- **Decision**: Bump all three changed assets once.
- **Rejected alternative**: Keep versions unchanged; violates repository governance.

```diff
@@ only-one-apply
-        version: '0.0.8',
+        version: '0.0.9',
@@ only-one-debug
-        version: '0.0.6',
+        version: '0.0.7',
@@ only-one-flash
-        version: '0.0.5',
+        version: '0.0.6',
```

### 8. `[MODIFY]` `only-one/rules.md`

- **Status**: `[x]`
- **Context**: Flash governance lists only Description, Target Structure, and Verification; Debug governance lacks the new document schema.
- **Target Symbols / AST Seams**: Flash Zero Disk `[NEVER]` rule; Debug lifecycle `[NEVER]` rule; task-block governance.
- **Invariants**: Preserve unrelated frontend/backend, lifecycle, artifact, and synchronization constraints verbatim.
- **Depends On**: Tasks 1, 3, and 5.
- **Fast Test Command**: `grep -n "compact File Changes\\|Diagnosis\\|debug.md" only-one/rules.md`

> **Action**: Persist compact Flash fields and three-section Debug/full task-block contracts.

**Ponytail checklist**
- [x] Required to prevent schema regression.
- [x] Existing rules extended instead of duplicated.
- [x] No unrelated constraints touched.
- [x] Rules state only durable invariants.
- **Decision**: Keep Flash and Debug contracts explicit because their lifecycle differs.
- **Rejected alternative**: Rely only on workflow text; future edits could restore incompatible schemas.

```diff
@@ Flash rule
-... plan ... gồm Mô tả, Target Structure ... và Verification ...
+... plan ... gồm Mô tả, Target Structure, compact File Changes (`Target`, `Change`, `Preserve`, `Fast Test`) và Verification ...
@@ Debug rule
 ... Strict Lifecycle Isolation ...
+Debug `debug.md` must contain exactly three top-level sections: Diagnosis, full machine-readable File Changes, and Verification; full blocks share the Plan metadata contract.
```

### 9. `[MODIFY]` `test/core/workflow-registry.test.ts`

- **Status**: `[x]`
- **Context**: Registry tests protect old broad terms but do not assert the new Debug and Flash structure contracts.
- **Target Symbols / AST Seams**: `preserves workflow-specific domain invariants over output formatting` contract map; Ponytail contract expectations if wording changes.
- **Invariants**: Keep registration, required skill, and unaffected workflow assertions intact.
- **Depends On**: Tasks 1 and 3.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`

> **Action**: Assert Debug `Diagnosis`/machine-readable task blocks and Flash compact `File Changes`/Zero Disk/Review Gate terms.

**Test checklist**
- [x] Existing contract-map fixture reused.
- [x] No duplicate test setup.
- [x] Assertions cover changed workflow behavior only.
- [x] Existing Vitest toolchain used.
- **Decision**: Extend string-contract arrays for fast deterministic coverage.
- **Rejected alternative**: Add Markdown parser tests; unnecessary for static workflow contracts.

```diff
@@ contracts
-            'only-one-flash': ['Review Gate', 'Zero Disk'],
-            'only-one-debug': ['evidence', 'three failed patch attempts'],
+            'only-one-flash': ['Review Gate', 'Zero Disk', 'File Changes', '**Target**', '**Preserve**'],
+            'only-one-debug': ['Diagnosis', 'machine-readable file task blocks', 'Hypotheses Rejected'],
```

## Section 3. Test Cases & Verification

### Automated Tests

- [x] `cmp -s assets/workflows/only-one-debug.md .agents/workflows/only-one-debug.md` — PASS.
- [x] `cmp -s assets/workflows/only-one-flash.md .agents/workflows/only-one-flash.md` — PASS.
- [x] `cmp -s assets/workflows/only-one-apply.md .agents/workflows/only-one-apply.md` — PASS.
- [x] `npx vitest run test/core/workflow-registry.test.ts test/core/assets/version.test.ts test/core/assets/version-gate.test.ts` — PASS: 17 tests.
- [x] `npm test` — PASS.
- [x] `npm run build` — PASS.
- [x] `git diff --check` — PASS.

### Manual Checks

1. Confirm Debug template exposes exactly three top-level document sections.
2. Confirm Diagnosis contains five mandatory subheadings and conditional `Hypotheses Rejected` guidance.
3. Confirm every Debug file block contains all six fixed metadata fields, checklist, and Unified Diff.
4. Confirm Apply has no legacy Debug Task Matrix branch.
5. Confirm Flash Plan includes compact File Changes with exactly four metadata fields and no `Depends On`.
6. Confirm Flash still stops at Review Gate and writes no disk artifact.
7. Confirm all three installed workflows are byte-equivalent to their canonical assets.
