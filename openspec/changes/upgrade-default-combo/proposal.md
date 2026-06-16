## Why

The current `default` combo configuration is basic and lacks integration with the modern OpenSpec workflow. Upgrading and renaming it to `idsd-flow` (Intent-Spec-Driven Flow) will enable developers to use a standardized set of packages, skills, and configuration templates, and automatically initialize them with the selected agent or CLI tools.

Additionally, template configurations in `libraries/configs/` should match the directory structure of the target project (e.g., putting OpenSpec configuration under `libraries/configs/openspec/config.yaml` instead of the root of `libraries/configs/`) to avoid confusion as more configuration files are added in the future.

## What Changes

- Rename the `default` combo to `idsd-flow`.
- Update the combo definition to include the `@fission-ai/openspec` package.
- Include a robust set of development skills in the combo: `architectural-decision-records`, `c4-diagrams`, `gherkin-authoring`, `grill-me`, and `openspec-git-discipline`.
- Support post-install/initialization execution for the `@fission-ai/openspec` package, running `openspec init --tools <selectedTools>` with the selected agent tools/CLIs.
- Add a template configuration file at `libraries/configs/openspec/config.yaml` (copied from `openspec/config.yaml`) and copy all templates under `libraries/configs/` recursively to the target project directory during initialization.

## Capabilities

### New Capabilities
- `idsd-flow-combo`: A new predefined combo named `idsd-flow` containing the updated packages, skills, and configs.
- `configs-copy`: A new step/capability in the `init` command that copies configuration templates recursively from `libraries/configs/` to the target project directory (preserving directory structure, e.g., copying `libraries/configs/openspec/config.yaml` to `<projectDir>/openspec/config.yaml`).

### Modified Capabilities
- `packages-install`: Enhance package installation to support running post-installation commands, specifically executing `openspec init --tools <tools>` after installing `@fission-ai/openspec`.

## Impact

- `libraries/combos/default.yaml` will be deleted and replaced by `libraries/combos/idsd-flow.yaml`.
- `libraries/configs/openspec/config.yaml` will be added.
- `src/core/init/init-command.ts` will be modified to support executing post-install initialization and recursively copying configs.
