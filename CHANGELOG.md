# Changelog

All notable changes to this project will be documented in this file.

## 0.3.1 (2026-05-29)

### Features

- **Client-side pre-indexing:** `index:create` builds GitNexus and CocoIndex artifacts locally under `.only-one-cli/`; `push-index` bundles and uploads them to the backend.
- **`status --index`:** Compare local manifest fingerprints with the remote index (states: not indexed, local-only, uploaded latest/stale, tool-version mismatch). Replaces `index:status`.
- **`list --versions`:** List uploaded prebuilt index versions with filtering by project and tag. Replaces `index:list`.
- **Backend code intelligence:** `search` (semantic + optional structural context), `impact`, and `call-graph` query commands against the API.
- **Backend project lifecycle:** `index` (git archive upload or re-index when `--project` is set), `push` (upload a zip), `remote-index` (clone via backend), `sync` (incremental job + logs), `list`, `status`, `jobs`, and `logs`.
- **`init` enhancements:** `--index-mode` (`local` | `docker`), `--project-name`, Git-derived default project name, and automatic persistence of backend `project` id after first upload.
- **Global configuration:** `~/.onlyonecli/config.yaml` for shared server, API key, and bulk defaults.
- **`search` configuration:** Optional `search:` section in `.onlyonecli.yml` (defaults for `top-k`, structural scope, cross-project tags).
- **Interactive search session** on TTY (`--interactive` / `--once`); plain output when piped (`--plain`).

### Refactoring & Internal

- Split monolithic `index.ts` into per-command modules under `commands/` (`search/`, `impact/`, `call-graph/`, `index/`, `push/`, `remote-index/`, `list/`, `status/`, `sync/`, `jobs/`, `logs/`, `doctor/`, etc.).
- Shared `_job-trigger` helper for `index` (full re-index) and `sync` (incremental).
- Extended API client for query endpoints, job triggers, zip upload, and remote Git indexing.
- Expanded Vitest coverage for search formatting, query validation, impact/call-graph, and command wiring.
- README rewritten with full command reference, configuration tables, and CI examples.

## 0.2.0 (2026-05-20)

### Features

- `bulk-index` command: Scan folder recursively for Git repositories, zip and upload them in batch.
- `doctor` command: Diagnose and validate the configuration, network, and CLI runtime dependencies (e.g. Node, git).
- Persistent `bulk:` section in configuration files (`.onlyonecli.yml` or global config) to manage bulk indexing defaults, custom exclusions, tags, and repo overrides.
- Deterministic path-prefix naming strategy for collision-free project naming when bulk indexing nested workspace paths.
- Auto-tagging with `group:<parent-folder>` on all bulk-indexed projects.

### Refactoring & Internal

- Restructured monolithic CLI implementation from `index.ts` into a structured, command-based layout under `commands/`.
- Introduced a dedicated `lib/` directory for modular logic (discovery, zipping, health checks).
- Expanded testing suite to achieve full coverage of command execution, validation rules, and configuration deep merges.
