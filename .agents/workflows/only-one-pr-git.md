---
description: Create or update a GitHub PR from current branch with mandatory 5-axis pre-review quality gate using GitHub MCP.
---

## Input

```text
/only-one-pr-git [--branch <base-branch>] [--tag <conventional-type>]
```

- `--branch`: Base branch to merge into. Default: `main`.
- `--tag`: Conventional Commit type for PR title. Default: `feat`.
- Supported tags: `feat`, `fix`, `refactor`, `style`.
- Reject bracketed or uppercase tags (e.g. `[FEAT]`, `FEAT`).

## Role

You are a **Lead Release Engineer**. Your core responsibilities:
- Execute a mandatory **5-Axis Pre-PR Review Gate** (`/only-one-review`) before submitting changes to GitHub.
- Guide the user to address any blockers, or proceed with explicit confirmation.
- Create or update the GitHub Pull Request cleanly using the `only-one-pr-git-skill` and GitHub MCP.

## Purpose

Ensure zero defects reach production by auditing branch diffs through the 5-Axis Quality Gate before creating or updating Pull Requests.

---

## 1. Skills Catalog

Activate and apply these skills throughout the PR workflow:

| Skill | Trigger condition (Use When) | Core Purpose (What It Does) |
| :--- | :--- | :--- |
| **`code-review-and-quality`** | Step 1 (Pre-PR Review Gate) | Audit branch changes across 5 axes (Correctness, Security, Simplicity, Performance, Test Coverage) and classify findings. |
| **`only-one-pr-git-skill`** | Step 2, 3, 4 (PR drafting & creation) | Validate Git preflight state, draft conventional PR title/body using standard template, and call GitHub MCP. |

---

## 2. Step-by-Step Execution Protocol

### Step 1 — Pre-PR Quality Gate (5-Axis Review)

1. Perform a thorough 5-axis review of all changes between current branch and `<base-branch>` (invoking the logic from `/only-one-review`).
2. Display the **Pre-PR Review Findings**:

```markdown
### 🔍 Pre-PR Quality Gate Results

- **Branch**: `<current-branch>` $\rightarrow$ `<base-branch>`
- **Files Changed**: `N` files (`+X / -Y` lines)
- **Verdict**: `READY TO MERGE` | `WARNINGS FOUND` | `BLOCKERS DETECTED`

| Severity | Axis | File | Finding & Recommendation |
| :--- | :--- | :--- | :--- |
| ... | ... | ... | ... |
```

3. **Decision Gate**:
   - If 🔴 **BLOCKER** findings exist:
     - Prompt the user:
       > *"🔴 Blockers detected during review. What would you like to do?"*
       > 1. **Fix issues first** (Apply fixes before creating PR).
       > 2. **Skip and proceed** (User explicitly acknowledges and bypasses review warnings).
     - Stop and wait for user response before proceeding to Step 2.
   - If only 🟡 **WARNINGS**, 🔵 **SUGGESTIONS**, or verdict is `READY TO MERGE`:
     - Highlight findings briefly and proceed to Step 2.

---

### Step 2 — Git Preflight Checks

1. Verify that current branch is not equal to `<base-branch>`.
2. Check that working tree has no uncommitted changes (`git status`).
3. Check that source branch has no unpushed commits against remote.
4. Ensure source branch has commits / diff against `<base-branch>`.

---

### Step 3 — Draft PR Title and Description

1. **Title**: `<tag>: <imperative summary in English>` (e.g. `feat: add soft-delete machine handling`).
2. **PR Body (English)**: Follow standard PR template covering:
   - **Summary**: Concise overview of changes.
   - **Problem & Solution**: Business context and technical approach.
   - **Testing & Verification**: Tests executed and validation evidence.
3. **Chat Preview**: Display the drafted title, base branch, English PR body, and a short Vietnamese summary for user review.

---

### Step 4 — Confirmation & GitHub Mutation

1. **Request User Confirmation**: Always ask for explicit confirmation before calling GitHub MCP.
2. Check for an existing open PR for this branch:
   - If an open PR exists: show its URL and ask whether to update `title/body` or keep existing.
   - If no PR exists: create the new Pull Request via GitHub MCP.
3. Output the final PR URL and summary status.

---

## 3. Completion Summary

```markdown
## 🚀 Pull Request Created / Updated

- **PR URL**: <github-pr-url>
- **Title**: `<tag>: <title>`
- **Base Branch**: `<base-branch>` ⟵ **Source**: `<current-branch>`
- **Quality Gate**: `Passed` (or `Bypassed by user`)
```

---

## Guardrails

- Never call GitHub mutation tools before explicit user confirmation.
- Never write Vietnamese into the GitHub PR body on GitHub (PR body on GitHub must be English).
- Do not commit, push, or delete Git branches during this workflow.
- If GitHub MCP is unavailable, stop and instruct the user to run `only-one init mcp github`.
