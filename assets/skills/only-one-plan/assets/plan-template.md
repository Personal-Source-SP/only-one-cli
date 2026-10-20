---
status: planned
slug: {{slug}}
created_at: {{created_at}}
started_at: ~
completed_at: ~
pr_url: ~
branch: ~
---

# Plan: {{title}}

## Section 1. Directory Structure Changes

```text
<visual tree of files to be added, modified, or deleted>
```

## Section 2. File Changes

### 1. `[MODIFY]` `path/to/file.ts`

- **Status**: `[ ]`
- **Context**: <Current mechanism in one sentence>.
- **Target Symbols / AST Seams**: `Class.methodName`.
- **Invariants**: <Constraint that must not be broken in one sentence>.
- **Depends On**: None.
- **Fast Test Command**: `npm test path/to/file.test.ts`.

> **Action**: <Brief one-sentence description of modification purpose>.

```diff
<unified diff>
```

## Section 3. Test Cases & Verification
- **Automated Tests**:
- **Manual Checks**:
