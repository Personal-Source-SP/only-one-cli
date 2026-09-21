---
status: fixed
slug: combo-missing-adhd-output-skill
started_at: 2026-09-21 11:15:00
completed_at: 2026-09-21 11:18:46
reproduction_test: npm test -- test/core/combo.test.ts
---

# Debug: Combo Manifests Missing `i-have-adhd`

## Section 1. Symptom & Red Feedback Loop

- **Symptom**: `i-have-adhd` exists in `assets/skills/index.ts` and targeted workflow `requiredSkills`, but `assets/combos/index.ts` omits it from `frontend-flow`, `backend-flow`, and `full-sdlc-flow`.
- **Impact**: Combo installation does not explicitly declare this remote presentation skill.
- **Red Test Case**: Regression assertions requiring `i-have-adhd` in all three core development combos fail against current manifests.
- **Reproduction command**: `npm test -- test/core/combo.test.ts`

## Section 2. Root Cause Analysis & Proposed Solution

### 2.1 Mechanical Root Cause & Invariants

- **Mechanical Root Cause**: Previous implementation updated `SKILLS` and `WORKFLOWS` but omitted `COMBOS.skills` arrays.
- **Evidence**: `assets/combos/index.ts` has no `i-have-adhd` entry; all three combos include core SDLC workflows.
- **Violated Invariants**: Combo declarations must include cross-cutting skills required by bundled workflows; combo versions must bump when manifest content changes.

### 2.2 Proposed Solution & Target Source Structure

- **Core Fix Mechanism**: Add `i-have-adhd` once to each core development combo. Preserve existing domain skills and order. Bump affected combo patch versions.

```text
assets/
├── [MODIFY] combos/index.ts            # Add skill to three combos; bump versions
└── [MODIFY] ../test/core/combo.test.ts # Add regression coverage
```

## Section 3. Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `assets/combos/index.ts` | Three core combo skill arrays | `None` | `npm test -- test/core/combo.test.ts` — PASS (15 tests) |
| **2** | `[x]` | `[MODIFY]` | `test/core/combo.test.ts` | Prebuilt combo completeness | `Order 1` | `npm test -- test/core/combo.test.ts` — PASS (15 tests) |

## Section 4. Code Changes

### 1. `[MODIFY]` `assets/combos/index.ts`

- Add `i-have-adhd` to `frontend-flow`, `backend-flow`, and `full-sdlc-flow`.
- Bump each version from `0.0.5` to `0.0.6`.

```diff
@@ three core development combos
- version: '0.0.5'
+ version: '0.0.6'
  skills: [
+     'i-have-adhd',
      'grill-with-docs',
```

### 2. `[MODIFY]` `test/core/combo.test.ts`

- Add regression guard proving each core combo explicitly includes the presentation skill.

```diff
+it.each(['frontend-flow', 'backend-flow', 'full-sdlc-flow'])('includes i-have-adhd in %s', (comboId) => {
+  const combo = COMBOS.find(({ id }) => id === comboId);
+  expect(combo?.skills).toContain('i-have-adhd');
+});
```

## Section 5. Verification & Regression Guard

- `[ ]` `npm test -- test/core/combo.test.ts`: `PENDING -> PASS`
- `[ ]` `npm test -- test/core/assets/version-gate.test.ts`: `PENDING -> PASS`
- `[ ]` `npm run build`: `PENDING -> PASS`

**Review gate**: `/only-one-debug` stops here. Apply after review with `/only-one-apply only-one/tasks/20260921-111500-debug-combo-missing-adhd-output-skill/debug.md`.
