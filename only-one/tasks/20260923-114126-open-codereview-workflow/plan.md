---
status: done
slug: open-codereview-workflow
started_at: 2026-09-23
completed_at: 2026-09-23
pr_url: ~
branch: ~
---

# Plan: Build Selective Open CodeReview-to-Apply Workflow

## Section 1. Directory Structure Changes

```text
assets/workflows/
├── [MODIFY] only-one-review.md       # OCR review plus per-finding executable blueprints
├── [MODIFY] only-one-apply.md        # Multi-select and apply selected review findings
├── [MODIFY] only-one-pr-git.md       # Remove mandatory review coupling
└── [MODIFY] index.ts                  # Bump and align workflow manifests
.agents/workflows/
├── [MODIFY] only-one-review.md       # Mirror shipped review workflow
├── [MODIFY] only-one-apply.md        # Mirror shipped apply workflow
└── [MODIFY] only-one-pr-git.md       # Mirror shipped PR workflow
test/core/
└── [MODIFY] workflow-registry.test.ts # Lock OCR, selection, and decoupling contracts
├── [MODIFY] README.md
└── [MODIFY] BACKLOG.md
```

## Section 2. File Changes

### 1. `[MODIFY]` `assets/workflows/only-one-review.md`

- **Status**: `[x]`
- **Context**: Current workflow performs an internal 5-axis audit and produces no directly executable per-finding patch blueprint.
- **Target Symbols / AST Seams**: `Input`, `Skills Catalog`, `OCR Execution`, `Finding Investigation`, `review.md Contract`, `Guardrails`.
- **Invariants**: OCR alone discovers findings; agent may prove or reject each claim and design a patch, but may not invent new review findings or modify source code.
- **Depends On**: None.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Replace internal review with three OCR modes, then enrich each OCR finding into an isolated debug-grade executable unit.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing OCR CLI, debug evidence chain, and apply task-block schema reused.
- [x] No parser package or duplicate patch format introduced.
- [x] Review remains lifecycle-isolated from source modification.
- **Decision**: Embed `Diagnosis`, `File Changes`, and `Verification` under every finding so selected findings can be applied independently.
- **Rejected alternative**: Routing through `only-one-debug` adds an unwanted workflow hop; applying raw OCR recommendations lacks proven Root Cause and executable diffs.

```diff
@@ Input
-/only-one-review [base-branch]
+/only-one-review [branch [from] [to] | changes | commit [sha]]
@@
+Missing input resolves to `branch main <current-branch>`.
@@ Execution
+1. Run `ocr --version`; never auto-install or configure OCR.
+2. Validate Git repository and mode-specific refs/SHA.
+3. Create `only-one/tasks/<YYYYMMDD-HHmmss>-code-review/review.md`.
+4. Run exactly one command:
+   - `ocr review --from <from> --to <to> --output <review-path>`
+   - `ocr review --output <review-path>`
+   - `ocr review --commit <sha> --output <review-path>`
+5. Stop on non-zero exit or empty output; never publish a partial canonical report.
+6. Translate narrative and normalize OCR findings without adding, merging, splitting, suppressing, or reprioritizing them.
+7. For each finding, reproduce and prove/reject the claim. Executable findings receive debug-grade Diagnosis, file-centric patch tasks, and Verification. Unproven findings remain `NON_EXECUTABLE` with recorded evidence gap.
@@ review.md
+---
+status: reviewed
+document_type: review
+review_mode: branch | changes | commit
+from_ref: <ref-or-null>
+to_ref: <ref-or-null>
+commit: <sha-or-null>
+ocr_version: <version>
+started_at: <timestamp>
+---
+
+# Open CodeReview
+
+## Findings
+
+### OCR-BLOCKER-001 — <title>
+- **Status**: `OPEN | NON_EXECUTABLE | SELECTED | IN_PROGRESS | FIXED | FAILED`
+- **Severity**: `BLOCKER`
+- **Location**: `<exact path:line>`
+- **OCR Claim**: <faithful Vietnamese translation>
+- **OCR Evidence**: <exact evidence/snippet>
+
+#### Diagnosis
+- **Symptom / Expected**: <observed and expected behavior>
+- **Reproduction / Red Test**: `<command and result>`
+- **Root Cause**: <mechanical cause and violated invariant>
+- **Fix Constraints**: <preserved behavior and boundaries>
+
+#### File Changes
+##### 1. `[MODIFY]` `path/to/test.ts`
+- **Status**: `[x]`
+- **Context**: ...
+- **Target Symbols / AST Seams**: ...
+- **Invariants**: ...
+- **Depends On**: None.
+- **Fast Test Command**: `...`
+<Test/Ponytail checklist and Unified Diff>
+
+#### Verification
+- [ ] Red reproduction fails before patch.
+- [ ] Same reproduction passes after patch.
+- [ ] Targeted and regression checks pass.
@@ Guardrails
+Only findings with proven Root Cause and complete task blocks may use `OPEN` and appear in apply selection.
+Preserve OCR severity; missing severity becomes `UNCLASSIFIED`.
+Translation preserves paths, symbols, commands, snippets, evidence, and technical meaning.
```

### 2. `[MODIFY]` `assets/workflows/only-one-apply.md`

- **Status**: `[x]`
- **Context**: Apply accepts only `plan.md` and `debug.md`, parsing one global Section 2 without a finding selection gate.
- **Target Symbols / AST Seams**: `Input`, document discovery, status validation, task parsing, incremental execution, completion semantics.
- **Invariants**: No source mutation occurs before explicit selection; unselected findings remain untouched; each selected finding obeys dependency order and fast tests.
- **Depends On**: Task 1.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Accept `review.md`, present interactive multi-select for executable `OPEN` findings, and apply only selected finding task groups.

**Ponytail checklist**
- [x] Required by accepted interaction design.
- [x] Existing task parser, status transitions, fast tests, and verification flow reused.
- [x] No separate selection file or CLI flag syntax introduced.
- [x] Empty/cancelled selection performs zero mutations.
- **Decision**: Selection persists in `review.md` as finding lifecycle state; execution remains resumable per finding and file task.
- **Rejected alternative**: Manual status editing is error-prone; command-line ID lists are less discoverable and bypass interactive confirmation.

```diff
@@
-description: "Implement tasks from an approved plan.md or debug.md ..."
+description: "Implement tasks from an approved plan.md, debug.md, or selected findings in review.md ..."
@@ Input
-/only-one-apply [<task-folder> | <plan-path> | <debug-path>]
+/only-one-apply [<task-folder> | <plan-path> | <debug-path> | <review-path>]
@@ Locate
+When a task folder contains `review.md`, accept it as an active document alongside plan/debug discovery.
@@ Validate
+For `review.md`, require `document_type: review` and at least one executable finding with status `OPEN`, `SELECTED`, `IN_PROGRESS`, or `FAILED`.
+
+### Review Selection Gate
+1. Resume existing `SELECTED`/`IN_PROGRESS` findings first after explicit confirmation.
+2. Otherwise display a multi-select containing only executable `OPEN` findings, ordered by severity then stable ID.
+3. Show ID, severity, title, location, changed files, and Red Test summary for each choice.
+4. Empty/cancelled selection stops with no file or status mutation.
+5. After confirmation, mark chosen findings `SELECTED`; leave all others `OPEN`.
@@ Parse
+For `review.md`, parse `#### File Changes` only inside `SELECTED`, `IN_PROGRESS`, or resumable `FAILED` findings.
+Treat each finding as an isolated task group; never execute tasks from unselected findings.
@@ Apply
+Mark active finding `IN_PROGRESS`, execute its file tasks in order, then mark `FIXED` only after its Verification passes.
+On failure mark the finding `FAILED`, record evidence, stop before the next finding, and preserve resumable task states.
@@ Completion
+Set document `status: done` only when no `OPEN`, `SELECTED`, `IN_PROGRESS`, or `FAILED` executable findings remain; otherwise keep `status: reviewed`.
```

### 3. `[MODIFY]` `assets/workflows/only-one-pr-git.md`

- **Status**: `[x]`
- **Context**: PR creation currently mandates a 5-axis review before Git preflight.
- **Target Symbols / AST Seams**: description, `Role`, `Purpose`, `Skills Catalog`, execution step numbering, completion summary.
- **Invariants**: Git preflight and explicit confirmation before GitHub mutation remain mandatory.
- **Depends On**: None.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Remove all mandatory and optional review coupling; begin PR workflow at Git preflight.

**Ponytail checklist**
- [x] Required by revised scope.
- [x] Existing PR skill, Git checks, drafting, and confirmation reused.
- [x] No hidden review prompt retained.
- [x] Mutation safety unchanged.
- **Decision**: Delete review gate completely.
- **Rejected alternative**: Optional review still couples independent workflows.

```diff
@@
-description: Create or update a GitHub PR from current branch with mandatory 5-axis pre-review quality gate using GitHub MCP.
+description: Create or update a GitHub PR from the current branch using validated Git state and GitHub MCP.
@@
-<remove role, purpose, skill row, full Step 1 review gate, decision gate, and Quality Gate summary>
-### Step 2 — Git Preflight Checks
+### Step 1 — Git Preflight Checks
-### Step 3 — Draft PR Title and Description
+### Step 2 — Draft PR Title and Description
-### Step 4 — Confirmation & GitHub Mutation
+### Step 3 — Confirmation & GitHub Mutation
```

### 4. `[MODIFY]` `assets/workflows/index.ts`

- **Status**: `[x]`
- **Context**: Manifest versions, descriptions, and review skill dependencies no longer match revised templates.
- **Target Symbols / AST Seams**: `WORKFLOWS` entries for `only-one-review`, `only-one-apply`, `only-one-pr-git`.
- **Invariants**: Every changed asset gets a decimal patch bump; required skills exactly match workflow catalogs.
- **Depends On**: Tasks 1, 2, 3.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts test/core/assets/version-gate.test.ts`.

> **Action**: Bump manifests and align descriptions/dependencies with selective review execution.

**Ponytail checklist**
- [x] Required by asset version gate.
- [x] Existing manifest registry reused.
- [x] No new skill manifest added.
- [x] All changed workflow assets covered.
- **Decision**: Bump review `0.0.2`, apply `0.0.10`, PR Git `0.0.2`; review reuses existing diagnosis/TDD/ponytail skills and removes obsolete 5-axis skill set.
- **Rejected alternative**: Empty review skills would omit disciplines now required to prove Root Cause and build executable patches.

```diff
@@ only-one-review
-        version: '0.0.1',
+        version: '0.0.2',
-        description: 'Perform comprehensive 5-axis ...',
-        requiredSkills: ['code-review-and-quality', 'code-simplification', 'security-and-hardening', 'performance-optimization'],
+        description: 'Run Open CodeReview and produce selectable debug-grade executable findings.',
+        requiredSkills: ['diagnosing-bugs', 'doubt-driven-development', 'test-driven-development', 'code-simplification', 'ponytail'],
@@ only-one-apply
-        version: '0.0.9',
+        version: '0.0.10',
@@ only-one-pr-git
-        version: '0.0.1',
+        version: '0.0.2',
+        description: 'Create or update a GitHub PR from the current branch using validated Git state and GitHub MCP.',
```

### 5. `[MODIFY]` `.agents/workflows/only-one-review.md`

- **Status**: `[x]`
- **Context**: Active workflow must match shipped OCR review template.
- **Target Symbols / AST Seams**: Entire document.
- **Invariants**: Byte-equivalent to Task 1 output.
- **Depends On**: Task 1.
- **Fast Test Command**: `cmp assets/workflows/only-one-review.md .agents/workflows/only-one-review.md`.

> **Action**: Copy shipped review workflow verbatim.

**Ponytail checklist**
- [x] Required by sync rule.
- [x] Asset reused as source of truth.
- [x] No local-only behavior.
- [x] Exact synchronization.
- **Decision**: Mirror Task 1.
- **Rejected alternative**: Asset-only update leaves active workflow stale.

```diff
@@
-<current workflow>
+<exact Task 1 content>
```

### 6. `[MODIFY]` `.agents/workflows/only-one-apply.md`

- **Status**: `[x]`
- **Context**: Active apply workflow cannot select or execute review findings.
- **Target Symbols / AST Seams**: Entire document.
- **Invariants**: Byte-equivalent to Task 2 output.
- **Depends On**: Task 2.
- **Fast Test Command**: `cmp assets/workflows/only-one-apply.md .agents/workflows/only-one-apply.md`.

> **Action**: Copy shipped apply workflow verbatim.

**Ponytail checklist**
- [x] Required by sync rule.
- [x] Asset reused as source of truth.
- [x] No duplicate selection contract.
- [x] Exact synchronization.
- **Decision**: Mirror Task 2.
- **Rejected alternative**: Local drift breaks immediate usage.

```diff
@@
-<current workflow>
+<exact Task 2 content>
```

### 7. `[MODIFY]` `.agents/workflows/only-one-pr-git.md`

- **Status**: `[x]`
- **Context**: Active PR workflow still forces review.
- **Target Symbols / AST Seams**: Entire document.
- **Invariants**: Byte-equivalent to Task 3 output.
- **Depends On**: Task 3.
- **Fast Test Command**: `cmp assets/workflows/only-one-pr-git.md .agents/workflows/only-one-pr-git.md`.

> **Action**: Copy decoupled PR workflow verbatim.

**Ponytail checklist**
- [x] Required by sync rule.
- [x] Asset reused as source of truth.
- [x] No review coupling retained.
- [x] Exact synchronization.
- **Decision**: Mirror Task 3.
- **Rejected alternative**: Local forced review contradicts revised workflow.

```diff
@@
-<current workflow>
+<exact Task 3 content>
```

### 8. `[MODIFY]` `test/core/workflow-registry.test.ts`

- **Status**: `[x]`
- **Context**: Tests do not lock OCR modes, debug-grade finding schema, interactive selection, or PR decoupling.
- **Target Symbols / AST Seams**: `describe('workflow registry integrity')`.
- **Invariants**: Static tests require no OCR binary, network, or interactive terminal.
- **Depends On**: Tasks 1–4.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Add contract tests for review production and selective apply consumption.

**Test checklist**
- [x] Existing registry/file helpers reused.
- [x] No subprocess mocks.
- [x] Changed contracts only.
- [x] Existing Vitest toolchain.
- **Decision**: Assert required commands, schema markers, status transitions, selection isolation, and PR absence of review terms.
- **Rejected alternative**: External OCR integration tests would be nondeterministic and test third-party behavior.

```diff
@@
+it('defines OCR review modes and executable finding contracts', () => {
+  expect(review).toContain('ocr review --from <from> --to <to> --output');
+  expect(review).toContain('ocr review --commit HEAD --output');
+  expect(review).toContain('ocr review --commit <sha> --output');
+  expect(review).toContain('`changes`');
+  expect(review).toContain('#### Diagnosis');
+  expect(review).toContain('#### File Changes');
+  expect(review).toContain('#### Verification');
+  expect(review).toContain('NON_EXECUTABLE');
+});
+
+it('selects and applies only chosen review findings', () => {
+  expect(apply).toContain('<review-path>');
+  expect(apply).toContain('multi-select');
+  expect(apply).toContain('SELECTED');
+  expect(apply).toContain('leave all others `OPEN`');
+  expect(apply).toContain('never execute tasks from unselected findings');
+});
+
+it('keeps PR creation independent from review', () => {
+  expect(pr).not.toContain('/only-one-review');
+  expect(pr).not.toContain('Quality Gate');
+  expect(pr).toContain('Git Preflight Checks');
+});
```

### 9. `[MODIFY]` `README.md`

- **Status**: `[x]`
- **Context**: Public summary still describes a 5-axis review.
- **Target Symbols / AST Seams**: `only-one-review` workflow bullet.
- **Invariants**: Keep one concise capability line.
- **Depends On**: Tasks 1, 2.
- **Fast Test Command**: `grep -n "only-one-review" README.md`.

> **Action**: Document OCR modes and selective apply handoff.

**Ponytail checklist**
- [x] Required to remove stale docs.
- [ ] Existing bullet reused.
- [x] No duplicated official OCR guide.
- [x] One-line change.
- **Decision**: Replace stale summary only.
- **Rejected alternative**: Long setup guide belongs to OCR docs.

```diff
@@
-- `only-one-review`: 5-axis code health, security, simplicity, and performance review.
+- `only-one-review`: Open CodeReview for branch, uncommitted changes, or commit changes with selectable executable fixes via `only-one-apply`.
```

### 10. `[MODIFY]` `BACKLOG.md`

- **Status**: `[x]`
- **Context**: Capability inventory still claims internal 5-axis review.
- **Target Symbols / AST Seams**: `only-one-review` capability bullet.
- **Invariants**: Preserve unrelated backlog entries.
- **Depends On**: Tasks 1, 2.
- **Fast Test Command**: `grep -n "only-one-review" BACKLOG.md`.

> **Action**: Align capability inventory with OCR and selective apply.

**Ponytail checklist**
- [ ] Required to remove stale claim.
- [ ] Existing bullet reused.
- [ ] No unrelated edits.
- [x] One-line change.
- **Decision**: Replace only review bullet.
- **Rejected alternative**: Historical active wording conflicts with shipped behavior.

```diff
@@
-  - `only-one-review`: review toàn diện 5 trục (health, security, simplicity, performance, PR readiness).
+  - `only-one-review`: OCR review theo branch/changes/commit, tạo executable findings để người dùng chọn sửa qua `only-one-apply`.
```

## Section 3. Test Cases & Verification

### Automated Tests
- [x] PASS - targeted Vitest: 11 tests passed.
- [x] PASS - `npm run format:check`.
- [x] PASS - `npm run build`.
- [x] PASS - `npm test`: 55 test files passed, 241 tests passed, 4 skipped.
- `npx vitest run test/core/workflow-registry.test.ts test/core/assets/version-gate.test.ts`
- `npm run format:check`
- `npm run build`
- `npm test`

### Static Contract Checks
- [x] PASS - shipped and active workflow copies are synchronized.
- [x] PASS - no stale active 5-axis/dual-perspective contract.
- [x] PASS - PR workflow has no review gate coupling.
- `cmp assets/workflows/only-one-review.md .agents/workflows/only-one-review.md`
- `cmp assets/workflows/only-one-apply.md .agents/workflows/only-one-apply.md`
- `cmp assets/workflows/only-one-pr-git.md .agents/workflows/only-one-pr-git.md`
- `grep -R "5-Axis\|dual-perspective" assets/workflows/only-one-review.md assets/workflows/only-one-pr-git.md README.md BACKLOG.md` returns no stale active contract.
- `grep -n "only-one-review\|Quality Gate" assets/workflows/only-one-pr-git.md` returns no coupling.

### Manual Checks
1. Verify default, explicit branch, changes, latest-commit, and explicit-commit OCR commands create one timestamped `review.md`.
2. Verify missing OCR, invalid refs/SHA, detached HEAD, non-zero exit, and empty output stop without a completed report.
3. Verify each proven finding contains Diagnosis, ordered File Changes with Unified Diffs, and Verification; unproven claims become `NON_EXECUTABLE`.
4. Run `/only-one-apply <review.md>`; verify multi-select lists executable `OPEN` findings only.
5. Cancel or submit empty selection; verify zero status and source mutations.
6. Select multiple findings; verify only chosen findings become `SELECTED`, unchosen findings remain `OPEN`, and execution follows finding/file dependency order.
7. Force a selected finding test failure; verify `FAILED` state, evidence capture, stop-before-next behavior, and resume support.
8. Complete one subset; verify fixed findings become `FIXED` while remaining `OPEN` findings keep document status `reviewed`.
9. Run `/only-one-pr-git --branch main`; verify flow starts at Git preflight without invoking or prompting for review.
