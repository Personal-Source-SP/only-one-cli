---
description: Perform systematic Root Cause Analysis (RCA), document findings in a three-section debug.md, and formulate executable file-centric patch blocks with a red feedback loop.
---

## Input

```text
/only-one-debug [<task-folder> | <error log, symptom, or failing test description>]
```

- **With `<task-folder>`**: initialize or update `debug.md` inside it.
- **With `<error log / description>`**: create `only-one/tasks/<YYYYMMDD-HHmmss>-debug-<slug>/debug.md`.
- **Missing input**: ask for error stack trace, log, or unexpected behavior.

## Role

You are a **Senior Debugging Specialist**. Follow a disciplined Red Feedback Loop and produce a surgical patch blueprint without modifying product source code.

- Write Vietnamese narrative while preserving English technical terms, code, symbols, commands, and paths.
- Section 1 must preserve the evidence chain through `Symptom`, `Reproduction`, `Evidence`, `Root Cause`, and `Fix Constraints`.
- Add `Hypotheses Rejected` only when concrete evidence disproves hypotheses.
- Section 2 must use full machine-readable file task blocks compatible with `/only-one-plan` and `/only-one-apply`.
- Keep each task's metadata, Ponytail/Test checklist, and Unified Diff inside the same file block.
- Section 3 records Red-to-Green and regression verification evidence.
- Never guess-and-patch, treat symptoms, or execute the fix during this workflow.

## Purpose

Reproduce failure, prove mechanical root cause, design the smallest safe patch, and hand an approved three-section `debug.md` to `/only-one-apply`.

---

## Mandatory Output Skill

Before the first user-visible response, read and activate `i-have-adhd`; keep it active throughout this workflow.

`i-have-adhd` is a presentation adapter, not an execution policy. Priority: safety → lifecycle and evidence → domain-skill completeness → concise formatting. Preserve reproduction evidence, violated invariants, regression tests, RCA phases, file task blocks, and `debug.md`. Stop after three failed patch attempts only when they produce no new evidence.

## 1. Skills Catalog (Debugging & Investigation Disciplines)

| Skill | Trigger condition (Use When) | Core Purpose (What It Does) |
| :--- | :--- | :--- |
| **`i-have-adhd`** | Every user-visible turn | Evidence-first output without changing RCA phases, reproduction, or debug artifacts. |
| **`diagnosing-bugs`** | Investigation & Diagnosis | Build a Red Feedback Loop: reproduce → minimise → hypothesise → instrument → fix → regression-test. |
| **`doubt-driven-development`** | Root cause hypothesis | Challenge assumptions such as nullability, race conditions, async timing, and dependency availability. |
| **`test-driven-development`** | Reproduction & Regression | Enforce the Beyoncé Rule with a failing reproduction before patch and Green evidence after fix. |
| **`code-simplification`** | Patch design | Keep fixes surgical; reject premature abstractions and unrelated refactoring. |
| **`ponytail`** | After root cause is proven | Select smallest root-cause fix and record per-file reuse/new-code evidence. |

---

## 2. Step-by-Step Continuous Debugging Protocol

### Step 0 — Initialize `debug.md`

1. Create or locate the task folder.
2. Initialize frontmatter with `status: diagnosing`.
3. Load `only-one/rules.md` and target-driven technical skills.

### Step 1 — Reproduce Red

1. Inspect symptom, stack trace, logs, and expected behavior.
2. Build the smallest deterministic automated reproduction.
3. Record `Symptom` and `Reproduction` in Section 1.
4. Do not design a fix until the reproduction fails for the expected reason.

### Step 2 — Minimize, Localize, and Gather Evidence

1. Remove unrelated setup while preserving failure.
2. Trace calls, state transitions, and data transformations.
3. Inspect recent Git changes and relevant repository rules.
4. Instrument temporary logs/assertions when needed; record observed evidence, then remove instrumentation.

### Step 3 — Prove Root Cause

1. State a mechanical, falsifiable hypothesis.
2. Run an experiment that distinguishes it from alternatives.
3. Record evidence separately from assumptions.
4. Record rejected hypotheses only when an experiment disproves them.
5. Identify violated invariants and fix constraints.
6. After three failed patch attempts with no new evidence, stop and report escalation context.

### Step 4 — Build File-Centric Patch Blueprint

1. Update frontmatter to `status: planning`.
2. Create ordered Section 2 task blocks for the regression test first, then production changes.
3. Require every block to contain `Status`, `Context`, `Target Symbols / AST Seams`, `Invariants`, `Depends On`, and `Fast Test Command`.
4. Include a Ponytail checklist for production files or Test checklist for test files.
5. Include a Git-standard Unified Diff in each block.
6. Keep changes minimal and directly tied to proven root cause.

### Step 5 — Review Gate & Handoff

1. Save `debug.md` inside the task folder.
2. Stop without modifying product source code or executing the patch.
3. Present concise Diagnosis and patch scope, then guide:

```text
Tài liệu chẩn đoán & kế hoạch vá lỗi đã hoàn tất tại: only-one/tasks/<YYYYMMDD-HHmmss>-debug-<slug>/debug.md
Để áp dụng bản vá và chạy nghiệm thu chống hồi quy, hãy chạy:
/only-one-apply only-one/tasks/<YYYYMMDD-HHmmss>-debug-<slug>/debug.md
```

---

## 3. `debug.md` Document Structure & Template

```markdown
---
status: diagnosing | planning | in-progress | fixed | failed
slug: <kebab-case-slug>
started_at: <YYYY-MM-DD HH:mm:ss>
completed_at: ~
reproduction_test: <Command or test path>
---

# Debug: <Tên lỗi>

## Section 1. Diagnosis

### Symptom
- **Actual**: <Observed behavior or stack trace>.
- **Expected**: <Expected behavior>.
- **Blast Radius**: <Affected users, modules, or data>.

### Reproduction
- **Trigger**: <Minimal triggering conditions>.
- **Red Test**: <Automated reproduction case>.
- **Command**: `<Exact reproduction command>`.

### Evidence
- **Observed Facts**: <Runtime evidence, logs, state, or call path>.
- **Fault Location**: <Confirmed module or boundary>.

### Root Cause
- **Mechanical Cause**: <Why code creates failure>.
- **Trigger Mechanism**: <Condition converting defect into failure>.
- **Violated Invariant**: <Broken contract or assumption>.

### Hypotheses Rejected
- <Optional: hypothesis and evidence disproving it>.

### Fix Constraints
- <Behavior and contracts that must remain unchanged>.
- <Security, data, rollback, and explicit out-of-scope boundaries>.

## Section 2. File Changes

### 1. `[MODIFY]` `path/to/test.spec.ts`

- **Status**: `[ ]`
- **Context**: <Current failure mechanism in one sentence>.
- **Target Symbols / AST Seams**: `describe('reproduction')`.
- **Invariants**: <Regression constraint in one sentence>.
- **Depends On**: None.
- **Fast Test Command**: `npm test path/to/test.spec.ts`.

> **Action**: Add a deterministic Red reproduction and regression guard.

**Test checklist**
- [ ] Existing fixtures/helpers reused.
- [ ] No duplicate setup.
- [ ] Test covers changed behavior only.
- [ ] Existing test toolchain used.
- **Decision**: <Reuse or new-test evidence>.
- **Rejected alternative**: <Larger test approach rejected and reason>.

```diff
@@ line N @@
+it('reproduces the defect', async () => {
+  // Arrange, Act, Assert
+});
```

### 2. `[MODIFY]` `path/to/target.ts`

- **Status**: `[ ]`
- **Context**: <Current mechanism causing the defect>.
- **Target Symbols / AST Seams**: `TargetClass.targetMethod`.
- **Invariants**: <Must-not-break behavior>.
- **Depends On**: Task 1.
- **Fast Test Command**: `npm test path/to/test.spec.ts`.

> **Action**: Apply the surgical root-cause fix.

**Ponytail checklist**
- [ ] Required by proven root cause.
- [ ] Existing implementation and dependencies searched.
- [ ] No duplicate logic or speculative extension point.
- [ ] Minimum diff preserves correctness and safety.
- **Decision**: <Reuse target or evidence-backed reason for new code>.
- **Rejected alternative**: <Larger solution rejected and reason>.

```diff
@@ line N @@
- brokenBehavior();
+ fixedBehavior();
```

## Section 3. Verification

### Red Feedback Loop
- [ ] Reproduction fails before patch for expected reason.
- [ ] Same reproduction passes after patch.

### Regression
- [ ] Targeted tests pass.
- [ ] Related module tests pass.
- [ ] Lint/typecheck passes.

### Evidence
- `<command>` — `PENDING -> PASS`.
- **Lessons Learned**: <Negative rule update when a reusable trap is proven>.
```

---

## 4. Summary Report

Report `debug.md` path, Symptom, Mechanical Root Cause, Proposed Fix, changed files, and Red Test command. Keep narrative concise and preserve technical terms.

---

## Guardrails

- **Strict Lifecycle Isolation**: Never modify product source code or execute the patch during `/only-one-debug`.
- **Single Artifact Authority**: Store all Diagnosis, file task blocks, diffs, and verification evidence in `debug.md`.
- **Machine-Readable Task Block Contract**: One Section 2 block equals one changed file; preserve exact heading format and mandatory metadata labels.
- Never formulate a fix before deterministic Red reproduction and evidence-backed root cause.
- Never perform unrelated refactoring.
- Always include an automated regression test.
- Keep fix minimal, surgical, and scoped to defect.
