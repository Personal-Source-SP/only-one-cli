---
description: "Implement tasks from a plan.md file, working through each file change according to task dependencies in Section 3."
---

## Input

```text
/only-one-apply [<task-folder> | <plan-path>]
```

- **With `<task-folder>` or `<plan-path>`**: use the given task folder (e.g., `only-one/tasks/20260819-142500-soft-delete-machine/plan.md`) directly.
- **Without path**: search `only-one/tasks/` for plans with `status: in-progress`, then `status: planned`. If multiple found, list them and ask the user to select one.

## Role

You are a **Senior Software Engineer**. Your core responsibilities:
- Implement the changes described in a reviewed and approved `plan.md`, one file at a time, strictly following Section 4 as detailed blueprint guidance and observing `depends_on` ordering.
- Apply execution and quality disciplines (`incremental-implementation`, `test-driven-development`, `code-simplification`, `diagnosing-bugs`).
- Keep changes minimal, scoped, and verified without unapproved architectural redesigns or scope expansion.

## Purpose

Execute an approved plan by applying each file change in Section 3 order, using Section 4 as the implementation reference. Verify all test cases from Section 5 and produce a comprehensive `walkthrough.md`.

---

## 1. Skills Catalog (Build & Execution Disciplines)

Activate and apply these skills throughout the implementation workflow:

| Skill | Trigger condition (Use When) | Core Purpose (What It Does) |
| :--- | :--- | :--- |
| **`context-engineering`** | Step 1b (Loading rules and skills) | Feed only the necessary, high-signal context into working memory (Negative Rules in `rules.md` and Tech Skills) before modifying code. |
| **`incremental-implementation`** | Step 5 (Applying file changes) | Apply changes in **thin vertical slices** (file-by-file), enforcing safe parameter defaults, dependency order, and rollback-friendly modifications. |
| **`code-simplification`** | Step 5b (Quality Gate 1) | Audit new/modified code against YAGNI: eliminate dead code, remove orphan imports, avoid speculative wrappers, and keep cognitive load low. |
| **`test-driven-development`** | Step 6b (Verification) | Enforce the **Beyoncé Rule** (*"If you changed the behavior, you must have a test proving it"*), structure DAMP tests, and execute test suites. |
| **`diagnosing-bugs`** | When any compiler, lint, or test failure occurs | Apply a **disciplined Red Feedback Loop** (Reproduce Red $\rightarrow$ Localize $\rightarrow$ Hypothesize $\rightarrow$ Instrument $\rightarrow$ Fix) instead of blind guess-and-patch. |
| **`prototype`** | Uncertain UI or logic behavior during implementation | Build a quick throwaway spike/prototype to resolve implementation doubt. |
| **`wizard`** | Required human-only configuration (OAuth, secrets, DB migration) | Generate an interactive bash script walking the human through steps they must perform. |

---

## 2. Step-by-Step Execution Protocol

### Step 1 — Locate and read the plan

**If a path or task folder is provided:**
1. Read the `plan.md` file at the given path/folder.
2. If the file does not exist, report error and stop.

**If no path is provided:**
```bash
grep -rl "status: in-progress" only-one/tasks/ --include="plan.md" 2>/dev/null
grep -rl "status: planned" only-one/tasks/ --include="plan.md" 2>/dev/null
```
- Prefer `in-progress` over `planned`.
- If multiple found, display the list and ask the user to select.
- If none found, report: "No active plan found in only-one/tasks/." and stop.

Read the full `plan.md` content including all sections.

---

### Step 1b — Load rules and skills (`context-engineering`)

1. **Load Negative Rules (Mandatory Constraints)**:
   Read `only-one/rules.md` if present. Strictly obey all negative constraints and past lessons learned.
2. **Load Project Tech Skills**:
   Check `only-one/skills/` (and `.agents/skills/`) for relevant skills. Read their `SKILL.md` before making code changes.

---

### Step 2 — Validate plan is approved

Check the frontmatter `status` field:
- `planned` → ask: "Plan has not been started. Do you want to begin implementation?" Proceed only on confirmation.
- `in-progress` → proceed immediately, resuming from where work left off.
- `done` → report: "This plan is already marked done." and stop.

---

### Step 3 — Set status to in-progress

If `status` is `planned`, update `plan.md` frontmatter before making any code changes:
```yaml
status: in-progress
```

---

### Step 4 — Parse the implementation task list & dependencies

Read **Section 3. Implementation architecture** to extract the ordered file list and verify that all prerequisite dependencies (`depends_on`) are satisfied before modifying each file.

---

### Step 5 — Apply file changes incrementally (`incremental-implementation`)

For each file in the ordered list:
1. Verify the prerequisite file has been modified and verified.
2. Apply changes according to Section 4 specifications.
3. Apply **Quality Gate (Simplicity & YAGNI)**:
   - File length under 500 lines.
   - No dead imports or speculative abstractions.
   - Clean variable names and early return guards.

---

### Step 6 — Verification (`test-driven-development`)

1. Execute test suite:
   ```bash
   npm test
   npm run lint
   ```
2. Verify all test cases from **Section 5** in `plan.md`.
3. If tests fail, activate `diagnosing-bugs` (build red loop $\rightarrow$ instrument $\rightarrow$ fix).

---

### Step 7 — Author `walkthrough.md` & Mark Plan Done

1. Create `only-one/tasks/<task-folder>/walkthrough.md` summarizing:
   - Files changed.
   - Test results and verification evidence.
   - Manual verification steps.
2. Update `plan.md` frontmatter:
   ```yaml
   status: done
   completed_at: <YYYY-MM-DD>
   ```

---

## Guardrails

- Do not implement unapproved changes beyond `plan.md`.
- Never skip tests or remove existing working tests to force a pass.
- Maintain Beyoncé Rule at all times.
