## Why

The current `default` combo configuration is basic and lacks integration with the modern OpenSpec workflow. Upgrading and renaming it to `idsd-flow` (Intent-Spec-Driven Flow) will enable developers to use a standardized set of packages, skills, and configuration templates, and automatically initialize them with the selected agent or CLI tools.

Additionally, we need a generic mechanism for copying configuration templates from `libraries/configs/` to avoiding hardcoding copy paths for each configuration. Introducing a central index file (`libraries/configs/index.yaml`) mapping each configuration ID to its files (sources and destinations) makes the copying logic completely dynamic and extensible. Configs should also be integrated as a first-class step in the interactive initialization flow.

## What Changes

- Rename the `default` combo to `idsd-flow`.
- Update the combo definition to include the `@fission-ai/openspec` package, selected skills, and the `openspec` config.
- Include a robust set of development skills in the combo: `architectural-decision-records`, `c4-diagrams`, `gherkin-authoring`, `grill-me`, and `openspec-git-discipline`.
- Support post-install/initialization execution for the `@fission-ai/openspec` package, running `openspec init --tools <selectedTools>` with the selected agent tools/CLIs.
- Introduce support for a `configs` field in combo manifest files.
- Create an index file `libraries/configs/index.yaml` specifying configuration templates and their file mappings (source relative path under `libraries/configs/` and target destination path under the project directory).
- Update the initialization command execution phase to load `libraries/configs/index.yaml` and copy only the files associated with the configs selected in the active combos or manually selected via the new interactive configs selection step (Step 4).

## Capabilities

### New Capabilities
- `idsd-flow-combo`: A new predefined combo named `idsd-flow` containing the updated packages, skills, and the `openspec` config reference.
- `configs-copy`: A new step/capability in the `init` command that loads `libraries/configs/index.yaml` and copies the specified files for the active combos' configurations or interactively selected configuration templates (Step 4).

### Modified Capabilities
- `packages-install`: Enhance package installation to support running post-installation commands, specifically executing `openspec init --tools <tools>` after installing `@fission-ai/openspec`.

## Impact

- `libraries/combos/default.yaml` will be deleted and replaced by `libraries/combos/idsd-flow.yaml`.
- `libraries/configs/openspec/config.yaml` will be added.
- `libraries/configs/index.yaml` will be added.
- `src/core/init/types.ts` will be updated to include `configs` in the `ComboManifest` interface and add `configsStep` support.
- `src/core/init/init-command.ts` will be modified to support parsing combo configs, loading the configurations index file, showing Step 4 for config selection, executing post-install initialization, and copying the selected configuration files.
