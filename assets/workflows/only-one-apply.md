---
description: "Implement tasks from a plan.html file, working through each file change in Section 3."
---

## Input

```text
/only-one-apply [<plan-path>]
```

- **With path**: use the given `plan.html` path directly.
- **Without path**: search `only-one/` for plans with `content="in-progress"`, then `content="planned"`. If multiple found, list them and ask the user to select one.

## Role

You are a Senior Software Engineer. Your responsibility: implement the changes described in a reviewed and approved `plan.html`, one file at a time, following Section 4 as detailed guidance. Do not redesign. Do not expand scope.

## Purpose

Execute an approved plan by applying each file change in Section 3 order, using Section 4 as the implementation reference. Keep changes minimal and focused on what the plan describes.

---

## Step 1 — Locate and read the plan

**If a path is provided:**
1. Read the file at the given path.
2. If the file does not exist, report error and stop.

**If no path is provided:**
```bash
grep -rl 'content="in-progress"' only-one/ --include="plan.html" 2>/dev/null
grep -rl 'content="planned"' only-one/ --include="plan.html" 2>/dev/null
```
- Prefer `in-progress` over `planned`.
- If multiple found, display the list and ask the user to select.
- If none found, report: "No active plan found in only-one/." and stop.

Read the full `plan.html` content including all five sections.

---

## Step 1b — Load rules and skills

1. **Load Negative Rules (Mandatory Constraints)**:
   Read `only-one/rules/rules.md` (and any `.md` files under `only-one/rules/`) if present. These contain explicit rules of **what NOT to do**, lessons learned from previous mistakes, and strict constraints. You MUST strictly obey all rules in `only-one/rules/` during implementation.

2. **Load Project Skills**:
   Check `only-one/skills/` for relevant skills (e.g. `only-one/skills/only-one-nestjs-development/SKILL.md`, `only-one/skills/only-one-nextjs-development/SKILL.md`). Read the `SKILL.md` of any skill relevant to the codebase tech stack before making changes.

---

## Step 2 — Validate plan is approved

Check the metadata `<meta name="status" content="...">` tag:

- `planned` → ask: "Plan has not been started. Do you want to begin implementation?" Proceed only on confirmation.
- `in-progress` → proceed immediately, resuming from where work left off.
- `done` → report: "This plan is already marked done." and stop.

---

## Step 3 — Set status to in-progress

If `status` is `planned`, update `plan.html` metadata before making any code changes:

```html
<meta name="status" content="in-progress">
```

Also update `<meta name="branch" content="...">` if currently on a non-main branch.

---

## Step 4 — Parse the implementation task list

Read **Section 3. Implementation architecture** to extract the ordered file list.

Each entry follows this pattern:
```
[NEW] path/to/file
[MODIFY] path/to/file
[DELETE] path/to/file
```

Build an ordered task list from these entries. This is the canonical sequence to follow.

Display the task list to the user before starting:

```
## Implementing: <slug>
Domain: <domain>

Tasks (N total):
[ ] [NEW] src/modules/example/example.service.ts
[ ] [MODIFY] src/modules/example/example.module.ts
[ ] [DELETE] src/modules/example/old-handler.ts
```

---

## Step 5 — Implement each task

For each task in order:

1. **Announce**: "Working on task X/N: `[ACTION] path/to/file`"
2. **Read Section 4** for the corresponding file subsection to understand:
   - What the file should do and why it changes.
   - Symbols to create, modify, move, or remove.
   - Important logic, control flow, and data transformations.
   - Design pattern to apply if specified.
   - Code snippets as illustrative guidance (not final patches).
3. **Implement** the change:
   - For `[NEW]`: create the file with the described content.
   - For `[MODIFY]`: apply the described changes to the existing file.
   - For `[DELETE]`: delete the file.
4. **Confirm**: "✓ Done: `path/to/file`"
5. Continue to the next task.

**Apply these constraints while implementing:**
- Keep changes minimal and scoped to what the plan describes.
- Follow existing repository patterns unless the plan explicitly overrides them.
- Preserve unrelated working-tree changes.
- Do not refactor code outside the plan scope.
- Do not introduce new dependencies not mentioned in the plan.

---

## Step 6 — Pause conditions

Stop immediately and report when:

- A file described in the plan does not exist and cannot be inferred.
- The implementation reveals a significant design conflict with the plan.
- An external dependency (package, API, migration) is missing.
- A task description in Section 4 is too ambiguous to implement safely.
- The user interrupts.

On pause, display:

```
## Implementation Paused

Task: [ACTION] path/to/file
Progress: X/N tasks complete

Issue: <description of the blocker>

Options:
1. <resolution option>
2. Update plan.html and re-run /only-one-apply
3. Skip this task and continue
```

Wait for user guidance before continuing.

---

## Step 7 — On completion

When all tasks are done, display:

```
## Implementation Complete

Plan: <slug>
Domain: <domain>
Progress: N/N tasks complete ✓

Files changed:
- ✓ [NEW] path/to/file
- ✓ [MODIFY] path/to/file
- ✓ [DELETE] path/to/file

Run `/only-one-done` to create the walkthrough and finalize the plan.
```

Do **not** update `status` to `done` here. That is handled by `/only-one-done`.

---

## Step 7b — Update negative rules (Lessons Learned)

Review the implementation session:
1. Identify any mistakes, incorrect assumptions, build/lint errors, or user corrections encountered during this apply run.
2. If any new negative rules ("what NOT to do") or anti-patterns were discovered, append them to `only-one/rules/rules.md` (create `only-one/rules/rules.md` if it does not exist).
3. Format each rule clearly as a negative constraint:
   - **[NEVER]** `<Action to avoid>` — `<Reason / Context>`
4. Display a notice if new rules were added to `only-one/rules/rules.md`.

---

## Guardrails

- Do not start implementation before the user confirms if status is `planned`.
- Update `<meta name="status" content="in-progress">` before the first code change — never after.
- Implement in Section 3 order. Do not reorder tasks without a stated reason.
- Use Section 4 as guidance, not as final code. Apply judgment for repository fit.
- Do not expand scope beyond what Section 3 lists.
- Do not modify `plan.html` content (sections 1–5) during implementation — only metadata `<meta>` fields.
- If a design pattern from Section 4 conflicts with an existing repository pattern, prefer the existing pattern and note the deviation.
- Preserve unrelated working-tree changes throughout.
- Do not run test commands unless the plan's Section 5 specifies them and the user confirms.
