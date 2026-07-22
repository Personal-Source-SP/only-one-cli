# only-one

CLI for initializing OpenSpec workflow projects and managing structural agent skills.

## Install

```bash
npm install -g only-one
```

Requires **Node.js 18+**. Also requires `openspec` CLI (`@fission-ai/openspec`) — installed automatically when you run `init`.

## Quick Start

```bash
# Initialize project with openspec and agent skills
only-one init

# Generate structural blueprint
only-one structure-generate

# Check environment readiness
only-one doctor
```

## Commands

### `init`

Initialize project with openspec CLI and install custom agent skills.

```bash
only-one init [path] [options]
```

| Option               | Description                                                                 |
| -------------------- | --------------------------------------------------------------------------- |
| `--force`            | Pass `--force` to openspec init                                             |
| `--no-install-skill` | Skip openspec bootstrapping and custom skills sync                          |
| `--tools <tools>`    | Agent tools: `all`, `none`, or comma-separated ids (`cursor`, `claude`, …)  |

Flow:
1. Checks if `@fission-ai/openspec` is installed globally — installs if missing
2. Runs `openspec init [path]` with `--tools`/`--force` passthrough
3. Copies custom skills from `.agents/skills/` to each selected tool's skill directory

**Examples**

```bash
# Interactive init
only-one init

# Init without agent skills
only-one init --no-install-skill

# Non-interactive: install for Cursor and Claude
only-one init --tools cursor,claude
```

### `init mcp`

Merge global MCP configurations into Antigravity, Claude, Cursor, and Codex settings.

```bash
only-one init mcp [names] [options]
```

| Option         | Description                                                                 |
| -------------- | --------------------------------------------------------------------------- |
| `--ide <ides>` | Comma-separated targets: `antigravity`, `claude`, `cursor`, `codex`       |
| `--yes`        | Non-interactive mode, select all available MCPs and supported targets      |

**Examples**

```bash
# Configure all available MCPs for Cursor only
only-one init mcp --ide cursor --yes

# Configure github MCP for all supported targets
only-one init mcp github --ide antigravity,claude,cursor,codex
```

### Workflows

The CLI includes pre-built agent workflows:

1. **`pr-git` Workflow (GitHub PR creation)**
   - Requires `only-one-pr-git-skill` skill and `github` MCP server.
   - Requires setting `GITHUB_PERSONAL_ACCESS_TOKEN` in the IDE's MCP environment config file (e.g. Cursor's `mcp.json`).
   - Standardizes PR titles, formats body to `references/pr-template.md`, and requests explicit confirmation.

3. **`only-one-clockify`**: Validate and log Clockify time entries for task lists.
   - Requires `only-one-clockify-skill` skill and `clockify` MCP server.
   - Requires setting `CLOCKIFY_API_KEY` in the IDE's MCP environment config file.
   - Parses task format `[Label] Description | start-endh`, validates overlapping slots in GMT+7, and logs to Clockify.

### `structure-generate`

Generate a structural blueprint markdown file for the project.

```bash
only-one structure-generate [path] [options]
```

### `update`

Refresh installed structural agent skills for tools listed in `agent_tools`.

```bash
only-one update [path] [--force]
```

### `doctor`

Check environment readiness and CLI configuration.

```bash
only-one doctor
```

### `setting-vs`

Merge `libraries/vs/settings.json` into Antigravity or Cursor user settings on macOS/Windows.

```bash
only-one setting-vs --editors antigravity,cursor
```

- Source settings win when a key conflicts.
- Target-only settings are preserved.
- Command writes through a backup journal and rolls back on failure or recoverable termination.

### `extensions-vs`

Install missing extension IDs from `libraries/vs/extensions.json` through Antigravity or Cursor CLI.

```bash
only-one extensions-vs --editors antigravity,cursor
```

- Existing extensions are preserved.
- Only missing source extensions are installed.
- Progress is reported as monotonic percentages from 0 to 100.
- Interrupted runs recover from `.only-one/vs-sync-journal.json` before starting new mutations.

## Compatibility

Command-facing agent targets are limited to Antigravity, Claude, Cursor, and Codex. Other explicit target IDs now fail before side effects.

`setting-vs` and `extensions-vs` support only Antigravity and Cursor; VS Code is no longer selectable.

MCP sync supports JSON and TOML configuration files. Existing malformed configurations fail before writes. Codex TOML writes preserve configuration semantics, but may rewrite comments and formatting.

## JSON Output

Any command supports `--json` for machine-readable output:

```bash
only-one --json init --no-install-skill
```

## Development

```bash
# Install dependencies
npm install

# Run in dev mode
npm run dev -- --help

# Run tests
npm test

# Build
npm run build
```
