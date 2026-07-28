# only-one

CLI for developer environment setup, AI agent workspace management, OpenSpec workflows, and supported editor configuration synchronization.

## Requirements

- **Node.js 22+**
- Git
- `@fission-ai/openspec` for OpenSpec projects; `only-one init` can install it when needed

## Install

```bash
npm install -g only-one
```

## Quick Start

```bash
# Initialize workspace tools, packages, and configurations
only-one init

# Apply predefined package, plugin, skill, rule, workflow, and MCP setup
only-one combo idsd-flow

# Check environment readiness
only-one doctor

# Open interactive terminal dashboard
only-one tui
```

Run `only-one <command> --help` for complete command options.

## Commands

### `init`

Initialize a project through selectable setup steps.

```bash
only-one init [path] [options]
only-one init --step skills --tool antigravity,claude
only-one init --skip configs,packages /path/to/project
```

Available focused subcommands:

```bash
only-one init package [path] [names]
only-one init skill [path] [names]
only-one init configs [path] [names]
only-one init combo [path] [names]
only-one init mcp [names]
```

OpenSpec setup normalizes Antigravity output, reports initialization failures, and avoids copying symlinked legacy skills.

## OpenSpec profiles

- `frontend-flow` installs `openspec-fe`, selecting `intent-driven-fe`.
- `backend-flow` installs `openspec-be`, selecting `intent-driven-be`.
- Both config assets copy to project `openspec/`; select one profile per initialization. Do not combine both assets in one project because they share destination.

Use OpenSpec directly; FE/BE planning and implementation slash workflows are not installed:

```bash
openspec propose <change-name>
openspec instructions proposal --change <change-name> --json
openspec instructions specs --change <change-name> --json
openspec instructions design --change <change-name> --json
openspec instructions tasks --change <change-name> --json
openspec apply <change-name>
```

Read returned instructions before creating each artifact or applying work. Installed profile schema defines artifact format, required skill/tool gates, phase acceptance, feedback rework, and checkbox tracking.

### `skill`

Manage and synchronize custom agent skills for selected tools.

```bash
only-one skill [path] [names] --tool cursor
```

Supported command-facing agent targets are Antigravity, Claude, Cursor, and Codex.

### `workflow`

Manage and synchronize bundled agent workflows.

```bash
only-one workflow [path] [names] --tool cursor
```

Bundled workflows cover bounded feature planning, TDD implementation, evidence-driven bug fixes, accessible UI work, GitHub pull requests, Clockify logging, and OpenSpec propose/apply/archive/explore flows. Implementation workflows include approval gates, GitNexus discovery, verification, and safe worktree cleanup guidance.

### `plugin`

Install target-specific agent plugins.

```bash
only-one plugin [path] [ids]
```

Plugin installation follows each target's supported method. Manual commands are printed when automated installation is unavailable.

### `rule`

Manage and copy persistent agent rules.

```bash
only-one rule [path] [ids]
```

Rules provide reusable architecture, tooling, testing, review, and workflow constraints for supported agents.

### `mcp`

Merge global MCP server definitions into supported agent configurations.

```bash
only-one mcp [names] --ide antigravity,claude,cursor,codex
only-one mcp github,clockify
only-one mcp gitnexus --ide antigravity,claude,cursor
```

MCP synchronization supports Antigravity, Claude, Cursor, and Codex JSON or TOML configuration formats. Existing malformed selected configurations fail before writes.

GitNexus runs `npx -y gitnexus@latest mcp` with `GITNEXUS_MCP_READ_ONLY=1` by default. Run `npx gitnexus analyze` in target repository before agent code discovery.

### `combo`

Initialize project from predefined combinations of packages, plugins, skills, rules, workflows, configurations, and MCP servers.

```bash
only-one combo [path] [names]
only-one combo idsd-flow
```

Before installation, combo preflight groups dependencies as installed, missing, partial, or unsupported. Existing components remain unchecked by default during overwrite confirmation.

### `package`

Install packages from typed package registry with environment validation and interactive selection.

```bash
only-one package [path] [names]
```

Bundled package definitions include:

- `@fission-ai/openspec`: global npm package
- `ui-ux-pro-max-cli`: global npm package

### `structure-generate`

Scaffold structural blueprint for agent code discovery.

```bash
only-one structure-generate [path]
only-one structure-generate --output ./custom-blueprint.md
only-one structure-generate --status
```

### `update`

Refresh installed agent skills and workflow templates.

```bash
only-one update [path] [--force]
```

### `tui`

Launch interactive terminal dashboard.

```bash
only-one tui
```

### `doctor`

Check Git, Node.js, and CLI environment readiness.

```bash
only-one doctor
```

### `setting-vs`

Merge bundled settings into Antigravity or Cursor user settings on macOS and Windows.

```bash
only-one setting-vs [settings] --editors antigravity,cursor
```

- Source settings win on key conflicts.
- Target-only settings remain unchanged.
- Writes use backup journal and rollback on failure or recoverable termination.

### `extensions-vs`

Install missing bundled extension IDs through Antigravity or Cursor CLI.

```bash
only-one extensions-vs [extensions] --editors antigravity,cursor
```

- Existing extensions remain installed.
- Only missing selected extensions are installed.
- Progress increases monotonically from 0 to 100.
- Interrupted runs recover from `.only-one/vs-sync-journal.json`.

## Ignore Templates

Initialization can merge bundled Git, Docker, and npm ignore templates. Git ignore merging preserves project-specific entries, writes named sections, normalizes directory rules, and deduplicates equivalent rules.

## Workflow Integrations

### GitHub Pull Requests

`only-one-pr-git` requires its bundled skill, GitHub MCP server, and `GITHUB_PERSONAL_ACCESS_TOKEN` in selected agent MCP environment.

### Clockify

`only-one-clockify` requires its bundled skill, Clockify MCP server, and `CLOCKIFY_API_KEY`. Task lines use `[Label] Description | start-endh`; validation checks GMT+7 time ranges and overlaps before logging.

### OpenSpec

Bundled propose, apply, archive, and explore workflows support change artifacts, approval gates, test-driven execution, archive synchronization, and safe cleanup of eligible AI worktrees.

## Compatibility

Command-facing agent targets are Antigravity, Claude, Cursor, and Codex. Explicit unsupported target IDs fail before side effects.

`setting-vs` and `extensions-vs` support Antigravity and Cursor only.

Codex TOML writes preserve configuration semantics but may rewrite comments and formatting.

## JSON Output

Commands supporting shared output options can emit machine-readable JSON:

```bash
only-one --json init --step skills --yes
```

## Development

```bash
npm install
npm run dev -- --help
npm test
npm run build
npm run publish:local
```
