# only-one-cli

CLI for initializing OpenSpec workflow projects and managing structural agent skills.

## Install

```bash
npm install -g only-one-cli
```

Requires **Node.js 18+**. Also requires `openspec` CLI (`@fission-ai/openspec`) — installed automatically when you run `init`.

## Quick Start

```bash
# Initialize project with openspec and agent skills
only-one-cli init

# Generate structural blueprint
only-one-cli structure-generate

# Check environment readiness
only-one-cli doctor
```

## Commands

### `init`

Initialize project with openspec CLI and install custom agent skills.

```bash
only-one-cli init [path] [options]
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
only-one-cli init

# Init without agent skills
only-one-cli init --no-install-skill

# Non-interactive: install for Cursor and Claude
only-one-cli init --tools cursor,claude
```

### `structure-generate`

Generate a structural blueprint markdown file for the project.

```bash
only-one-cli structure-generate [path] [options]
```

### `structure-apply`

Apply a structural blueprint to the project.

```bash
only-one-cli structure-apply [path] [options]
```

### `update`

Refresh installed structural agent skills for tools listed in `agent_tools`.

```bash
only-one-cli update [path] [--force]
```

### `doctor`

Check environment readiness and CLI configuration.

```bash
only-one-cli doctor
```

## JSON Output

Any command supports `--json` for machine-readable output:

```bash
only-one-cli --json init --no-install-skill
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
