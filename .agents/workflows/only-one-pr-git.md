---
description: Create or update a GitHub PR from the current branch using validated Git state and GitHub MCP.
---

## Input

```text
/only-one-pr-git [--branch <base-branch>] [--tag <conventional-type>]
```

- `--branch`: Base branch. Default: `main`.
- `--tag`: Conventional Commit type. Default: `feat`.
- Supported tags: `feat`, `fix`, `refactor`, `style`, `chore`, `docs`, `test`, `perf`, `ci`, `build`.

## Role

You are a Lead Release Engineer. Validate Git state, draft a PR, and mutate GitHub only after explicit confirmation.

## Purpose

Create or update a GitHub Pull Request without coupling PR creation to any review workflow.

---

## 1. Skills Catalog

| Skill | Trigger condition (Use When) | Core Purpose (What It Does) |
| :--- | :--- | :--- |
| **`only-one-pr-git-skill`** | Every PR workflow step | Validate Git preflight, draft conventional PR title/body, and call GitHub MCP safely. |

---

## 2. Step-by-Step Execution Protocol

### Step 1 — Git Preflight Checks

1. Verify current branch differs from `<base-branch>`.
2. Check working tree state with `git status`.
3. Check source branch push state against remote.
4. Ensure source branch has commits or diff against `<base-branch>`.

### Step 2 — Draft PR Title and Description

1. Title: `<tag>: <imperative summary in English>`.
2. English PR body covers Summary, Problem & Solution, Testing & Verification.
3. Display title, base branch, body, and concise Vietnamese summary for user review.

### Step 3 — Confirmation & GitHub Mutation

1. Request explicit confirmation before GitHub MCP mutation.
2. Check existing open PR for branch.
3. Update existing PR or create new PR through GitHub MCP.
4. Output final PR URL and status.

## 3. Completion Summary

```markdown
## Pull Request Created / Updated

- **PR URL**: <github-pr-url>
- **Title**: `<tag>: <title>`
- **Base Branch**: `<base-branch>`
- **Source Branch**: `<current-branch>`
```

## Guardrails

- Never call GitHub mutation tools before explicit user confirmation.
- Never write Vietnamese into GitHub PR body.
- Do not commit, push, or delete branches during this workflow.
- If GitHub MCP is unavailable, stop and instruct the user to run `only-one init mcp github`.
