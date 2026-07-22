## Why

The static metadata registries (combos, packages, configs, mcps, vs settings) in `only-one-cli` are stored as JSON/YAML files. This requires disk I/O and runtime parsing, lacks static type safety, and is prone to runtime errors. Moving them to TypeScript constants under a renamed `assets/` directory resolves these problems. Additionally, workflows and skills are currently coupled/nested under skills, so we need to separate workflows into `assets/workflows/` and implement dependency validation flows between workflows and skills during CLI installation.

## What Changes

- Rename the physical `libraries/` directory to `assets/`.
- Convert static registry files (`combos/*.yaml`, `packages/*.yaml`, `mcps/*.json`, `vs/*.json`) into strongly-typed TypeScript modules in `src/core/assets/`.
- Keep templates and markdown files (`assets/skills/`, `assets/configs/`, `assets/workflows/`) as physical assets to copy.
- Implement two-way workflow-skill dependency checks in CLI prompts.
- Update core packages/commands (`init`, `skill`, `combo`, `mcp`, `vs`) to reference the new TypeScript-managed configs.
- Update the build and publish scripts to package `assets/` instead of `libraries/`.

## Capabilities

### New Capabilities

- `workflows-management`: Managing workflows under a dedicated `assets/workflows/` directory, and validating workflow-skill dependencies (e.g. auto-queuing required skills for workflows, and prompting to install associated workflows when a skill is installed).

### Modified Capabilities

None.

## Impact

Affects `src/core/init/`, `src/core/skill/`, `src/core/mcp/`, `src/core/combo/`, `src/core/vs/`, `package.json`, `scripts/publish.js`, and `scripts/publish-npm.sh`.
