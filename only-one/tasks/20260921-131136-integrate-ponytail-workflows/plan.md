---
status: done
slug: integrate-ponytail-workflows
started_at: 2026-09-21
completed_at: 2026-09-21
pr_url: ~
branch: ~
---

# Plan: Integrate Ponytail Policy into Core Lifecycle Workflows

## Section 1. Current State

- Five core workflows enforce partial Reuse-First/YAGNI rules, but no shared ordered decision ladder or deterministic plan-conflict semantics exists.
- `only-one-idea.md` lacks an explicit ban on source code, pseudocode, unified diffs, symbols, and file-level implementation.
- `only-one-plan.md` and `only-one-debug.md` provide file diffs but no evidence-backed Ponytail checklist beside each file.
- `only-one-apply.md` checks existing helpers during execution but does not stop before edits when an approved blueprint conflicts with reuse or safety policy.
- `only-one-flash.md` audits shared code but does not expose its selected reuse target or justified new-code decision.
### Invariants

- Preserve lifecycle boundaries, approval gates, artifact locations, Task Matrix schema, dependency order, Fast Test Commands, and verification evidence.
- Security, accessibility, boundary validation, correctness, error handling, data-loss protection, and required tests override minimization.
- Keep `concept.md` conceptual; keep `plan.md`/`debug.md` executable and diff-centric.
- Approved plan/debug remains authoritative. Material conflict requires plan revision and explicit re-approval.
- Keep asset manifests and `.agents/workflows` copies synchronized; bump every changed workflow version. Ponytail uses upstream GitHub content, so no local skill asset/version is created.

## Section 2. Technical Contracts & AST Seams

No new TypeScript type is needed. Existing `SkillManifest` and `WorkflowManifest.requiredSkills` support an upstream GitHub `ponytail` skill.

### Shared policy contract

```yaml
---
name: ponytail
source: DietrichGebert/ponytail
sourceType: github
skillPath: skills/ponytail/SKILL.md
---
```

Decision order: necessity → codebase reuse → stdlib → native platform/framework → installed dependency → smaller existing-code edit → minimum new code.

### Per-file planning contracts

```markdown
**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched and reuse decision recorded.
- [x] Stdlib, native platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: <reuse target or evidence-backed reason for new code>.
- **Rejected alternative**: <larger solution and reason rejected>.
```

```markdown
**Test checklist**
- [x] Existing fixture/helper/test pattern reused where applicable.
- [x] No duplicate setup.
- [x] Cases cover only changed behavior/regression.
- [x] Existing test toolchain is sufficient.
- **Decision**: <suite extension or reason for new test file>.
- **Rejected alternative**: <unnecessary test abstraction/setup>.
```

### Apply conflict contract

```markdown
## Ponytail Plan Conflict
- **Task / File**: <matrix order and path>
- **Violated policy**: <decision rung or safety invariant>
- **Conflicting blueprint**: <plan checklist/diff excerpt>
- **Minimal proposal**: <replacement direction>
- **Acceptance impact**: <none or explicit change>
- **Required action**: Revise and re-approve the plan before execution resumes.
```

### AST seams

- `SKILLS` in `assets/skills/index.ts`: register upstream `DietrichGebert/ponytail` using `skills/ponytail/SKILL.md`.
- `WORKFLOWS` in `assets/workflows/index.ts`: add `ponytail` to five workflows and bump versions.
- Five asset workflows: add a mandatory stage-specific `ponytail` row inside `## 1. Skills Catalog`, plus stage-specific contract.
- Five `.agents/workflows/*.md` copies: mirror canonical assets byte-for-byte.
- `skill-registry.test.ts`: lock GitHub source metadata and assert no local shadow copy exists. Workflow-specific checklist/conflict behavior remains in workflow contracts layered over upstream Ponytail.
- `workflow-registry.test.ts`: lock dependency, exact Skills Catalog row, and stage-specific terms.
- `src/core/assets/sync.ts`: unchanged; recursive local-skill copy already exists.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes

```text
assets/
├── skills/
│   └── [MODIFY] index.ts
└── workflows/
    ├── [MODIFY] index.ts
    ├── [MODIFY] only-one-idea.md
    ├── [MODIFY] only-one-plan.md
    ├── [MODIFY] only-one-debug.md
    ├── [MODIFY] only-one-apply.md
    └── [MODIFY] only-one-flash.md
.agents/workflows/
├── [MODIFY] only-one-idea.md
├── [MODIFY] only-one-plan.md
├── [MODIFY] only-one-debug.md
├── [MODIFY] only-one-apply.md
└── [MODIFY] only-one-flash.md
test/core/
├── [MODIFY] skill-registry.test.ts
└── [MODIFY] workflow-registry.test.ts
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `assets/skills/index.ts` | `SKILLS` GitHub source metadata | None | `npm test -- test/core/skill-registry.test.ts` |
| **3** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-idea.md` | Role; catalog; Step 2; concept template; guardrails | Order 1 | `npm test -- test/core/workflow-registry.test.ts` |
| **4** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-plan.md` | Research gate; catalog; Section 4 template; guardrails | Order 1 | `npm test -- test/core/workflow-registry.test.ts` |
| **5** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-debug.md` | Catalog; Step 4; Section 4 template; guardrails | Order 1 | `npm test -- test/core/workflow-registry.test.ts` |
| **6** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-apply.md` | Catalog; preflight conflict gate; per-file revalidation | Order 1 | `npm test -- test/core/workflow-registry.test.ts` |
| **7** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-flash.md` | Catalog; ladder; Flash Plan decision; revalidation | Order 1 | `npm test -- test/core/workflow-registry.test.ts` |
| **8** | `[x]` | `[MODIFY]` | `assets/workflows/index.ts` | Five versions and `requiredSkills` | Orders 3–7 | `npm test -- test/core/workflow-registry.test.ts` |
| **9** | `[x]` | `[MODIFY]` | `.agents/workflows/only-one-idea.md` | Mirror canonical asset | Order 3 | `cmp assets/workflows/only-one-idea.md .agents/workflows/only-one-idea.md` |
| **10** | `[x]` | `[MODIFY]` | `.agents/workflows/only-one-plan.md` | Mirror canonical asset | Order 4 | `cmp assets/workflows/only-one-plan.md .agents/workflows/only-one-plan.md` |
| **11** | `[x]` | `[MODIFY]` | `.agents/workflows/only-one-debug.md` | Mirror canonical asset | Order 5 | `cmp assets/workflows/only-one-debug.md .agents/workflows/only-one-debug.md` |
| **12** | `[x]` | `[MODIFY]` | `.agents/workflows/only-one-apply.md` | Mirror canonical asset | Order 6 | `cmp assets/workflows/only-one-apply.md .agents/workflows/only-one-apply.md` |
| **13** | `[x]` | `[MODIFY]` | `.agents/workflows/only-one-flash.md` | Mirror canonical asset | Order 7 | `cmp assets/workflows/only-one-flash.md .agents/workflows/only-one-flash.md` |
| **14** | `[x]` | `[MODIFY]` | `test/core/skill-registry.test.ts` | Ponytail GitHub-source contract | Order 1 | `npm test -- test/core/skill-registry.test.ts` |
| **15** | `[x]` | `[MODIFY]` | `test/core/workflow-registry.test.ts` | Five-workflow dependency, catalog, and policy contract | Orders 3–13 | `npm test -- test/core/workflow-registry.test.ts` |

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `assets/skills/index.ts`

> **Action**: Register Ponytail directly from its GitHub repository and canonical skill path.

**Ponytail checklist**
- [x] Required for installation/dependency resolution.
- [x] Existing GitHub source mechanism is reused.
- [x] Upstream already ships canonical `skills/ponytail/SKILL.md`.
- [x] No local shadow copy, loader change, or dependency is introduced.
- **Decision**: Register `DietrichGebert/ponytail` with `skillPath: skills/ponytail/SKILL.md`.
- **Rejected alternative**: Maintain a local forked `SKILL.md`; rejected because it would drift from upstream.

```diff
@@ -220,6 +220,14 @@ export const SKILLS: SkillManifest[] = [
     // --- 6. Local Project Specific Skills ---
+    {
+        name: 'ponytail',
+        version: '0.0.1',
+        description: 'Stop at the first sufficient solution rung while preserving safety.',
+        source: 'DietrichGebert/ponytail',
+        sourceType: 'github',
+        skillPath: 'skills/ponytail/SKILL.md',
+    },
```

### 3. `[MODIFY]` `assets/workflows/only-one-idea.md`

> **Action**: Use Ponytail for scope reduction; ban code-level concept content.

**Ponytail checklist**
- [x] Required by concept boundary.
- [x] Discovery/options/domain modeling retained.
- [x] No new artifact or phase.
- [x] Full discovery quality preserved.
- **Decision**: Add catalog/stage rule and strict prohibited-content guardrail.
- **Rejected alternative**: Remove conceptual architecture; valid idea output still needs options/models.

```diff
@@ -23,6 +23,7 @@
 - Activate and follow the Define skills (...).
+- Apply `ponytail` only after problem clarity to reject unnecessary scope, never to shorten discovery.
@@ -42,6 +43,7 @@
+| **`ponytail`** | After Phase 1 clarity | Remove unnecessary scope without code-level design. |
@@ -66,6 +68,8 @@
 ### Step 2 — Solution Architecture, UI Mockup & Trade-offs
+Keep solutions conceptual. Do not emit source code, pseudocode, unified diffs,
+symbol signatures, file paths, or file-level implementation instructions.
@@ -111,7 +115,7 @@
-- **Workflow / Logic Flow**: <...>.
+- **Conceptual Flow / Domain Model**: <Business/domain flow without code symbols or file paths>.
@@ -132,6 +136,7 @@
+- **Strict Concept Boundary**: Never include code, pseudocode, diffs, symbols, paths, or file-level design.
```

### 4. `[MODIFY]` `assets/workflows/only-one-plan.md`

> **Action**: Require Ponytail evidence beside every Section 4 file.

**Ponytail checklist**
- [x] Required for deterministic apply validation.
- [x] Existing research/diff structure extended.
- [x] No new plan section.
- [x] Test uses agreed short contract.
- **Decision**: Add skill to pre-diff gate and per-file template.
- **Rejected alternative**: One global checklist; lacks file-specific evidence.

```diff
@@ -75,6 +75,7 @@
+| **`ponytail`** | Before each file-level design/diff | Select first sufficient rung and record evidence. |
@@ -65,6 +66,9 @@
+   - Run `ponytail` for every target file after reading current flow.
+   - Record reuse target or evidence-backed reason for new code.
+   - Safety and acceptance criteria override minimization.
@@ -151,6 +155,21 @@
 > **Action**: <...>.
+
+**Ponytail checklist**
+- [x] Required by acceptance criteria.
+- [x] Existing implementation searched; platform/dependencies considered.
+- [x] No duplicate logic or speculative extension point.
+- [x] Minimum diff preserves correctness and safety.
+- **Decision**: <reuse target or reason for new code>.
+- **Rejected alternative**: <larger solution rejected>.
+
+For test files use **Test checklist** covering fixture/helper reuse, no duplicate setup,
+changed behavior only, existing toolchain, Decision, and Rejected alternative.
```

### 5. `[MODIFY]` `assets/workflows/only-one-debug.md`

> **Action**: Run Ponytail after root-cause proof; require test/fix file evidence.

**Ponytail checklist**
- [x] Prevents speculative fixes without biasing RCA.
- [x] Red loop and lifecycle isolation retained.
- [x] Shared checklist contract reused.
- [x] Minimality never weakens evidence.
- **Decision**: Add Ponytail after Step 3 and beside each Section 4 file.
- **Rejected alternative**: Run before reproduction; risks symptom patching.

```diff
@@ -47,6 +47,7 @@
+| **`ponytail`** | After root cause is proven | Select smallest root-cause fix and record per-file evidence. |
@@ -77,6 +78,8 @@
 ### Step 4 — Formulate Proposed Solution
+0. Run `ponytail` only against the proven root cause and violated invariants.
+   Never weaken reproduction evidence or regression coverage.
@@ -142,6 +145,9 @@
+Add the Test checklist beside every regression-test file and the Ponytail checklist beside
+every production/config/docs file. Decision and Rejected alternative are mandatory.
```

### 6. `[MODIFY]` `assets/workflows/only-one-apply.md`

> **Action**: Validate plan evidence before status mutation; hard-stop on conflict.

**Ponytail checklist**
- [x] Prevents silent approved-plan divergence.
- [x] Task Matrix/apply loop retained.
- [x] No runtime validator needed.
- [x] Safety conflict always blocks.
- **Decision**: Add document preflight and per-file stale-plan revalidation.
- **Rejected alternative**: Silently simplify blueprint; bypasses approval.

```diff
@@ -46,6 +46,7 @@
+| **`ponytail`** | Preflight and before each edit | Validate approved decisions; stop on material conflict. |
@@ -83,6 +84,20 @@
+### Step 1c — Ponytail Plan Preflight (Before Status Mutation)
+1. Read `ponytail`; locate each pending file checklist.
+2. Cross-check Decision, diff, current repository state, and safety rules.
+3. On contradiction, ignored sufficient reuse, unapproved design change, missing material
+   decision, or safety violation: do not change status or source.
+4. Emit `Ponytail Plan Conflict` with task/file, violated policy, blueprint, minimal proposal,
+   acceptance impact, and required revision/re-approval. Stop whole execution.
@@ -109,6 +124,8 @@
+    - Re-run the checklist against the current file for stale-plan drift.
+    - On conflict, reset only current row marker, report completed rows, and stop before edit.
```

### 7. `[MODIFY]` `assets/workflows/only-one-flash.md`

> **Action**: Run ladder directly and expose concise per-file decision.

**Ponytail checklist**
- [x] Needed because Flash has no disk plan.
- [x] Review Gate and verification retained.
- [x] Evidence stays in existing chat plan.
- [x] Revalidation catches post-approval drift.
- **Decision**: Add per-file `Ponytail Decisions` and pre-edit rerun.
- **Rejected alternative**: Full checklist in chat; excessive for Flash.

```diff
@@ -38,6 +38,7 @@
+| **`ponytail`** | Step 1 and before approved edits | Select first sufficient rung; expose concise decision. |
@@ -51,6 +52,8 @@
+   - Run the full `ponytail` ladder after tracing the affected flow.
+   - Capture a reuse target or evidence-backed new-code reason per file.
@@ -80,6 +83,7 @@
+- **Ponytail Decisions**: `<file>: reuse <symbol>` or `<file>: new code because <evidence>`
@@ -96,6 +100,8 @@
+   - Re-run the ladder. If the approved decision materially changed, stop and emit a revised
+     Flash Plan for confirmation instead of editing.
```

### 8. `[MODIFY]` `assets/workflows/index.ts`

> **Action**: Add dependencies and bump versions.

**Ponytail checklist**
- [x] Required by manifest synchronization rule.
- [x] Existing mechanism reused; no schema change.
- [x] Decimal versions retained.
- **Decision**: Add `ponytail`; bump idea/debug `0.0.6`, plan/apply `0.0.7`, flash `0.0.5`.
- **Rejected alternative**: No version bump; violates asset gate.

```diff
-        version: '0.0.5', // idea
+        version: '0.0.6',
+            'ponytail',
-        version: '0.0.6', // plan
+        version: '0.0.7',
+            'ponytail',
-        version: '0.0.6', // apply
+        version: '0.0.7',
+            'ponytail',
-        version: '0.0.5', // debug
+        version: '0.0.6',
+            'ponytail',
-        version: '0.0.4', // flash
+        version: '0.0.5',
+            'ponytail',
```

### 9–13. `[MODIFY]` `.agents/workflows/*.md`

> **Action**: Mirror each changed canonical workflow.

**Ponytail checklist**
- [x] Required by installed-copy synchronization.
- [x] Canonical content reused byte-for-byte.
- [x] No independent edits.
- [x] `cmp` verifies zero drift.
- **Decision**: Copy five canonical files after asset edits pass.
- **Rejected alternative**: Hand-edit copies; drift-prone.

```diff
# cp assets/workflows/<name>.md .agents/workflows/<name>.md
# Verify each pair with cmp.
```

### 14. `[MODIFY]` `test/core/skill-registry.test.ts`

> **Action**: Lock upstream GitHub source metadata and prevent a local shadow copy.

**Test checklist**
- [x] Existing registry setup reused.
- [x] No duplicate fixture/helper.
- [x] Covers repository, canonical path, source type, and absent local copy.
- [x] Vitest sufficient.
- **Decision**: Extend existing remote-skill registry test pattern.
- **Rejected alternative**: Test upstream prose content locally; brittle and duplicates upstream ownership.

```diff
+    it('registers ponytail from its canonical GitHub skill path without a local copy', () => {
+        const skill = SKILLS.find(({ name }) => name === 'ponytail');
+        expect(skill).toMatchObject({
+            version: '0.0.1',
+            source: 'DietrichGebert/ponytail',
+            sourceType: 'github',
+            skillPath: 'skills/ponytail/SKILL.md',
+        });
+        expect(existsSync(join(skillsDir, 'ponytail'))).toBe(false);
+    });
```

### 15. `[MODIFY]` `test/core/workflow-registry.test.ts`

> **Action**: Lock five stage-specific contracts.

**Test checklist**
- [x] Existing core-workflow loop reused.
- [x] No duplicate setup.
- [x] Assertions cover new contract only.
- [x] Vitest sufficient.
- **Decision**: Add one dependency/term-map test.
- **Rejected alternative**: Full Markdown snapshots; noisy and brittle.

```diff
+    it('requires ponytail in each Skills Catalog with stage-specific wording', () => {
+        const contracts = {
+            'only-one-idea': ['| **`ponytail`** | After Phase 1 clarity |', 'without code-level design'],
+            'only-one-plan': ['| **`ponytail`** | Before each file-level design/diff |', 'first sufficient rung'],
+            'only-one-debug': ['| **`ponytail`** | After root cause is proven |', 'smallest root-cause fix'],
+            'only-one-apply': ['| **`ponytail`** | Preflight and before each edit |', 'stop on material conflict'],
+            'only-one-flash': ['| **`ponytail`** | Step 1 and before approved edits |', 'concise decision'],
+        };
+        for (const [name, terms] of Object.entries(contracts)) {
+            const workflow = WORKFLOWS.find((item) => item.name === name);
+            const content = readFileSync(join(workflowsDir, `${name}.md`), 'utf8');
+            expect(workflow?.requiredSkills).toContain('ponytail');
+            expect(content).toContain('## 1. Skills Catalog');
+            for (const term of terms) expect(content).toContain(term);
+        }
+    });
+```

## Section 5. Test Cases & Verification

### Automated Tests

- `[x]` `npm test -- test/core/skill-registry.test.ts` — 6 tests passed.
- `[x]` `npm test -- test/core/workflow-registry.test.ts` — 6 tests passed.
- `[x]` Five `cmp assets/workflows/<name>.md .agents/workflows/<name>.md` checks — pass.
- `[x]` `npm test` — 55 test files passed, 238 tests passed, 4 skipped.
- `[x]` `npm run build` — pass; Prettier validation pass.

### Manual Checks

- `[x]` Skill sync installs Ponytail from `DietrichGebert/ponytail` path `skills/ponytail/SKILL.md` with no local asset copy.
- `[x]` Idea produces models/options but no code, pseudocode, diff, symbols, or paths.
- `[x]` Plan gives every file correct production/test checklist beside description.
- `[x]` Debug applies Ponytail only after root-cause evidence.
- `[x]` Apply rejects a contradictory plan before source edit/status mutation.
- `[x]` Flash exposes per-file decisions and still stops at Review Gate.
- `[x]` No runtime dependency, loader change, extra artifact, or consumer product source change.
