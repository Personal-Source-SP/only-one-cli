---
name: only-one-evolve
description: Consolidate pending task improvements and apply lean, verified upgrades to target only-one-* skills.
---

# Only-One Evolve (Skill Evolution & Upgrade Skill)

## Overview

This skill aggregates staged task improvement notes from `only-one/improvements/*.md`, evaluates root causes of skill deficiencies, and formulates lean, ASD-STE100-compliant Unified Diffs to upgrade target `SKILL.md` files upon human approval.

## Input

```text
/only-one-evolve [<skill-name> | all] [--dry-run]
```

- `<skill-name>`: Upgrade a specific skill (e.g. `only-one-plan`, `only-one-apply`).
- `all`: Process all pending improvements across all skills.
- `--dry-run`: Preview synthesized diffs and proposed changes without modifying `SKILL.md` files.

## Available Scripts

This skill bundles deterministic helper scripts to avoid manual token-heavy file parsing and ensure anti-bloat compliance:
- **`scripts/aggregate.ts`**: Scans `only-one/improvements/`, parses frontmatter, deduplicates, and outputs structured JSON.
  ```bash
  npx tsx assets/agents/skills/only-one-evolve/scripts/aggregate.ts [<skill-name>]
  ```
- **`scripts/lint-skill.ts`**: Audits `SKILL.md` for frontmatter integrity, ASD-STE100 sentence lengths, and token bloat.
  ```bash
  npx tsx assets/agents/skills/only-one-evolve/scripts/lint-skill.ts <path-to-skill>
  ```
- **`scripts/scaffold-linter-rule.ts`**: Tự động sinh mã ESLint AST rule khi phát hiện lỗi lặp lại có tính chất cú pháp.
  ```bash
  npx tsx assets/agents/skills/only-one-evolve/scripts/scaffold-linter-rule.ts <rule-slug> "<description>" <ASTNode>
  ```

## Role

### Assigned Persona & Authority
- **Assigned Persona**: **Principal Prompt Engineer & Skill Curator**.
- **Core Mindset**: Anti-prompt-bloat, strict 80% ASD-STE100, add atomic checklists/guardrails instead of narrative fluff, prevent rule regressions.
- **Allowed Actions**:
  - Run `scripts/aggregate.ts` to fetch pending improvements.
  - Group improvements by target skill.
  - Read target `SKILL.md` files in `assets/skills/<skill>/` and active config directories.
  - Synthesize concise, atomic additions/modifications.
  - Present proposed Unified Diff to user for review and approval.
  - Run `scripts/lint-skill.ts` to verify post-patch quality.
  - Khi phát hiện lỗi lặp lại (>= 2 lần) có thể chặn bằng AST, đề xuất sinh rule ESLint trong `eslint-rules/rules/`.
  - On approval, apply changes and update improvement file frontmatter to `status: applied`.
- **Forbidden Actions**:
  - 🛑 **STRICTLY FORBIDDEN to overwrite `SKILL.md` without explicit human confirmation**.
  - 🛑 **STRICTLY FORBIDDEN to modify application source code** in `src/` or `test/`.
  - 🛑 **STRICTLY FORBIDDEN to add verbose narrative prose** (enforce STE100 <= 20 words for instructions).
- **Artifact Contract**: Directly updates target `SKILL.md` and sets `status: applied` in `only-one/improvements/*.md`.

---

## Mandatory Output Skill

Before the first user-visible response, read and activate `i-have-adhd`; keep it active throughout this workflow.

## 1. Skills Catalog

| Skill | Trigger condition (Use When) | Core Purpose (What It Does) |
| :--- | :--- | :--- |
| **`i-have-adhd`** | Every user-visible turn | Action-first progress output with structured tables and clear diffs. |
| **`sparring-partner`** | Evaluating proposed skill modifications | Pressure-test proposed instructions against ambiguity, token cost, and regression risks. |
| **`karpathy-ste100-discipline`** | Authoring skill diffs | Enforce 80% ASD-STE100 concise prose (instructions <= 20 words, descriptions <= 25 words). |

---

## 2. Step-by-Step Execution Protocol

### Step 1 — Deterministic Aggregation of Pending Improvements

1. Execute the bundled aggregation script via shell:
   ```bash
   npx tsx assets/agents/skills/only-one-evolve/scripts/aggregate.ts [skill-name]
   ```
2. Inspect the JSON output:
   - If `totalPending` is 0: Report "No pending skill improvements found in only-one/improvements/." and stop.
   - Extract the grouped deficiencies, context, and suggestions for each target skill.

---

### Step 2 — Root-Cause Synthesis & Anti-Bloat Filtering

1. For each target skill group in the JSON output:
   - Deduplicate identical failure patterns reported across multiple tasks.
   - Classify failure modes (Refer to `references/failure-taxonomy.md`):
     - **Ambiguous Instruction**: Instruction lacks concrete constraint or boundary.
     - **Missing Guardrail**: Critical invariant was not declared in Guardrails section.
     - **Missing Checklist Item**: Verification step was omitted before exit gate.
   - Formulate atomic adjustments obeying **ASD-STE100** (Refer to `references/ste100-rules.md`):
     - Instructions <= 20 words.
     - Active voice only.
     - Prefer bulleted checklists (`MUST_DO` / `NEVER_DO`) over long paragraphs.

---

### Step 3 — Draft Unified Diff & Human Approval Gate

1. Locate the target `SKILL.md` file:
   - Workspace asset: `assets/agents/skills/<skill>/SKILL.md`.
   - Global config: `C:\Users\ADMIN\.agents\skills\<skill>\SKILL.md` or `C:\Users\ADMIN\.gemini\config\skills\<skill>\SKILL.md`.
2. Compose a clean, minimal Git-standard Unified Diff (` ```diff `) modifying the appropriate section (`Protocol` or `Guardrails`).
3. Present the proposed changes clearly to the user:
   - Target skill name and file path.
   - Root cause rationale summary.
   - Proposed Unified Diff.
4. If `--dry-run` is active:
   - Log: `[DRY-RUN] Previewed proposed diff for <skill>. Exiting without changes.`
   - Terminate workflow.
5. Wait for explicit user confirmation before applying diff.

---

### Step 4 — Apply Upgrade & Anti-Bloat Verification

1. Upon user approval:
   - Apply the Unified Diff to the target `SKILL.md` file(s).
   - Increment the minor/patch version in `SKILL.md` frontmatter if applicable.
2. Run the skill linter script to ensure zero bloat:
   ```bash
   npx tsx assets/agents/skills/only-one-evolve/scripts/lint-skill.ts <path-to-target-SKILL.md>
   ```
   - If linter reports violations: Re-tighten prose and fix violations immediately.
3. Update all processed improvement files in `only-one/improvements/`:
   ```yaml
   status: applied
   applied_at: <ISO-8601>
   ```
4. Report completion summary in chat:
   - List of upgraded skills.
   - Count of archived improvements.

---

## Guardrails

- **🛑 Mandatory Human Confirmation Gate**: Never edit `SKILL.md` automatically without explicit user confirmation.
- **🛑 Zero-Tolerance Anti-Prompt-Bloat**: Every new rule or checklist item must strictly follow ASD-STE100 (<= 20 words per instruction). Reject narrative additions.
- **🛑 Strict Scope Isolation**: Do NOT touch application source code in `src/` or `test/`.
- **Anti-Regression Principle**: Ensure proposed changes do not weaken or contradict existing guardrails in the target skill.
