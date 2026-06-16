## Why

The repository contains directories used for development, testing, and specifications (`.opencode`, `.agents`, `.agent`, `adr`, `openspec`, `test`). These directories must be pushed to Git normally for collaboration but should not be included in the final published npm package to keep the package size minimal and avoid publishing development configurations.

## What Changes

- Create a `.npmignore` file in the root directory explicitly excluding:
  - `.opencode`
  - `.agents`
  - `.agent`
  - `adr`
  - `openspec`
  - `test`
- Verify that these folders are not ignored in `.gitignore` to ensure they are pushed to Git normally.

## Capabilities

### New Capabilities
- `publish-exclusion`: Explicitly exclude development, specification, and agent directories from the published npm package while keeping them tracked in the Git repository.

### Modified Capabilities

## Impact

- Root directory configuration files (adds `.npmignore`).
