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

### `structure-generate`

Generate a structural blueprint markdown file for the project.

```bash
only-one structure-generate [path] [options]
```

### `structure-apply`

Apply a structural blueprint to the project.

```bash
only-one structure-apply [path] [options]
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
