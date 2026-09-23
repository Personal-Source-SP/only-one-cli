---
status: done
slug: slim-plan-md-structure
started_at: 2026-09-23
completed_at: 2026-09-23
pr_url: ~
branch: ~
---

# Plan: Replace Task Matrix with File-Centric Task Blocks

## Section 1. Directory Structure Changes

```text
.
├── .agents/workflows/
│   ├── [MODIFY] only-one-apply.md      # Parse and execute ordered file task blocks
│   └── [MODIFY] only-one-plan.md       # Emit three-section plans
├── assets/workflows/
│   ├── [MODIFY] index.ts               # Bump workflow versions and descriptions
│   ├── [MODIFY] only-one-apply.md      # Define task-block execution contract
│   └── [MODIFY] only-one-plan.md       # Define task-block planning contract
└── only-one/
    └── [MODIFY] rules.md                # Replace Task Matrix governance
```

## Section 2. File Changes

### 1. `[MODIFY]` `assets/workflows/only-one-plan.md`

- **Status**: `[x]`
- **Context**: Template duplicates concept context and separates task metadata from file diffs.
- **Target Symbols / AST Seams**: Frontmatter; Role; research flow; Skills Catalog; Plan Output Structure; Guardrails.
- **Invariants**: Preserve concept ingestion, research gates, Ponytail/Test checklists, unified diffs, review gate, and lifecycle isolation.
- **Depends On**: None.
- **Fast Test Command**: `grep -n "Section [123]\|Task Block\|Task Matrix" assets/workflows/only-one-plan.md`

> **Action**: Replace five-section/Task Matrix output with three sections and fixed-schema file task blocks.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing concept-ingestion and per-file diff structures reused.
- [x] No extra schema file or parser abstraction.
- [x] Minimum structure keeps all execution metadata beside its diff.
- **Decision**: Use ordered Markdown headings plus fixed metadata labels as machine-readable contract.
- **Rejected alternative**: Keep Task Matrix; duplicates paths, actions, symbols, dependencies, and tests.

```diff
@@ frontmatter and Role
-description: Research current code and create a focused, diff-centric implementation plan with Current State, Detailed Design, Task Matrix, Unified Diffs, and Verification.
+description: Research current code and create a focused, diff-centric implementation plan with Directory Structure, machine-readable File Changes, Unified Diffs, and Verification.
@@
-    - Section 3 must use the structured **Task Matrix & Dependency Graph** ...
-    - Section 4 must provide Git-standard **Unified Diff** blocks ...
+    - Section 2 must use ordered machine-readable file task blocks with fixed metadata labels.
+    - Every task block must contain `Status`, `Context`, `Target Symbols / AST Seams`, `Invariants`, `Depends On`, and `Fast Test Command` before its checklist and diff.
+    - Section 2 must provide Git-standard **Unified Diff** blocks inside each task block.
@@ research
+**Mandatory SSOT Ingestion**: When `concept.md` exists, read it before file analysis and never recreate its Current State or high-level solution in `plan.md`.
@@ Plan Output Structure
-### Plan Output Structure (The 5 Core Sections - Dev-First & Diff-Centric)
+### Plan Output Structure (The 3 Core Sections - File-Centric & Diff-Centric)
@@
-## Section 1. Current State ...
-## Section 2. Technical Contracts & AST Seams ...
-## Section 3. Directory Structure & Task Matrix
-### 3.1 Directory Structure Changes
+## Section 1. Directory Structure Changes
 ...
-### 3.2 Task Matrix & Dependency Graph
-| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
-...
-### 1. `[MODIFY]` `path/to/file.ts`
+## Section 2. File Changes
+
+### 1. `[MODIFY]` `path/to/file.ts`
+- **Status**: `[ ]`
+- **Context**: <Current mechanism in one sentence>.
+- **Target Symbols / AST Seams**: `Class.methodName`.
+- **Invariants**: <Must-not-break constraint>.
+- **Depends On**: None.
+- **Fast Test Command**: `npm test path/to/file.test.ts`.
 ...
-## Section 5. Test Cases & Verification
+## Section 3. Test Cases & Verification
@@ Guardrails
+- **Machine-Readable Task Block Contract**: Keep headings and metadata labels exact; one block equals one changed file.
+- **Anti-Current-State-Duplication**: `concept.md` is SSOT for current state and high-level solution when present.
```

### 2. `[MODIFY]` `.agents/workflows/only-one-plan.md`

- **Status**: `[x]`
- **Context**: Installed workflow mirrors canonical asset source.
- **Target Symbols / AST Seams**: Entire workflow document.
- **Invariants**: File must remain byte-equivalent to `assets/workflows/only-one-plan.md`.
- **Depends On**: Task 1.
- **Fast Test Command**: `cmp -s assets/workflows/only-one-plan.md .agents/workflows/only-one-plan.md`

> **Action**: Synchronize installed workflow from canonical asset after Task 1.

**Ponytail checklist**
- [x] Required by repository synchronization invariant.
- [x] Direct copy reuses canonical source.
- [x] No independent installed-workflow logic.
- [x] Byte-equivalent copy is minimum safe change.
- **Decision**: Copy canonical workflow verbatim.
- **Rejected alternative**: Modify only asset source; active workspace workflow stays stale.

```diff
--- a/.agents/workflows/only-one-plan.md
+++ b/.agents/workflows/only-one-plan.md
@@
-<current content>
+<exact post-change content of assets/workflows/only-one-plan.md>
```

### 3. `[MODIFY]` `assets/workflows/only-one-apply.md`

- **Status**: `[x]`
- **Context**: Apply workflow currently fast-paths Section 3 Task Matrix and reads diffs from Section 4.
- **Target Symbols / AST Seams**: Frontmatter; Role; Output Skill Contract; Step 3 parser; Step 4 execution loop; performance guardrail.
- **Invariants**: Preserve dependency ordering, pending/completed status transitions, per-file fast tests, rollback safety, and final verification evidence.
- **Depends On**: Task 1.
- **Fast Test Command**: `grep -n "Section 2\|task block\|Depends On" assets/workflows/only-one-apply.md`

> **Action**: Parse ordered Section 2 file task blocks instead of Task Matrix rows.

**Ponytail checklist**
- [x] Required for atomic compatibility with new plan format.
- [x] Existing execution loop and dependency checks reused.
- [x] No external Markdown parser introduced.
- [x] Label scanning is sufficient for fixed workflow output.
- **Decision**: Scan ordered `###` task headings and mandatory metadata labels.
- **Rejected alternative**: Keep Matrix fallback indefinitely; maintains two schemas and ambiguity.

```diff
@@ frontmatter and Role
-description: "Implement tasks ... by parsing the Machine-Readable Task Matrix in Section 3 ..."
+description: "Implement tasks ... by parsing machine-readable file task blocks in Section 2 ..."
@@
-- Fast-path ingest the **Section 3 Machine-Readable Task Matrix** ...
-- Implement changes ... following Section 4 blueprint guidance ...
+- Fast-path ingest ordered **Section 2 File Changes** task blocks ...
+- Implement each block's unified diff while respecting `Depends On` metadata.
@@ Step 3
-### Step 3 — Ingest Source Structure & Parse Task Matrix
+### Step 3 — Ingest Source Structure & Parse File Task Blocks
@@
-2. **Parse Section 3 Task Matrix & Dependency Graph**:
-   - Jump to **Section 3 Task Matrix & Dependency Graph** ...
-   - Extract `Order`, `Status`, `Action`, `File Path`, `Target Symbols`, `Depends On`, `Fast Test Command`.
+2. **Parse Section 2 File Changes**:
+   - Read task blocks in heading order: `### <order>. [<ACTION>] <path>`.
+   - Require `Status`, `Context`, `Target Symbols / AST Seams`, `Invariants`, `Depends On`, and `Fast Test Command`.
+   - Treat heading order as execution order and `Depends On` as blocking edges.
@@ Step 4
-For each pending row in the Task Matrix:
+For each pending file task block:
```

### 4. `[MODIFY]` `.agents/workflows/only-one-apply.md`

- **Status**: `[x]`
- **Context**: Installed apply workflow must match canonical source.
- **Target Symbols / AST Seams**: Entire workflow document.
- **Invariants**: File must remain byte-equivalent to `assets/workflows/only-one-apply.md`.
- **Depends On**: Task 3.
- **Fast Test Command**: `cmp -s assets/workflows/only-one-apply.md .agents/workflows/only-one-apply.md`

> **Action**: Synchronize installed apply workflow from canonical asset.

**Ponytail checklist**
- [x] Required by repository synchronization invariant.
- [x] Direct canonical copy.
- [x] No duplicate behavior.
- [x] Minimum safe synchronization.
- **Decision**: Copy verbatim.
- **Rejected alternative**: Independent edit risks drift.

```diff
--- a/.agents/workflows/only-one-apply.md
+++ b/.agents/workflows/only-one-apply.md
@@
-<current content>
+<exact post-change content of assets/workflows/only-one-apply.md>
```

### 5. `[MODIFY]` `assets/workflows/index.ts`

- **Status**: `[x]`
- **Context**: Manifest descriptions and versions expose old Matrix-based contracts.
- **Target Symbols / AST Seams**: `WORKFLOWS` entries for `only-one-plan` and `only-one-apply`.
- **Invariants**: Preserve names and `requiredSkills`; versions remain decimal `X.Y.Z`.
- **Depends On**: Tasks 1 and 3.
- **Fast Test Command**: `grep -A5 -n "name: 'only-one-plan'\|name: 'only-one-apply'" assets/workflows/index.ts`

> **Action**: Bump both workflow versions and align descriptions.

**Ponytail checklist**
- [x] Required by asset version gate.
- [x] Existing entries updated in place.
- [x] No new manifest fields.
- [x] Patch bump matches workflow contract refinement.
- **Decision**: Increment each current patch version by one.
- **Rejected alternative**: Unchanged versions violate repository governance.

```diff
@@ only-one-plan
-        version: '0.0.7',
+        version: '0.0.8',
-            'Research ... Current State, Detailed Design, Task Matrix, Unified Diffs, and Verification.',
+            'Research ... Directory Structure, machine-readable File Changes, Unified Diffs, and Verification.',
@@ only-one-apply
-        version: '0.0.7',
+        version: '0.0.8',
-            'Implement tasks ... by parsing the Machine-Readable Task Matrix in Section 3 ...',
+            'Implement tasks ... by parsing machine-readable file task blocks in Section 2 ...',
```

### 6. `[MODIFY]` `only-one/rules.md`

- **Status**: `[x]`
- **Context**: Governance mandates a Section 3 Task Matrix and references obsolete plan section contracts.
- **Target Symbols / AST Seams**: Task Matrix `[ALWAYS]`; Anti-Concept-Duplication `[NEVER]`; task artifact execution wording.
- **Invariants**: Preserve every unrelated repository constraint verbatim.
- **Depends On**: Tasks 1 and 3.
- **Fast Test Command**: `grep -n "Task Matrix\|task block\|Anti-Concept-Duplication" only-one/rules.md`

> **Action**: Replace Task Matrix mandate with fixed-schema Section 2 task-block mandate.

**Ponytail checklist**
- [x] Required to prevent obsolete structure from returning.
- [x] Existing rules updated rather than duplicated.
- [x] No unrelated governance changed.
- [x] One canonical plan execution schema remains.
- **Decision**: Define exact heading and metadata labels in existing rule.
- **Rejected alternative**: Support both Matrix and blocks; increases drift and parser complexity.

```diff
@@
-- **[ALWAYS]** Khai báo Machine-Readable Task Matrix ... trong Section 3 của `plan.md`.
+- **[ALWAYS]** Khai báo ordered machine-readable file task blocks trong Section 2 của `plan.md`; mỗi block bắt buộc có heading `### <order>. [<ACTION>] <path>` và các field `Status`, `Context`, `Target Symbols / AST Seams`, `Invariants`, `Depends On`, `Fast Test Command`.
@@
-- **[NEVER]** Không diễn giải ... trong Section 2 ... Section 2 chỉ khai báo Type Signatures ...
+- **[NEVER]** Không tái tạo Current State hoặc high-level mechanism trong `plan.md`; khi tồn tại, `concept.md` là SSOT và Section 2 chỉ chứa executable file task blocks.
```

## Section 3. Test Cases & Verification

### Automated Tests

- [x] `cmp -s assets/workflows/only-one-plan.md .agents/workflows/only-one-plan.md` — PASS.
- [x] `cmp -s assets/workflows/only-one-apply.md .agents/workflows/only-one-apply.md` — PASS.
- [x] `npm test` — PASS: 55 files passed, 2 skipped; 238 tests passed, 4 skipped.

Use equivalent existing test scripts if repository commands reject `--runInBand`.

### Manual Checks

1. Confirm generated plan template exposes exactly three top-level sections.
2. Confirm Current State, Technical Contracts, and Task Matrix sections are absent.
3. Confirm every sample file task block contains all six mandatory metadata fields before checklist and diff.
4. Confirm `/only-one-apply` reads Section 2 blocks in heading order and honors `Depends On`.
5. Confirm raw-description planning still works without `concept.md`.
6. Confirm both installed workflow files are byte-equivalent to canonical assets.
