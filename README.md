# only-one-cli

> CLI for indexing codebases and running semantic search + code intelligence via the [Hybrid Codebase RAG](https://github.com/Zodinet/hybrid-codebase-rag) backend.

[![npm version](https://img.shields.io/npm/v/only-one-cli)](https://www.npmjs.com/package/only-one-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Table of Contents

- [Install](#install)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Global Options](#global-options)
- [Commands](#commands)
    - [init](#init)
    - [structural](#structural)
    - [update](#update)
    - [index](#index)
    - [push](#push)
    - [remote-index](#remote-index)
    - [sync](#sync)
    - [bulk-index](#bulk-index)
    - [search](#search)
    - [impact](#impact)
    - [call-graph](#call-graph)
    - [status](#status)
    - [list](#list)
    - [jobs](#jobs)
    - [logs](#logs)
    - [doctor](#doctor)
- [JSON Output](#json-output)
- [CI / Automation](#ci--automation)
- [Development](#development)

---

## Install

```bash
npm install -g only-one-cli
```

Requires **Node.js 18+** and **git** (for `index` and `bulk-index` commands).

---

## Quick Start

```bash
# 1. Start the backend (Docker)
docker run -p 3000:3000 ghcr.io/zodinet/hybrid-codebase-rag:latest

# 2. Initialize config in your project
only-one-cli init

# 3. Index the current repo (git archive → upload → index)
only-one-cli index --name my-project

# 4. Search your code
only-one-cli search "authentication middleware"

# 5. Understand impact before refactoring
only-one-cli impact validateUser
```

---

## Configuration

Options are resolved in priority order (highest wins):

| Priority | Source                                                                      |
| -------- | --------------------------------------------------------------------------- |
| 1        | CLI flags (`--server`, `--project`)                                         |
| 2        | Local config — `.onlyonecli.yml` in current working directory              |
| 3        | Global config — `~/.onlyonecli/config.yaml`                                |
| 4        | Environment variables (`HYBRID_SERVER`, `HYBRID_API_KEY`, `HYBRID_PROJECT`) |
| 5        | Defaults (`http://localhost:3000`)                                          |

**API key** — built-in constant `HYBRID_API_KEY_ENV` in `cli/src/core/runtime/credentials.ts` (default `dev-api-key` for local). Not in YAML. Legacy `api_key` / `api_key_env` in YAML are ignored.

### Local config (`.onlyonecli.yml`)

Create one interactively with `only-one-cli init`, or write it manually:

```yaml
server: http://localhost:3000
project: my-project # default project id for index/sync/search
include:
    - '**/*.ts'
    - '**/*.py'
    - docs/**/*.md
exclude:
    - node_modules/**
    - dist/**
incremental: true # default to incremental sync
```

### Global config (`~/.onlyonecli/config.yaml`)

Shared defaults across all projects on your machine:

```yaml
server: https://hybrid.example.com
project: my-default-project
```

Change `HYBRID_API_KEY_ENV` in `cli/src/core/runtime/credentials.ts` when pointing at another backend.

### Bulk config (`bulk:` section)

Controls behaviour of `bulk-index`. Can live in local or global config:

```yaml
bulk:
    depth: 3 # max directory depth to search for git repos (default: 3)
    concurrency: 2 # concurrent uploads (default: 1)
    exclude: # glob patterns to skip
        - vendor/*
        - archived/*
    tags: # tags applied to every discovered repo
        - team:platform
    repos: # per-repo overrides (keyed by inferred project name)
        my-org/api:
            name: api-gateway # override project name
            tags: [lang:typescript] # extra tags
        my-org/legacy:
            skip: true # exclude entirely
```

### Search config (`search:` section)

Optional defaults for `only-one-cli search`. Written automatically by `only-one-cli init`. CLI flags always override config values.

```yaml
search:
    # Defaults for only-one-cli search; CLI flags override these values when passed on the command line.
    top_k: 10 # Maximum number of results (-k, --top-k)
    snippet_lines: 8 # Max snippet lines per hit; 0 = show full excerpt (--snippet-lines)
    structural: false # Add GitNexus execution-flow context (--structural; per-project only)
    scope: per-project # per-project (default) or cross-project (--scope or --cross-project)
    tags: [] # Tag filters when scope is cross-project (--tag, repeatable)
    interactive: true # On a TTY, prompt to search again after results; false or --once disables
```

---

## Global Options

These flags apply to every command and must come **before** the command name:

| Flag             | Env var          | Description                                             |
| ---------------- | ---------------- | ------------------------------------------------------- |
| `--server <url>` | `HYBRID_SERVER`  | Backend server URL                                      |
| `--project <id>` | `HYBRID_PROJECT` | Default project / GitNexus repo id                      |
| `--json`         | —                | Print machine-readable JSON instead of formatted output |

API key: constant in `cli/src/core/runtime/credentials.ts` (`HYBRID_API_KEY_ENV`).

```bash
only-one-cli --server https://hybrid.example.com --project my-app search "auth"
```

---

## Commands

### `init`

Create a `.onlyonecli.yml` config file in the current directory.

```bash
only-one-cli init [options]
```

| Option                  | Description                                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `--server <url>`        | Backend server URL                                                                                                                         |
| `--project-name <name>` | Project name (`org/repo`)                                                                                                                  |
| `--index-mode <mode>`   | `local` or `docker`                                                                                                                        |
| `--force`               | Overwrite an existing config file                                                                                                          |
| `--no-install-skill`    | Skip agent skill install and tool prompts                                                                                                  |
| `--tools <tools>`       | `all` (30 agents), `none`, or comma-separated ids — same set as OpenSpec init (`cursor`, `claude`, `windsurf`, `codex`, `trae`, `kimi`, …) |

On success, `init` scaffolds `.only-one-cli/`. In interactive mode it asks whether to install structural agent skills; if yes, you pick one or more IDEs/agents. Selected tools are saved as `agent_tools` in `.onlyonecli.yml`.

**Examples**

```bash
# Interactive — prompts for values
only-one-cli init

# Non-interactive — supply flags (API key from credentials.ts)
only-one-cli init --server http://localhost:3000 --project-name my-org/my-project

# Overwrite existing config
only-one-cli init --server http://new-server:3000 --force

# Init without agent skills
only-one-cli init --no-install-skill

# Non-interactive: install for Cursor and Claude
only-one-cli init --tools cursor,claude --force --server http://localhost:3000 --project-name my-org/my-project
```

---

### `structural`

Scaffold structural blueprint output and print the agent playbook. Distinct from `search --structural` (GitNexus query augmentation).

Default blueprint path: `.only-one-cli/structurals/{organization}-{project}-structural.md` (from `organization` and `project` in `.onlyonecli.yml`). Upload the filled file with `only-one-cli push-index --skip-gitnexus --skip-cocoindex` (includes `structurals/` in the prebuilt bundle when present).

Unless `--no-install-skill` or `--status` is set, the CLI checks that structural skills exist for configured `agent_tools`. If missing, it offers the same install flow as `init` (confirm → pick agents). Declining install exits with an error; use `--no-install-skill` to scaffold only.

**Migration:** If you have `.only-one-cli/structural-blueprint.md`, move it to `.only-one-cli/structurals/{org}-{project}-structural.md` (run `only-one-cli structural --json` for the exact path) or regenerate via the agent skill.

```bash
only-one-cli structural [path] [options]
```

| Option               | Description                                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| `--output <path>`    | Explicit `.md` file, or index output directory (default: structurals path from config)                   |
| `--no-install-skill` | Skip skill check and install; scaffold only                                                              |
| `--tools <tools>`    | `all`, `none`, or comma-separated tool ids (non-interactive install when missing)                        |
| `--force`            | Overwrite existing skill/command when install runs                                                       |
| `--status`           | Report whether the blueprint file exists and which sections are missing (warns on legacy root blueprint) |

---

### `update`

Refresh installed structural agent skills for tools listed in `agent_tools` when the CLI version changes.

```bash
only-one-cli update [path] [--force]
```

Does not call the backend or require `--project`.

---

### `index`

Full index of a project. Operates in **two modes** depending on whether a project id is configured.

```bash
only-one-cli index [options]
```

| Option           | Description                                                                  |
| ---------------- | ---------------------------------------------------------------------------- |
| `--name <name>`  | Project name when creating via git archive (default: current directory name) |
| `--tag <tag...>` | Tag(s) to attach; repeatable (e.g. `--tag env:ci --tag team:backend`)        |

**Mode 1 — No project id configured** _(new project)_

Runs `git archive HEAD` on the current working directory, uploads the zip, and creates a new project — all in one step. Equivalent to:

```bash
git archive --format=zip HEAD > /tmp/repo.zip
only-one-cli push /tmp/repo.zip --name my-repo
```

```bash
# Archive cwd and push (name inferred from directory)
only-one-cli index

# Explicit name and tags
only-one-cli index --name my-repo --tag env:ci --tag team:platform

# Against a remote backend
only-one-cli --server https://hybrid.example.com index --name my-repo
```

**Mode 2 — Project id configured** _(re-index existing)_

Triggers a full re-index job on the existing project and streams its logs:

```bash
# Via config file / env
only-one-cli index

# Via flag
only-one-cli --project proj-123 index
```

---

### `push`

Upload a local `.zip` archive to the backend. Creates a new project and indexes its contents.

```bash
only-one-cli push <path> [options]
```

| Argument | Description                |
| -------- | -------------------------- |
| `<path>` | Path to the `.zip` archive |

| Option           | Description                                        |
| ---------------- | -------------------------------------------------- |
| `--name <name>`  | Project name (default: inferred from zip filename) |
| `--tag <tag...>` | Tag(s) to attach; repeatable                       |

**Examples**

```bash
# Minimal — name inferred from filename
only-one-cli push dist/my-project.zip

# With name and tags
only-one-cli push dist/my-project.zip --name my-project --tag env:staging --tag team:backend

# Build a zip from git, then push
git archive --format=zip HEAD > /tmp/repo.zip
only-one-cli push /tmp/repo.zip --name my-project
```

---

### `remote-index`

Tell the backend to clone and index a remote Git repository directly (no local clone needed).

```bash
only-one-cli remote-index <repo-url> [options]
```

| Argument     | Description        |
| ------------ | ------------------ |
| `<repo-url>` | Git repository URL |

| Option              | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `--name <name>`     | Project name (default: inferred from repo URL)       |
| `--branch <branch>` | Branch to clone (default: repo's default branch)     |
| `--pat <token>`     | Personal access token for private HTTPS repositories |
| `--tag <tag...>`    | Tag(s) to attach; repeatable                         |

**Examples**

```bash
# Public repo
only-one-cli remote-index https://github.com/nestjs/nest.git --name nestjs-core

# Private repo with PAT
only-one-cli remote-index https://github.com/org/private-api.git \
  --pat ghp_xxxx --branch develop --name private-api

# With tags
only-one-cli remote-index https://github.com/org/api.git \
  --tag team:backend --tag lang:typescript
```

---

### `sync`

Trigger an **incremental** re-index (only changed files since the last index) on an existing project and stream its logs.

```bash
only-one-cli sync
```

Requires `--project`, `HYBRID_PROJECT`, or `project` in config.

```bash
# Use project from config / env
only-one-cli sync

# Explicit project
only-one-cli --project my-project sync
```

---

### `bulk-index`

Scan a directory tree for git repositories, zip each one, and upload them in batch.

```bash
only-one-cli bulk-index [path] [options]
```

| Argument | Description                                                 |
| -------- | ----------------------------------------------------------- |
| `[path]` | Root directory to scan (default: current working directory) |

| Option                | Description                                                |
| --------------------- | ---------------------------------------------------------- |
| `--dry-run`           | Preview which repos would be indexed without uploading     |
| `--depth <n>`         | Max directory depth to search for git repos (default: `3`) |
| `--concurrency <n>`   | Number of simultaneous uploads (default: `1`)              |
| `--tag <tag...>`      | Extra tag(s) to add to every repo                          |
| `--exclude <glob...>` | Glob patterns to skip                                      |
| `--skip-existing`     | Skip repos already indexed                                 |

**Examples**

```bash
# Dry run — see what would be indexed
only-one-cli bulk-index /path/to/projects --dry-run

# Index all repos under a directory
only-one-cli bulk-index /path/to/projects

# Concurrency and depth
only-one-cli bulk-index /home/dev --depth 4 --concurrency 3

# With global tags and exclusions
only-one-cli bulk-index . --tag env:ci --exclude vendor/* --exclude archived/*

# Skip repos that are already indexed
only-one-cli bulk-index /path/to/projects --skip-existing
```

---

### `search`

Run semantic search across an indexed project.

```bash
only-one-cli search <query> [options]
```

| Argument  | Description                   |
| --------- | ----------------------------- |
| `<query>` | Natural-language search query |

| Option                | Description                                                                    |
| --------------------- | ------------------------------------------------------------------------------ |
| `-k, --top-k <n>`     | Maximum number of results (default: `10`)                                      |
| `--structural`        | Augment results with GitNexus execution-flow context                           |
| `--cross-project`     | Search across projects (requires `--tag`)                                      |
| `--scope <scope>`     | `per-project` (default) or `cross-project`                                     |
| `--tag <tag...>`      | Tag filter for cross-project search (repeatable)                               |
| `--plain`             | Plain text output (no ANSI/boxes; default when piped)                          |
| `--snippet-lines <n>` | Max lines per result snippet (default: `8`; `0` = full excerpt)                |
| `--interactive`       | After results, prompt to search again or exit (TTY; also `search.interactive`) |
| `--once`              | Single search only — no continue/exit prompt                                   |
| `--examples`          | Print copy-paste search recipes and exit (no API call)                         |

**Rich output (interactive terminal)**

```text
╭ Search ───────────────────────────────────────────────────────────────╮
│ Query    error handling in API routes                                 │
│ Results  2                                                            │
╰───────────────────────────────────────────────────────────────────────╯

#1  91% match · typescript
    demo-api
    src/middleware/error.ts · L24–41

      24 │ export function handleApiError(err: unknown) {
      25 │   logger.error(err);

  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─

#2  85% match · typescript
    …
```

Use `--plain` when piping to files or CI logs.

When a snippet is truncated, re-run with `--snippet-lines 0` to print the full search excerpt, or open the listed `file:line` in your editor for the complete file.

**Interactive session (TTY)**

After results, the CLI prompts to search again or exit. Disable with `--once`, `--plain`, `--json`, or `search.interactive: false` in config. Force with `--interactive`.

```bash
only-one-cli search "login flow"
# … results …
# ? What next?  › Search again / Exit
```

**Discover options**

```bash
only-one-cli search --examples    # copy-paste recipes
only-one-cli search --help        # full flag reference
```

**Examples**

```bash
# Basic search
only-one-cli search "error handling in API routes"

# Limit results
only-one-cli search "JWT validation" -k 5

# Include call graph / process context
only-one-cli search "database connection pooling" --structural

# Cross-project search (tag-scoped)
only-one-cli search "authentication middleware" --cross-project --tag group:platform

# JSON for scripting
only-one-cli search "webhook handler" --json | jq '.results[].filePath'
```

---

### `impact`

Run GitNexus impact analysis — shows what callers, processes, and modules would be affected by changing a symbol.

```bash
only-one-cli impact <symbol> [options]
```

| Argument   | Description                     |
| ---------- | ------------------------------- |
| `<symbol>` | Function, class, or method name |

| Option            | Description                    |
| ----------------- | ------------------------------ |
| `-d, --depth <n>` | Traversal depth (default: `3`) |

**Examples**

```bash
# Who calls validateUser, and what breaks if you change it?
only-one-cli impact validateUser

# Deeper traversal
only-one-cli impact AuthService --depth 5

# JSON output for CI
only-one-cli impact processPayment --json | jq '.risk'
```

---

### `call-graph`

Visualise the call graph for a symbol — who calls it and what it calls.

```bash
only-one-cli call-graph <symbol> [options]
```

| Argument   | Description                     |
| ---------- | ------------------------------- |
| `<symbol>` | Function, class, or method name |

| Option              | Description                               |
| ------------------- | ----------------------------------------- |
| `--direction <dir>` | `both` (default), `callers`, or `callees` |

**Examples**

```bash
# Both directions
only-one-cli call-graph handleRequest

# Only show callers
only-one-cli call-graph processPayment --direction callers

# Only show callees
only-one-cli call-graph DatabaseService --direction callees
```

---

### `status`

Show status details for a project.

```bash
only-one-cli status [project-id]
```

The project id can be passed as a positional argument, via `--project`, `HYBRID_PROJECT`, or config.

```bash
only-one-cli status
only-one-cli status my-project
only-one-cli --project my-project status --json
```

---

### `list`

List all indexed projects.

```bash
only-one-cli list [options]
```

| Option              | Description                                                     |
| ------------------- | --------------------------------------------------------------- |
| `--status <status>` | Filter by status: `all` (default), `ready`, `indexing`, `error` |

```bash
only-one-cli list
only-one-cli list --status ready
only-one-cli list --json | jq '.[].name'
```

---

### `jobs`

List recent indexing jobs (optionally filtered to the configured project).

```bash
only-one-cli jobs
only-one-cli --project my-project jobs
only-one-cli jobs --json
```

---

### `logs`

Stream or print logs from a specific indexing job.

```bash
only-one-cli logs <job-id>
```

```bash
only-one-cli logs job_abc123
only-one-cli logs job_abc123 --json
```

---

### `doctor`

Check environment readiness and CLI/backend configuration. Useful for debugging connectivity issues.

```bash
only-one-cli doctor
```

Checks include:

- `git` availability and version
- `node` version
- Backend server reachability
- API key presence

---

## Errors

Query commands (`search`, `impact`, `call-graph`) print actionable errors when validation or backend requests fail.

| Situation                  | What you see                                           | Fix                                                           |
| -------------------------- | ------------------------------------------------------ | ------------------------------------------------------------- |
| Missing project id         | `[search] Project id is required`                      | Set `--project`, `HYBRID_PROJECT`, or run `only-one-cli init` |
| Cross-project without tags | `[search] Cross-project search requires tags`          | Add `--tag group:platform`                                    |
| Structural + cross-project | `[search] Structural search requires a single project` | Drop `--cross-project` or omit `--structural`                 |
| Invalid `--direction`      | `[call-graph] Invalid --direction value`               | Use `callers`, `callees`, or `both`                           |
| API unauthorized           | `HYBRID_UNAUTHORIZED` with hints                       | Update `HYBRID_API_KEY_ENV` in `credentials.ts`               |
| API not found              | `HYBRID_NOT_FOUND` with hints                          | Run `only-one-cli list` to verify project id                  |
| Missing semantic index     | `documents.json` / `FileNotFoundError` hints           | Run `index:create` + `push-index`, or `index`/`sync`          |
| Server unreachable         | Connectivity message                                   | Run `only-one-cli doctor`                                     |

With `--json`, validation failures return `{ "error": { "code": "HYBRID_CLI_VALIDATION", "message": "..." } }`.

---

## JSON Output

Any command supports `--json` for machine-readable output, useful for scripting and CI pipelines:

```bash
# List projects as JSON
only-one-cli list --json

# Get risk level from impact analysis
only-one-cli --project my-app impact validateUser --json | jq '.risk'

# Extract file paths from search results
only-one-cli search "auth flow" --json | jq '.results[].filePath'

# Check project status in a script
STATUS=$(only-one-cli --project my-app status --json | jq -r '.status')
if [ "$STATUS" != "ready" ]; then echo "Not ready"; exit 1; fi
```

---

## CI / Automation

### GitHub Actions — index on push

```yaml
- name: Index codebase
  env:
      HYBRID_SERVER: ${{ secrets.HYBRID_SERVER }}
      HYBRID_API_KEY: ${{ secrets.HYBRID_API_KEY }}
  run: |
      npm install -g only-one-cli
      only-one-cli index --name ${{ github.repository }} --tag env:ci --tag branch:${{ github.ref_name }}
```

### Pre-commit check — fail if impact is HIGH

```bash
#!/bin/sh
RISK=$(only-one-cli impact "$CHANGED_SYMBOL" --json | jq -r '.risk')
if [ "$RISK" = "HIGH" ] || [ "$RISK" = "CRITICAL" ]; then
  echo "⚠️  Impact risk is $RISK — review callers before committing."
  exit 1
fi
```

### Bulk-index all repos in a monorepo

```bash
only-one-cli bulk-index ./services \
  --depth 2 \
  --concurrency 4 \
  --tag env:prod \
  --skip-existing \
  --json | jq '.[] | {name, status}'
```

---

## Development

Source layout (OpenSpec-style layering):

```text
cli/
  src/           Application source (no colocated tests)
  test/          Vitest suites (mirror src layout; import via @src/…)
  vitest.config.ts
```

```bash
# Clone the repo
git clone https://github.com/Zodinet/hybrid-codebase-rag.git
cd hybrid-codebase-rag/cli

# Install dependencies
npm install

# Run in dev mode (no build step)
npm run dev -- --help

# Run tests
npm test

# Build
npm run build

# Publish to npm
npm run publish:npm

# Install locally for end-to-end testing
npm run publish:local
```
