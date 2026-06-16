## Why

Current `init` command delegates all tool selection and standard skill install to `openspec init`, then syncs custom skills from `.agents/skills/`. This is an unnecessary dependency on openspec CLI for core init functionality. The `libraries/` directory was created to house installable packages, skills, and templates, but the init flow doesn't leverage it yet. Users have no way to see what's available or selectively install components.

Bring init fully in-house: read from `libraries/` manifest, let user drive a 3-step interactive flow, and manage existence checks with confirmation prompts.

## What Changes

- **BREAKING**: Remove delegation to `openspec init` from the init flow
- **BREAKING**: Remove `--force`, `--no-install-skill`, `--tools` flags (no longer passed to openspec)
- Add 3-step interactive flow: (1) pick agent tools, (2) pick npm packages to install, (3) pick custom skills to copy
- Restructure `libraries/` directory:
  - `libraries/skills/` — pre-copied custom skill dirs (moved from `.agents/skills/`)
  - `libraries/templates/` — template dirs
  - `libraries/packages/` — per-package manifest files (npm name, version, scope)
- Remove `libraries/openspec-bootstrap/` and `libraries/custom-skills-sync/` (packages now managed via npm install from manifest)
- Add existence check + confirmation dialog at every step
- Move existing custom skills from `.agents/skills/` to `libraries/skills/`

## Capabilities

### New Capabilities

- `libraries-registry`: Define a manifest format for packages (npm), skills (pre-copied dirs), and templates under `libraries/`
- `init-interactive-flow`: Three-step guided init (tools → packages → skills) with existence checks and confirmations at each step
- `packages-install`: Read `libraries/packages/*.yaml`, render a multi-select prompt, install selected packages via `npm install -g <pkg>` (with local option)
- `skills-install`: Read `libraries/skills/` subdirectories, multi-select picker, copy selected skills into each selected tool's skills directory

### Modified Capabilities

- `init-command`: Changed from openspec-delegation orchestrator to fully-owned 3-step interactive init flow
- `custom-skills-sync`: Replaced by `skills-install` — no longer reads `.openspec.yaml` for tools; tools come from step 1 selection

## Impact

- Remove `libraries/openspec-bootstrap/` and `libraries/custom-skills-sync/`
- Remove `src/core/init/init-command.ts` openspec delegation logic
- Restructure `libraries/` with new subdir layout
- Move `.agents/skills/*` → `libraries/skills/*`
- Update `src/commands/init/command.ts` — new flags, new flow
- Update `src/core/init/types.ts` — new request/response types
- Add package manifest files under `libraries/packages/`
- `openspec init` delegation removed; `@fission-ai/openspec` becomes a regular package in `libraries/packages/` instead of hardcoded bootstrap logic
