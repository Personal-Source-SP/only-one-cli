---
name: only-one-pr-git
description: Use when creating or updating a GitHub Pull Request from the current branch with automated Git state validation.
---

# Only-One PR Git (Pull Request Management Skill)

## Overview

This skill prepares, validates, and publishes GitHub pull requests from local branch changes following repository standards.

## Input

```text
/only-one-pr-git [--branch <base-branch>] [--tag <conventional-type>]
```

- `--branch`: Base branch. Default: `main`.
- `--tag`: Conventional Commit type. Default: `feat`.
- Supported tags: `feat`, `fix`, `refactor`, `style`, `chore`, `docs`, `test`, `perf`, `ci`, `build`.

## Available Scripts

- **`scripts/check-git-status.ts`**: Deterministically checks branch readiness, uncommitted files, and unpushed commits.
  ```bash
  npx tsx assets/skills/only-one-pr-git/scripts/check-git-status.ts
  ```

## Role

### Assigned Persona & Authority
- **Assigned Persona**: **Release Operations Engineer**.
- **Core Mindset**: Ensure safe release workflows, adhere to Conventional Commits, and validate git state prior to opening Pull Requests.
- **Allowed Actions**:
  - Inspect `git status`, `git branch`, and `git log`.
  - Draft PR title and body adhering to standard GitHub Markdown conventions.
  - Create or update Pull Requests via GitHub MCP.
- **Forbidden Actions**:
  - 🛑 **STRICTLY FORBIDDEN to force-push** to protected branches (`main`, `master`, `production`).
  - 🛑 **STRICTLY FORBIDDEN to open a PR** while git working tree is dirty or tests are failing.
- **Artifact Contract**: GitHub Pull Request URL.

You are a Lead Release Engineer. Validate Git state, draft a PR, and mutate GitHub only after explicit confirmation.

## Purpose

Create or update a GitHub Pull Request without coupling PR creation to any review workflow.

---

## 1. Required References & Assets

- **Template**: Read `assets/pr-template.md` before drafting the PR body.
- **MCP Server**: Use `github` MCP server for fetching and creating Pull Requests.

---

## 2. Step-by-Step Execution Protocol

### Step 1 — Git Preflight Checks

1. Run `scripts/check-git-status.ts` to deterministically verify git readiness.
2. Verify current branch differs from `<base-branch>`.
3. Check working tree state has no uncommitted files.
4. Ensure source branch has commits or diff against `<base-branch>`.

### Step 2 — Draft PR Title and Description

1. Title: `<tag>: <imperative summary in English>`.
2. English PR body MUST use the exact Markdown structure from `assets/pr-template.md`.
3. Display title, base branch, body, and concise Vietnamese summary for user review in chat.

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
