# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

### Breaking Changes

- Command-facing agent targets now support only Antigravity, Claude, Cursor, and Codex. Explicit unsupported target IDs fail before side effects.
- `setting-vs` and `extensions-vs` now support only Antigravity and Cursor. VS Code is no longer selectable.
- MCP synchronization now fails before writes when an existing selected configuration is malformed.

### Features

- MCP sync supports Claude JSON and Codex TOML configuration files, in addition to Antigravity and Cursor.

### Notes

- Codex TOML writes preserve configuration semantics, but may rewrite comments and formatting.

## 0.0.1 (2026-06-16)

### Features

- **Interactive Initialization Wizard:** Refactored the `init` command into a multi-step interactive wizard with tool status badges, predefined configuration combos for package and skill sets, and a pre-execution confirmation summary.
- **OpenSpec Agent Integration:** Introduced workflows (`propose`, `apply`, `archive`, `explore`) and custom agent skills to support automated, git-disciplined change management.
- **NPM Package Publishing Rules:** Configured `.npmignore` and updated publish scripts to exclude development directories while ensuring the `libraries/` directory is properly packaged.
- **CLI Renaming:** Renamed the CLI tool to `only-one`.

### Refactoring & Internal

- Relocated bootstrap modules to the `libraries` directory under the `@library/*` path alias.
- Switched internal imports across the codebase to the `@/` path alias.
- Removed deprecated `structure-pull` command and legacy `.opencode` directory configuration files.
