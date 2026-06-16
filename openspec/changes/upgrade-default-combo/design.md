## Context

The current `default` combo configuration is limited and doesn't configure modern development aids like OpenSpec rules and required skills. By upgrading it to `idsd-flow` and ensuring that it installs and executes OpenSpec's init command with selected tools, we streamline the onboarding of new projects.

Templates in `libraries/configs` are organized by folders (e.g. `libraries/configs/openspec/config.yaml`) to mirror the target project layout and support multiple configuration files cleanly.

## Goals / Non-Goals

**Goals:**
- Rename `default.yaml` combo to `idsd-flow.yaml` with the upgraded packages and skills list.
- Store a default `config.yaml` template in `libraries/configs/openspec/config.yaml`.
- Recursively copy all contents of `libraries/configs/` directly to the project root directory `<projectDir>/` during project initialization.
- Automatically execute `npx openspec init --tools <selectedTools>` after `@fission-ai/openspec` package is installed.

**Non-Goals:**
- We do not run full openspec validations during only-one initialization.
- We do not manage global node/npm versions or installations outside of npm.

## Decisions

### Decision 1: Renaming and upgrading the combo
We will delete `libraries/combos/default.yaml` and create `libraries/combos/idsd-flow.yaml` with:
- name: "IDSD Flow Setup"
- description: "Predefined Intent-Spec-Driven development flow combo"
- packages: `["@fission-ai/openspec"]`
- skills: `["architectural-decision-records", "c4-diagrams", "gherkin-authoring", "grill-me", "openspec-git-discipline"]`

### Decision 2: Configuration Copying Step
In the execution phase of `executeInitCommand`, we will add a step that checks if the `libraries/configs` directory exists. If it does, we will recursively copy all files and folders inside `libraries/configs/` to the project root `<projectDir>/`. This ensures that a folder like `openspec` containing `config.yaml` is copied to `<projectDir>/openspec/config.yaml`.

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
