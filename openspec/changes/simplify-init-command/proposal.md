## Why

Current `init` command mixes project configuration (server URL, project name, index mode, git remote, backend sync) with agent skill installation. Most of these config steps are unused or redundant when `openspec` CLI already handles project setup and tool selection. This creates confusion, duplicated logic, and maintenance burden.

Simplify `init` to focus on what matters: ensuring `openspec` is available, running its setup, and installing project-specific custom skills.

## What Changes

- **BREAKING**: Remove all project config prompts from `init` (server, project-name, index-mode, source-uri, default-branch, git-token, incremental indexing, overwrite confirmation)
- **BREAKING**: Remove `--server`, `--project-name`, `--index-mode`, `--source-uri`, `--default-branch`, `--git-token` flags from init command
- **BREAKING**: Remove config writing (`.onlyonecli.yml`), backend sync, structure scaffold, gitignore logic from init
- Add `openspec` CLI availability check — install globally if missing
- Add `openspec init` execution as the setup step (handles tool selection + standard skill installation)
- Add custom skills sync — copy `.agents/skills/` contents to each selected tool's skill directory
- Keep `--force`, `--no-install-skill`, `--tools` flags for compatibility (passed through to openspec init where applicable)
- Keep `[path]` argument for project directory

## Capabilities

### New Capabilities

- `openspec-bootstrap`: Verify and install `openspec` CLI globally, run `openspec init` to configure project and select AI tools
- `custom-skills-sync`: After openspec init, copy `.agents/skills/*` into each selected tool's skill directory (e.g., `.cursor/agents/skills/`, `.claude/agents/skills/`)

### Modified Capabilities

- `init-command`: Replaced from project-config + skill-setup hybrid to pure orchestrator: openspec bootstrap + custom skills sync

## Impact

- Remove ~150 lines from `src/core/init/init-command.ts`
- Remove `src/core/config/core.ts` references from init (config write, persist, sync)
- Remove backend sync import chain from init flow
- Remove `src/commands/init/types.ts` flags that are no longer needed
- Add new module for openspec bootstrap + custom skills copy
- Add `@fission-ai/openspec` as implicit global dependency (installed on demand)
