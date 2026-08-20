# only-one

CLI for developer environment setup, AI agent workspace management, workflows, remote skills synchronization, and editor configuration syncing.

## Requirements

- **Node.js 22+**
- Git

## Install

```bash
npm install -g only-one
```

## Quick Start

```bash
# Initialize workspace tools, packages, and configurations
only-one init

# Apply predefined package, plugin, skill, rule, workflow, and MCP setup
only-one combo frontend-flow

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

### `combo`

Initialize a project from predefined combinations of packages, plugins, skills, rules, workflows, configurations, and MCP servers.

```bash
only-one combo [path] [names]
only-one combo frontend-flow
only-one combo backend-flow
only-one combo full-sdlc-flow
only-one combo git-timesheet-flow
only-one combo mcp-flow
```

Predefined combos include:

- `frontend-flow`: Next.js & React frontend toolkit with UI engineering and verification workflows.
- `backend-flow`: NestJS backend toolkit with architecture design, security hardening, and API standards.
- `full-sdlc-flow`: End-to-end SDLC enterprise toolkit (Ideation, 5-section planning, quality gates, timesheets, and review).
- `git-timesheet-flow`: GitHub PR, Clockify, and Intranet Timesheet logging integration.
- `mcp-flow`: Complete Model Context Protocol (MCP) server suite.

### `skill`

Manage and synchronize local and remote custom agent skills for selected tools.

```bash
only-one skill [path] [names] --tool cursor,antigravity
```

Supports automatic GitHub skill fetching with lockfile tracking (`only-one/skills-lock.json`). Supported targets: Antigravity, Claude, Cursor, and Codex.

### `workflow`

Manage and synchronize bundled agent workflows.

```bash
only-one workflow [path] [names] --tool cursor
```

Standardized workflows include:

- `only-one-idea`: Explore, refine, and validate rough ideas or vague requirements.
- `only-one-plan`: Research codebase and create a focused 5-section implementation plan.
- `only-one-apply`: Implement tasks from an approved plan with TDD and automated walkthrough creation.
- `only-one-debug`: Systematic 5-step Root Cause Analysis (RCA) and minimal verified bug fixes.
- `only-one-review`: 5-axis code health, security, simplicity, and performance review.
- `only-one-archive`: Distill completed tasks into concise single-file archives (`only-one/archives/`).
- `only-one-clean`: Consolidate related archives and purge stale task files.
- `only-one-clockify`: Validate task time entries and log to Clockify.
- `only-one-intranet`: Validate and log Intranet timesheet entries with monthly summary output.
- `only-one-pr-git`: Create or update GitHub PRs with quality gate checks.

### `rule`

Manage and copy persistent agent rules to target configuration directories.

```bash
only-one rule [path] [ids]
```

Available rules:

- `next-architecture-stack`: Next.js architecture guidelines, TypeScript boundaries, and verification standards.
- `nest-architecture-stack`: NestJS backend architecture, public contracts, and testing rules.
- `context-and-tools`: Context minimization and dependency discovery before code modifications.

### `mcp`

Merge global MCP server definitions into supported agent configurations.

```bash
only-one mcp [names] --ide antigravity,claude,cursor,codex
only-one mcp github,clockify,zodinet-timesheet,tavily,fetch,postgres,memory
```

MCP synchronization supports Antigravity, Claude, Cursor, and Codex JSON or TOML formats. Existing malformed configurations are checked before writes.

### `package`

Install packages from the typed package registry with environment validation.

```bash
only-one package [path] [names]
```

Bundled packages:

- `ui-ux-pro-max-cli`: Global UI/UX auditing and design intelligence tool.
- `wondelai/skills/system-design`: System design interview and distributed architecture skill.
- `ux-flow-designer`: UX flow designer & AI design system skill.

### `structure-generate`

Scaffold structural blueprint markdown for AI agent code discovery.

```bash
only-one structure-generate [path]
only-one structure-generate --output ./custom-blueprint.md
only-one structure-generate --status
```

### `update`

Refresh installed agent skills, lockfiles, and workflow templates.

```bash
only-one update [path] [--force]
```

### `tui`

Launch the full-featured interactive terminal dashboard.

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
- Writes use backup journal and rollback on failure.

### `extensions-vs`

Install missing bundled extension IDs through Antigravity or Cursor CLI.

```bash
only-one extensions-vs [extensions] --editors antigravity,cursor
```

- Only missing selected extensions are installed.
- Progress increases monotonically from 0 to 100.
- Interrupted runs recover from `.only-one/vs-sync-journal.json`.

## Ignore Templates

Initialization can merge bundled Git, Docker, and npm ignore templates. Git ignore merging preserves project-specific entries, writes named sections, normalizes directory rules, and deduplicates equivalent rules.

## Workflow Integrations

### GitHub Pull Requests

`only-one-pr-git` requires its bundled skill, GitHub MCP server, and `GITHUB_PERSONAL_ACCESS_TOKEN`.

### Clockify

`only-one-clockify` requires its bundled skill, Clockify MCP server, and `CLOCKIFY_API_KEY`. Task lines follow `[Label] Description | start-endh`.

### Intranet Timesheet

`only-one-intranet` requires its bundled skill, `zodinet-timesheet` remote MCP server, and `TIMESHEET_PAT`.

### Task Lifecycle (Archive & Clean)

`only-one-archive` and `only-one-clean` manage historical task documentation in `only-one/archives/` using frontmatter metadata.

## Compatibility

- Agent targets: **Antigravity**, **Claude**, **Cursor**, and **Codex**.
- Editor sync (`setting-vs`, `extensions-vs`): **Antigravity** and **Cursor**.
- OS: **macOS**, **Windows**, and **Linux** (CLI / target config sync).

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

## Author

**Kiem Nguyen**

- Email: [kiem.nguyen@zodinet.com](mailto:contact.kiem.nguyen@gmail.com)
- GitHub: [@Personal-Source-SP](https://github.com/Personal-Source-SP)

## License

MIT © [Kiem Nguyen](mailto:contact.kiem.nguyen@gmail.com)
