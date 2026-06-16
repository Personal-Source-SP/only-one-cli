## Context

We need to ensure that development-only, test-only, and specification-only folders (`.opencode`, `.agents`, `.agent`, `adr`, `openspec`, `test`) are pushed to Git normally but not published to npm.

## Goals / Non-Goals

**Goals:**
- Create `.npmignore` in the repository root to explicitly prevent `.opencode`, `.agents`, `.agent`, `adr`, `openspec`, and `test` from being packaged by npm.
- Verify that `.gitignore` does not contain ignore patterns for these directories.

**Non-Goals:**
- Modifying how build outputs (`dist`) or `libraries` are copied.

## Decisions

### 1. Creation of `.npmignore`
Add a `.npmignore` file at the root level containing the directories to be ignored.

```
.opencode
.agents
.agent
adr
openspec
test
```

### 2. Double-Check `.gitignore`
No modifications are needed for `.gitignore` as it currently does not ignore the target directories (only ignores node_modules and caches inside them).

## Risks / Trade-offs

None.
