## Context

The current `default` combo configuration is limited and doesn't configure modern development aids like OpenSpec rules and required skills. By upgrading it to `idsd-flow` and ensuring that it installs and executes OpenSpec's init command with selected tools, we streamline the onboarding of new projects.

Rather than hardcoding copy rules for configuration templates, we will introduce a configuration index manifest at `libraries/configs/index.yaml`. This file defines the template configurations and their exact file mappings (from templates directory to target project path). We will also support config selection as an interactive Step 4.

## Goals / Non-Goals

**Goals:**
- Rename `default.yaml` combo to `idsd-flow.yaml` with the upgraded packages, skills list, and `configs: ["openspec"]`.
- Store a default `config.yaml` template in `libraries/configs/openspec/config.yaml`.
- Create a configuration index file at `libraries/configs/index.yaml` specifying configuration templates.
- Support a `configs` property on the `ComboManifest` interface.
- Add an interactive selection step (Step 4: Configuration Templates) if configs step is not skipped.
- Load `libraries/configs/index.yaml` and copy only the selected configuration files and directories mapped to the project root directory `<projectDir>/` during project initialization.
- Automatically execute `npx openspec init --tools <selectedTools>` after `@fission-ai/openspec` package is installed.

**Non-Goals:**
- We do not run full openspec validations during only-one initialization.
- We do not manage global node/npm versions or installations outside of npm.

## Decisions

### Decision 1: Configuration Index File (`libraries/configs/index.yaml`)
We will create `libraries/configs/index.yaml` with the following structure:
```yaml
openspec:
  description: "OpenSpec configurations template"
  files:
    - src: "openspec/config.yaml"
      dest: "openspec/config.yaml"
```

### Decision 2: Interactive step and Configuration Copying Step based on Index
During the orchestrator execution:
- Support `ConfigsStepResult` and `configsStep` in types.
- Gather all selected configs from the chosen combos into a merged set/array (e.g. `selectedConfigNames = ['openspec']`).
- If custom flow is used, prompt the user for configuration templates selection (Step 4).
- Read `libraries/configs/index.yaml` and parse it using `js-yaml`.
- If `selectedConfigNames` is not empty, for each config name in it:
  - Lookup the config entry in the parsed index.
  - For each file entry in its `files` array:
    - Target source path: `join(configsDir, entry.src)`
    - Target destination path: `join(projectDir, entry.dest)`
    - Ensure destination directory exists.
    - Copy the file recursively.

### Decision 3: Post-Install initialization of `@fission-ai/openspec`
In the package execution step in `init-command.ts`, if the package `@fission-ai/openspec` is installed:
- Map the selected agent/cli tools to their `value` IDs.
- Run `npx openspec init --tools <comma_separated_tool_ids>` in the project directory.

## Risks / Trade-offs

- **Risk**: `openspec` command might not be available or fails during init.
- **Mitigation**: Run via `npx openspec` which resolves locally or fetches, and log failures as warnings rather than crashing the entire process.

## Migration Plan

- Remove the deprecated `default` combo.
- Users can run `only-one init --combo idsd-flow` or select `idsd-flow` from the combo selection prompt.

## Open Questions

None at this time.
