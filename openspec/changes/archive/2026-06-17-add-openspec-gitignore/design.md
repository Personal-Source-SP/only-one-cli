## Context

When the `only-one` CLI runs the `init` command, it executes `executeInitCommand` to configure selected tools, packages, skills, and configuration templates. At the end of the initialization process, it updates the project's `.gitignore` file using the `updateGitignore` helper. 

We want the default `.gitignore` to use `# AI ignores` as the section header and contain:
```
# AI ignores
.agent/
openspec/
adr
openspec
```

## Goals / Non-Goals

**Goals:**
- Update `sectionHeader` in `gitignore.ts` to `# AI ignores`.
- Ensure that the `.gitignore` update logic automatically appends the requested default patterns (`.agent/`, `openspec/`, `adr`, `openspec`) when updating.
- Make sure paths do not get formatted with a trailing slash if they are not meant to have one, or handle the specific user list precisely (e.g. keeping `adr` and `openspec` as-is, and `.agent/` and `openspec/` as-is).

**Non-Goals:**
- We do not want to alter gitignore formatting for other features that might depend on standard behaviors.

## Decisions

### 1. Update `updateGitignore` and the helper logic in `gitignore.ts`
We will change `sectionHeader` to `# AI ignores` and ensure that the list of paths to ignore is appended under this section, preserving exact patterns like `.agent/`, `openspec/`, `adr`, and `openspec`.

## Risks / Trade-offs

- **[Risk]** Overwriting custom `.gitignore` rules.
  - *Mitigation*: We check if the pattern is already present in `.gitignore` before appending.

## Open Questions

None.

