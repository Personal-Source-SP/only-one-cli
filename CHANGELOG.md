# Changelog

All notable changes to this project will be documented in this file.

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
