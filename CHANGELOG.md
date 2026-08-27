# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

## 1.0.3 (2026-08-27)

### Improvements

- **CLI Help & Metadata Update**: Updated CLI help texts, command examples (`package`, `git`, `tui`), and synced version to 1.0.3.
- **Workflow & Skills Alignment**: Refined workflow descriptions, step-by-step skill execution bindings, and standardized SDLC guidelines across all bundled workflow assets.

## 1.0.0 (2026-08-20)

### Major Highlights

- **Remote Skill Synchronization & Lockfile**: Native remote GitHub skill fetching, inspection, and lockfile resolution (`only-one/skills-lock.json`) with deterministic hash verification.
- **Task Lifecycle Workflows**: End-to-end task distillation via `only-one-archive` and maintenance via `only-one-clean` with YAML frontmatter markdown archives (`only-one/archives/`).
- **Full SDLC & Timesheet Integration**: Standardized 10 workflows with English terminology, quality gates, and automated walkthrough generation, plus Intranet and Clockify timesheet integrations.

### Features

- **Remote Skill Engine**: Added `github-fetcher`, `inspector`, and `lockfile` modules in `src/core/skill/remote/` allowing automated synchronization of remote GitHub skills.
- **Task Lifecycle Management**: Added `only-one-archive` and `only-one-clean` workflows for structured task distillation into single-file archives and live-code consolidation.
- **Intranet Timesheet Integration**: Added `only-one-intranet` workflow and `only-one-intranet-skill` integrated with the `zodinet-timesheet` remote MCP.
- **Curated Engineering Skills**: Expanded skill catalog to 22 skills spanning all SDLC phases (Define, Architecture, Build, Review, Quality Gates).
- **Curated Architecture Combos**: Reorganized combos into `frontend-flow`, `backend-flow`, `full-sdlc-flow`, `git-timesheet-flow`, and `mcp-flow`.
- **Package Registry Additions**: Added `ui-ux-pro-max-cli`, `wondelai/skills/system-design`, and `ThomasPraun/ux-flow-designer`.
- **Architecture Rules**: Added `next-architecture-stack`, `nest-architecture-stack`, and `context-and-tools` persistent rules.

### Refactoring & Improvements

- Standardized all bundled workflow templates to English defaults and terminology.
- Migrated skills lockfile path to `only-one/skills-lock.json` with multi-path resolution and backward compatibility.
- Consolidated timesheet combo definitions and removed legacy/unused MCP presets.
- Updated Antigravity configuration paths to match current target specs.

## 0.0.7 (2026-08-07)

### Features

- Added 6 dedicated Ink-based TUI view components (`ComboView`, `WorkflowView`, `RuleView`, `PluginView`, `StructureView`, `UpdateView`) in `src/tui/views/`.
- Achieved strict 1-to-1 parity between terminal subcommands (`combo`, `workflow`, `rule`, `plugin`, `structure-generate`, `update`, `setting-vs`, `extensions-vs`) and interactive TUI menu dashboard.

### Refactoring & Consolidation

- Consolidated specialized Next.js sub-skills (`dev-loop`, `cache-components`, `partial-prefetching`) and standalone React/UI-UX skills into single master skill `only-one-nextjs-development`.
- Removed deprecated extension `signageos.signageos-vscode-sops` from default VS Code library manifest.

## 0.0.5 (2026-07-27)

### Requirements

- Node.js 22 or newer is required by the current terminal UI dependency stack.

### Features

- Added first-class `package`, `plugin`, `rule`, `workflow`, and `combo` management with interactive target selection and non-interactive options.
- Added combo dependency preflight and grouped status reporting for installed, missing, partial, and unsupported components.
- Added an Ink-based interactive terminal dashboard through `only-one tui`.
- Added bundled planning, implementation, debugging, UI, pull-request, Clockify, OpenSpec, review, and verification workflows and skills.
- Added safe OpenSpec archive and AI worktree cleanup guidance.
- Added section-aware Git ignore template merging with rule deduplication, preserving existing project entries.
- Expanded metadata manifests for workflows, combos, plugins, rules, and assets.

### Fixes

- Normalized OpenSpec Antigravity output and surfaced initialization failures.
- Skipped symlinked legacy skills during Antigravity normalization.
- Normalized default Git ignore directory entries with trailing slashes.
- Left already-installed combo components unchecked during overwrite confirmation.
- Removed empty VS synchronization journal directories after successful commits.

### Internal

- Moved skill installation into combo target selection and removed deprecated bundled skill assets.
- Expanded workflow contracts with code intelligence discovery, approval gates, TDD, browser evidence, and proportional verification.

## 0.0.3 (2026-07-23)

### Breaking Changes

- Command-facing agent targets now support only Antigravity, Claude, Cursor, and Codex. Explicit unsupported target IDs fail before side effects.
- `setting-vs` and `extensions-vs` now support only Antigravity and Cursor. VS Code is no longer selectable.
- MCP synchronization now fails before writes when an existing selected configuration is malformed.

### Features

- MCP sync supports Claude JSON and Codex TOML configuration files, in addition to Antigravity and Cursor.
- Added `workflow` management for installing and synchronizing bundled agent workflows.
- Added `claude-code`, `gruvbox`, and `vscode-icons` to the VS extension manifest.
- Added interactive setting selection and overwrite confirmation to `setting-vs`.
- Added optional Git, Docker, and npm ignore templates to sync commands; existing ignore rules remain unchanged.

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
