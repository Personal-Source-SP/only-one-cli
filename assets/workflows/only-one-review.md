---
description: Run Open CodeReview for branch, uncommitted changes, or commit changes and produce selectable executable findings.
---

## Input

```text
/only-one-review
/only-one-review branch
/only-one-review branch <from> <to>
/only-one-review commit
/only-one-review commit <sha>
/only-one-review changes
```

- No argument means current branch against `main`.
- `branch` means `ocr review --from <from> --to <to> --output <review-path>`.
- `commit` without SHA means latest commit: `ocr review --commit HEAD --output <review-path>`; with SHA: `ocr review --commit <sha> --output <review-path>`.
- `changes` means staged, unstaged, and untracked workspace files: `ocr review --output <review-path>`.
- Never auto-install or configure OCR.

## Role

You are a Senior Engineer normalizing Open CodeReview output into independently executable review findings. OCR is sole finding discovery authority.

## Purpose

Run one requested OCR mode, preserve every OCR finding, investigate each claim, and create one timestamped `only-one/tasks/<YYYYMMDD-HHmmss>-code-review/review.md`. Review never modifies source files.

---

## 1. Skills Catalog

| Skill | Trigger condition (Use When) | Core Purpose (What It Does) |
| :--- | :--- | :--- |
| **`diagnosing-bugs`** | Reproducing or localizing an OCR finding | Prove symptom, root cause, and red feedback loop before proposing a fix. |
| **`doubt-driven-development`** | Validating each OCR claim | Challenge assumptions and reject unproven claims without inventing findings. |
| **`test-driven-development`** | Designing executable finding fixes | Require red reproduction, regression coverage, and fast verification. |
| **`code-simplification`** | Designing patch constraints | Keep fixes minimal, local, and free of speculative code. |
| **`ponytail`** | Before each finding blueprint | Validate reuse-first decisions and stop on material plan conflict. |

---

## 2. Execution Protocol

### Step 1 — Preflight

1. Verify Git repository, requested refs, and SHA.
2. Run `ocr --version`; stop if unavailable. Do not install or configure it.
3. Create output directory and unique review path.
4. Run exactly one OCR command for selected mode. Stop on non-zero exit or empty output; do not publish partial report.

### Step 2 — Normalize findings

Translate narrative to Vietnamese while preserving paths, symbols, commands, snippets, evidence, severity, and technical meaning. Do not add, merge, split, suppress, or reprioritize OCR findings. Preserve OCR severity; missing severity becomes `UNCLASSIFIED`.

For every finding, reproduce the claim and record evidence. Prove Root Cause before marking finding `OPEN`. Unproven claims use `NON_EXECUTABLE` and record the evidence gap. Never modify source code during review.

### Step 3 — Write canonical report

Write only normalized `review.md`, with no raw report sibling:

```markdown
---
status: reviewed
document_type: review
review_mode: branch | changes | commit
from_ref: <ref-or-null>
to_ref: <ref-or-null>
commit: <sha-or-null>
ocr_version: <version>
started_at: <timestamp>
---

# Open CodeReview

## Findings

### OCR-BLOCKER-001 — <title>
- **Status**: `OPEN | NON_EXECUTABLE | SELECTED | IN_PROGRESS | FIXED | FAILED`
- **Severity**: `BLOCKER`
- **Location**: `<exact path:line>`
- **OCR Claim**: <faithful Vietnamese translation>
- **OCR Evidence**: <exact evidence/snippet>

#### Diagnosis
- **Symptom / Expected**: <observed and expected behavior>
- **Reproduction / Red Test**: `<command and result>`
- **Root Cause**: <proven mechanical cause and violated invariant>
- **Fix Constraints**: <preserved behavior and boundaries>

#### File Changes
##### 1. `[MODIFY]` `path/to/file.ts`
- **Status**: `[ ]`
- **Context**: <why this file changes>
- **Target Symbols / AST Seams**: <symbols>
- **Invariants**: <must remain true>
- **Depends On**: `None` or finding task IDs.
- **Fast Test Command**: `<command>`

**Ponytail checklist**
- [ ] Reuse-first checked.
- [ ] Minimal root-cause fix.
- [ ] No unrelated behavior change.

```diff
<unified diff>
```

#### Verification
- [ ] Red reproduction fails before patch.
- [ ] Same reproduction passes after patch.
- [ ] Targeted and regression checks pass.
```

Only proven findings with complete machine-readable file tasks may be `OPEN` and selectable by `/only-one-apply`.

## Guardrails

- OCR remains sole source of findings.
- No source mutation, auto-install, or OCR configuration.
- Do not route findings through `only-one-debug`.
- Keep finding IDs stable within report and preserve one finding as one isolated apply group.
